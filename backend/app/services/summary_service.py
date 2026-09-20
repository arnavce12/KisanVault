import logging
from typing import Optional, Dict, Any, List
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.farm_record import FarmRecord
from app.config import settings

logger = logging.getLogger(__name__)

# ─── Data Aggregators ─────────────────────────────────────────────────────────

def _get_records(
    db: Session,
    user_id: UUID,
    field_name: Optional[str] = None,
    crop_name: Optional[str] = None,
    season: Optional[str] = None,
    record_type: Optional[str] = None,
) -> List[FarmRecord]:
    q = db.query(FarmRecord).filter(FarmRecord.user_id == user_id)
    if field_name:
        q = q.filter(FarmRecord.field_name == field_name)
    if crop_name:
        q = q.filter(FarmRecord.crop_name == crop_name)
    if season and season != "All":
        q = q.filter(FarmRecord.season == season)
    if record_type:
        q = q.filter(FarmRecord.record_type == record_type)
    return q.order_by(FarmRecord.date).all()


def _compute_stats(records: List[FarmRecord]) -> Dict[str, Any]:
    """Build stats dict from unified FarmRecords."""
    activity_breakdown: Dict[str, int] = {}
    expense_breakdown: Dict[str, float] = {}
    
    total_activities = 0
    total_expenses = 0.0
    total_harvest_qty = 0.0
    total_revenue = 0.0

    for r in records:
        if r.record_type == "activity":
            total_activities += 1
            atype = r.activity_type or "unknown"
            activity_breakdown[atype] = activity_breakdown.get(atype, 0) + 1
            if r.cost:
                total_expenses += r.cost
                expense_breakdown["Activity Cost"] = expense_breakdown.get("Activity Cost", 0.0) + r.cost
        elif r.record_type == "expense":
            amount = r.amount or 0.0
            total_expenses += amount
            etype = r.expense_type or "unknown"
            expense_breakdown[etype] = expense_breakdown.get(etype, 0.0) + amount
        elif r.record_type == "harvest":
            qty = r.harvest_quantity or 0.0
            rev = r.total_revenue or 0.0
            total_harvest_qty += qty
            total_revenue += rev

    return {
        "total_activities": total_activities,
        "total_expenses": round(total_expenses, 2),
        "total_harvest_quantity": round(total_harvest_qty, 2),
        "total_revenue": round(total_revenue, 2),
        "activity_breakdown": activity_breakdown,
        "expense_breakdown": {k: round(v, 2) for k, v in expense_breakdown.items()},
    }


# ─── LLM Summary Generator ────────────────────────────────────────────────────

def _generate_ai_summary(records: List[FarmRecord], context_label: str) -> str:
    """Call LLM to generate a human-friendly farming summary."""
    activities = [r for r in records if r.record_type == "activity"]
    expenses = [r for r in records if r.record_type == "expense"]
    harvests = [r for r in records if r.record_type == "harvest"]

    total_expenses = sum(e.amount or 0 for e in expenses) + sum(a.cost or 0 for a in activities)
    total_revenue = sum(h.total_revenue or 0 for h in harvests)

    activity_lines = "\n".join(
        f"  - {a.activity_type} on {a.date}: {a.description or ''} "
        f"({a.quantity or ''} {a.unit or ''}, cost ₹{a.cost or 0})"
        for a in activities[:15]
    ) or "  No activities recorded."

    harvest_lines = "\n".join(
        f"  - {h.date}: {h.harvest_quantity} {h.harvest_unit or 'kg'}, "
        f"revenue ₹{h.total_revenue or 0}"
        for h in harvests
    ) or "  No harvests recorded."

    prompt = (
        f"Summarize this farming period for {context_label}:\n\n"
        f"Activities:\n{activity_lines}\n\n"
        f"Total Expenses: ₹{total_expenses:.2f}\n"
        f"Harvests:\n{harvest_lines}\n"
        f"Total Revenue: ₹{total_revenue:.2f}\n\n"
        f"Write a clear, practical 3-4 sentence summary for the farmer in a conversational, friendly paragraph. "
        f"Do NOT use bullet points or structured lists. Highlight key activities, costs, and outcomes naturally."
    )

    if not settings.GROQ_API_KEY:
        return (
            f"[AI Summary requires GROQ_API_KEY]\n\n"
            f"Summary for {context_label}: "
            f"{len(activities)} activities performed, "
            f"total expenses ₹{total_expenses:.2f}, "
            f"total harvest revenue ₹{total_revenue:.2f}."
        )

    try:
        from langchain_groq import ChatGroq
        from langchain.schema import HumanMessage

        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="openai/gpt-oss-20b",
            temperature=0.3,
            max_tokens=512,
        )
        response = llm.invoke([HumanMessage(content=prompt)])
        return response.content
    except Exception as e:
        logger.error(f"LLM summary failed: {e}")
        return (
            f"Summary for {context_label}: "
            f"{len(activities)} activities, "
            f"₹{total_expenses:.2f} expenses, "
            f"₹{total_revenue:.2f} revenue."
        )


# ─── Public Summary Functions ─────────────────────────────────────────────────

def generate_season_summary(
    db: Session,
    field_name: str,
    season: str,
    user_id: UUID,
    generate_ai: bool = False
) -> Dict[str, Any]:
    records = _get_records(db, user_id, field_name=field_name, season=season)
    stats = _compute_stats(records)
    label = f"{field_name} — {season}"
    
    ai_summary = None
    if generate_ai:
        ai_summary = _generate_ai_summary(records, label)

    return {
        "field_name": field_name,
        "season": season,
        "ai_summary": ai_summary,
        "stats": stats,
    }


def generate_field_summary(
    db: Session,
    field_name: str,
    user_id: UUID,
    generate_ai: bool = False
) -> Dict[str, Any]:
    records = _get_records(db, user_id, field_name=field_name)
    stats = _compute_stats(records)
    
    ai_summary = None
    if generate_ai:
        ai_summary = _generate_ai_summary(records, field_name)

    return {
        "field_name": field_name,
        "ai_summary": ai_summary,
        "stats": stats,
    }


def generate_crop_summary(
    db: Session,
    crop_name: str,
    user_id: UUID,
    generate_ai: bool = False
) -> Dict[str, Any]:
    records = _get_records(db, user_id, crop_name=crop_name)
    stats = _compute_stats(records)
    
    ai_summary = None
    if generate_ai:
        ai_summary = _generate_ai_summary(records, crop_name)

    return {
        "crop_name": crop_name,
        "ai_summary": ai_summary,
        "stats": stats,
    }
