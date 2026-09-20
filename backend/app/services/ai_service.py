"""
ai_service.py
─────────────
Handles natural-language query answering using:
  1. ChromaDB semantic search (vector_service)
  2. PostgreSQL full record fetch
  3. Groq LLM (Llama 3 via LangChain) to generate the answer
  4. Returns: answer + source_records (evidence traceability)
"""

import logging
from typing import List, Dict, Any, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.services.vector_service import query_similar
from app.models.activity import Activity
from app.models.expense import Expense
from app.models.harvest import Harvest
from app.models.crop import Crop
from app.models.field import Field
from app.config import settings

logger = logging.getLogger(__name__)


# ─── Record Fetcher ───────────────────────────────────────────────────────────

def _fetch_record(db: Session, record_id: str, table: str) -> Optional[Dict[str, Any]]:
    """Fetch a full record from PostgreSQL by ID and table name."""
    try:
        uid = UUID(record_id)
    except Exception:
        return None

    record = None
    if table == "activities":
        record = db.query(Activity).filter(Activity.id == uid).first()
        if record:
            field = db.query(Field).filter(Field.id == record.field_id).first()
            crop = db.query(Crop).filter(Crop.id == record.crop_id).first() if record.crop_id else None
            return {
                "id": str(record.id),
                "table": "activities",
                "activity_type": record.activity_type,
                "description": record.description,
                "quantity": record.quantity,
                "unit": record.unit,
                "date": str(record.date),
                "cost": record.cost,
                "field_name": field.field_name if field else None,
                "crop_name": crop.crop_name if crop else None,
                "season": crop.season if crop else None,
            }
    elif table == "expenses":
        record = db.query(Expense).filter(Expense.id == uid).first()
        if record:
            field = db.query(Field).filter(Field.id == record.field_id).first()
            crop = db.query(Crop).filter(Crop.id == record.crop_id).first() if record.crop_id else None
            return {
                "id": str(record.id),
                "table": "expenses",
                "expense_type": record.expense_type,
                "amount": record.amount,
                "description": record.description,
                "date": str(record.date),
                "field_name": field.field_name if field else None,
                "crop_name": crop.crop_name if crop else None,
                "season": crop.season if crop else None,
            }
    elif table == "harvests":
        record = db.query(Harvest).filter(Harvest.id == uid).first()
        if record:
            field = db.query(Field).filter(Field.id == record.field_id).first()
            crop = db.query(Crop).filter(Crop.id == record.crop_id).first()
            return {
                "id": str(record.id),
                "table": "harvests",
                "harvest_date": str(record.harvest_date),
                "quantity": record.quantity,
                "unit": record.unit,
                "quality_notes": record.quality_notes,
                "selling_price": record.selling_price,
                "total_revenue": record.total_revenue,
                "field_name": field.field_name if field else None,
                "crop_name": crop.crop_name if crop else None,
                "season": crop.season if crop else None,
            }
    elif table == "crops":
        record = db.query(Crop).filter(Crop.id == uid).first()
        if record:
            field = db.query(Field).filter(Field.id == record.field_id).first()
            return {
                "id": str(record.id),
                "table": "crops",
                "crop_name": record.crop_name,
                "season": record.season,
                "sowing_date": str(record.sowing_date) if record.sowing_date else None,
                "expected_harvest_date": str(record.expected_harvest_date) if record.expected_harvest_date else None,
                "status": record.status,
                "field_name": field.field_name if field else None,
            }
    return None


def _build_context(source_records: List[Dict[str, Any]]) -> str:
    """Format fetched records into a context string for the LLM."""
    lines = []
    for i, rec in enumerate(source_records, 1):
        lines.append(f"--- Record {i} ({rec.get('table', 'unknown')}) ---")
        for k, v in rec.items():
            if k not in ("id", "table") and v is not None:
                lines.append(f"  {k}: {v}")
        lines.append("")
    return "\n".join(lines)


# ─── LLM Caller ───────────────────────────────────────────────────────────────

def _call_llm(context: str, user_query: str) -> str:
    """
    Call Groq LLM (Llama 3.1 8B) via LangChain.
    Falls back to a rule-based answer if Groq key is missing.
    """
    if not settings.GROQ_API_KEY:
        # Graceful degradation: return structured context without LLM
        return (
            f"[AI Summary not available — GROQ_API_KEY not set]\n\n"
            f"Based on your farm records, here is the relevant information:\n\n{context}"
        )

    try:
        from langchain_groq import ChatGroq
        from langchain.schema import SystemMessage, HumanMessage

        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.1-8b-instant",
            temperature=0.2,
            max_tokens=1024,
        )

        messages = [
            SystemMessage(content=(
                "You are KisanVault, an AI farm assistant. "
                "Answer questions using ONLY the provided farm records. "
                "Be specific, factual, and helpful. "
                "Always mention the field name, crop, dates, and quantities when available. "
                "If the records do not contain enough information, say so clearly."
            )),
            HumanMessage(content=(
                f"Farm Records:\n{context}\n\n"
                f"Question: {user_query}"
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


# ─── Main Query Handler ───────────────────────────────────────────────────────

def handle_query(
    user_query: str,
    db: Session,
    user_id: str,
    n_results: int = 5,
) -> Dict[str, Any]:
    """
    Full RAG pipeline:
      1. Embed query → search ChromaDB
      2. Fetch full records from PostgreSQL
      3. Build context
      4. Call Groq LLM
      5. Return answer + source records (evidence traceability)
    """
    # Step 1: Semantic search
    hits = query_similar(user_query, n_results=n_results)

    if not hits:
        return {
            "answer": "No relevant farm records found for your query. Please add some records first.",
            "source_records": [],
            "query": user_query,
        }

    # Step 2 & 3: Fetch full records from PostgreSQL
    source_records = []
    for hit in hits:
        full = _fetch_record(db, hit["record_id"], hit["table"])
        source_records.append({
            "record_id": hit["record_id"],
            "table": hit["table"],
            "text_preview": hit["text_preview"],
            "distance": hit["distance"],
            "full_record": full,
        })

    # Step 4: Build context from non-null records
    non_null = [s["full_record"] for s in source_records if s["full_record"]]
    context = _build_context(non_null) if non_null else "No full record details available."

    # Step 5: Call LLM
    answer = _call_llm(context, user_query)

    return {
        "answer": answer,
        "source_records": source_records,
        "query": user_query,
    }
