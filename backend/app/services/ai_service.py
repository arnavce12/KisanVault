import logging
from typing import List, Dict, Any, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.services.vector_service import query_similar
from app.models.farm_record import FarmRecord
from app.config import settings

logger = logging.getLogger(__name__)


def _fetch_record(
    db: Session,
    record_id: str,
    table: str,
    user_id: str,
) -> Optional[Dict[str, Any]]:
    """Fetch a full record by ID, strictly scoped to the authenticated user."""
    try:
        uid = UUID(record_id)
        owner_id = UUID(user_id)
    except (ValueError, TypeError, AttributeError):
        return None

    # Defense in depth: vector-search results are untrusted identifiers.
    # Always enforce tenant ownership again at the PostgreSQL boundary.
    record = (
        db.query(FarmRecord)
        .filter(
            FarmRecord.id == uid,
            FarmRecord.user_id == owner_id,
        )
        .first()
    )
    if not record:
        return None

    res = {
        "id": str(record.id),
        "table": "farm_records",
        "field_name": record.field_name,
        "crop_name": record.crop_name,
        "season": record.season,
        "date": str(record.date),
        "record_type": record.record_type,
    }

    if record.record_type == "activity":
        res.update({
            "activity_type": record.activity_type,
            "description": record.description,
            "quantity": record.quantity,
            "unit": record.unit,
            "cost": record.cost,
        })
    elif record.record_type == "expense":
        res.update({
            "expense_type": record.expense_type,
            "amount": record.amount,
            "description": record.description,
        })
    elif record.record_type == "harvest":
        res.update({
            "harvest_quantity": record.harvest_quantity,
            "harvest_unit": record.harvest_unit,
            "quality_notes": record.quality_notes,
            "selling_price": record.selling_price,
            "total_revenue": record.total_revenue,
        })

    return res


def _build_context(source_records: List[Dict[str, Any]]) -> str:
    """Format fetched records into a context string for the LLM."""
    lines = []
    for i, rec in enumerate(source_records, 1):
        lines.append(f"--- Record {i} ({rec.get('record_type', 'unknown')}) ---")
        for k, v in rec.items():
            if k not in ("id", "table", "record_type") and v is not None:
                lines.append(f"  {k}: {v}")
        lines.append("")
    return "\n".join(lines)


def _call_llm(context: str, user_query: str, original_query: Optional[str] = None) -> str:
    """Call Groq LLM via LangChain, with graceful fallback."""
    if not settings.GROQ_API_KEY:
        return (
            f"[AI Summary not available — GROQ_API_KEY not set]\n\n"
            f"Based on your farm records, here is the relevant information:\n\n{context}"
        )

    try:
        from langchain_groq import ChatGroq
        from langchain.schema import SystemMessage, HumanMessage

        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="openai/gpt-oss-20b",
            temperature=0.2,
            max_tokens=1024,
        )

        system_content = (
            "You are KisanVault, an AI farm assistant. "
            "Answer questions using ONLY the provided farm records. "
            "Be specific, factual, and helpful. "
            "Always mention the field name, crop, dates, and quantities when available. "
            "If the records do not contain enough information, say so clearly. "
            "IMPORTANT: Respond in a friendly, conversational, and natural paragraph format. "
            "Do NOT use bullet points or structured lists to regurgitate the record details. "
            "Do NOT use markdown formatting like bolding (**), italics, or asterisks. Respond in plain text only."
        )
        if original_query:
            system_content += (
                f"\n\nCRITICAL INSTRUCTION: The user originally asked their question in a native language: "
                f"'{original_query}'. YOU MUST DETECT THIS NATIVE LANGUAGE AND FORMULATE YOUR ENTIRE RESPONSE "
                "IN THAT EXACT SAME LANGUAGE. DO NOT RESPOND IN ENGLISH IF THE ORIGINAL QUERY WAS NOT IN ENGLISH."
            )

        messages = [
            SystemMessage(content=system_content),
            HumanMessage(content=(
                f"Farm Records:\n{context}\n\n"
                f"Question (English Translated for context): {user_query}\n"
                f"{f'Original Question: {original_query}' if original_query else ''}"
            )),
        ]

        response = llm.invoke(messages)
        return response.content

    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        return (
            f"[AI response unavailable due to error: {str(e)}]\n\n"
            f"Relevant farm records were found:\n\n{context}"
        )


def handle_query(
    user_query: str,
    db: Session,
    user_id: str,
    original_query: Optional[str] = None,
    n_results: int = 5,
) -> Dict[str, Any]:
    """
    Full RAG pipeline with tenant isolation:
      1. Search vectors scoped to the authenticated user.
      2. Fetch full records with a second PostgreSQL ownership check.
      3. Build context only from owned records.
      4. Call Groq LLM.
      5. Return answer + evidence sources.
    """
    hits = query_similar(
        user_query,
        n_results=n_results,
        where={"user_id": user_id},
    )

    if not hits:
        return {
            "answer": "No relevant farm records found for your query. Please add some records first.",
            "source_records": [],
            "query": user_query,
        }

    source_records = []
    for hit in hits:
        full = _fetch_record(
            db,
            hit["record_id"],
            hit["table"],
            user_id,
        )

        # Never expose a vector hit that fails the PostgreSQL ownership check.
        if not full:
            continue

        source_records.append({
            "record_id": hit["record_id"],
            "table": hit["table"],
            "text_preview": hit["text_preview"],
            "distance": hit["distance"],
            "full_record": full,
        })

    if not source_records:
        return {
            "answer": "No relevant farm records found for your query. Please add some records first.",
            "source_records": [],
            "query": original_query if original_query else user_query,
        }

    context = _build_context([s["full_record"] for s in source_records])
    answer = _call_llm(context, user_query, original_query)

    return {
        "answer": answer,
        "source_records": source_records,
        "query": original_query if original_query else user_query,
    }
