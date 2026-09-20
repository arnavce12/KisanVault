"""
summary_service.py
──────────────────
Generates AI-powered summaries for:
  - Season-level summary (field + season)
  - Field-level summary (all seasons)
  - Crop-level summary
"""

import logging
from typing import Optional, Dict, Any, List
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.activity import Activity
from app.models.expense import Expense
from app.models.harvest import Harvest
from app.models.crop import Crop
from app.models.field import Field
from app.config import settings

logger = logging.getLogger(__name__)


# ─── Data Aggregators ─────────────────────────────────────────────────────────

def _get_activities(
    db: Session,
    field_id: Optional[UUID] = None,
    crop_id: Optional[UUID] = None,
    season: Optional[str] = None,
) -> List[Activity]:
    q = db.query(Activity)
    if field_id:
        q = q.filter(Activity.field_id == field_id)
    if crop_id:
        q = q.filter(Activity.crop_id == crop_id)
    if season:
        # Join crops to filter by season
        q = q.join(Crop, Activity.crop_id == Crop.id).filter(Crop.season == season)
    return q.order_by(Activity.date).all()


def _get_expenses(
    db: Session,
    field_id: Optional[UUID] = None,
    crop_id: Optional[UUID] = None,
    season: Optional[str] = None,
) -> List[Expense]:
    q = db.query(Expense)
    if field_id:
        q = q.filter(Expense.field_id == field_id)
    if crop_id:
        q = q.filter(Expense.crop_id == crop_id)
    if season:
        q = q.join(Crop, Expense.crop_id == Crop.id).filter(Crop.season == season)
    return q.order_by(Expense.date).all()


def _get_harvests(
    db: Session,
    field_id: Optional[UUID] = None,
    crop_id: Optional[UUID] = None,
    season: Optional[str] = None,
) -> List[Harvest]:
    q = db.query(Harvest)
    if field_id:
        q = q.filter(Harvest.field_id == field_id)
    if crop_id:
        q = q.filter(Harvest.crop_id == crop_id)
    if season:
        q = q.join(Crop, Harvest.crop_id == Crop.id).filter(Crop.season == season)
    return q.order_by(Harvest.harvest_date).all()


def _compute_stats(
    activities: list,
    expenses: list,
    harvests: list,
) -> Dict[str, Any]:
    """Build stats dict from raw ORM objects."""
    activity_breakdown: Dict[str, int] = {}
    for a in activities:
        activity_breakdown[a.activity_type] = activity_breakdown.get(a.activity_type, 0) + 1

    expense_breakdown: Dict[str, float] = {}
    for e in expenses:
        expense_breakdown[e.expense_type] = expense_breakdown.get(e.expense_type, 0.0) + e.amount

    total_expenses = sum(e.amount for e in expenses)
    total_harvest_qty = sum(h.quantity for h in harvests)
    total_revenue = sum((h.total_revenue or 0) for h in harvests)

    return {
        "total_activities": len(activities),
        "total_expenses": round(total_expenses, 2),
        "total_harvest_quantity": round(total_harvest_qty, 2),
        "total_revenue": round(total_revenue, 2),
        "activity_breakdown": activity_breakdown,
        "expense_breakdown": {k: round(v, 2) for k, v in expense_breakdown.items()},
    }


# ─── LLM Summary Generator ────────────────────────────────────────────────────

def _generate_ai_summary(
    activities: list,
    expenses: list,
    harvests: list,
    context_label: str,
) -> str:
    """Call Groq LLM to generate a human-friendly farming summary."""
    total_expenses = sum(e.amount for e in expenses)
    total_revenue = sum((h.total_revenue or 0) for h in harvests)

    activity_lines = "\n".join(
        f"  - {a.activity_type} on {a.date}: {a.description or ''} "
        f"({a.quantity or ''} {a.unit or ''}, cost ₹{a.cost or 0})"
        for a in activities[:15]
    ) or "  No activities recorded."

    harvest_lines = "\n".join(
        f"  - {h.harvest_date}: {h.quantity} {h.unit or 'kg'}, "
        f"revenue ₹{h.total_revenue or 0}"
        for h in harvests
    ) or "  No harvests recorded."

    prompt = (
        f"Summarize this farming period for {context_label}:\n\n"
        f"Activities:\n{activity_lines}\n\n"
        f"Total Expenses: ₹{total_expenses:.2f}\n"
        f"Harvests:\n{harvest_lines}\n"
        f"Total Revenue: ₹{total_revenue:.2f}\n\n"
        f"Write a clear, practical 3-4 sentence summary for the farmer, "
        f"highlighting key activities, costs, and outcomes."
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
            model_name="llama-3.1-8b-instant",
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
    field_id: UUID,
    season: str,
) -> Dict[str, Any]:
    """Generate a full summary for a field+season combination."""
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise ValueError(f"Field {field_id} not found.")

    activities = _get_activities(db, field_id=field_id, season=season)
    expenses = _get_expenses(db, field_id=field_id, season=season)
    harvests = _get_harvests(db, field_id=field_id, season=season)

    stats = _compute_stats(activities, expenses, harvests)
    label = f"{field.field_name} — {season}"
    ai_summary = _generate_ai_summary(activities, expenses, harvests, label)

    return {
        "field_id": str(field_id),
        "field_name": field.field_name,
        "season": season,
        "crop_id": None,
        "crop_name": None,
        "ai_summary": ai_summary,
        "stats": stats,
    }


def generate_field_summary(db: Session, field_id: UUID) -> Dict[str, Any]:
    """Generate summary for a field across all seasons."""
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise ValueError(f"Field {field_id} not found.")

    activities = _get_activities(db, field_id=field_id)
    expenses = _get_expenses(db, field_id=field_id)
    harvests = _get_harvests(db, field_id=field_id)

    stats = _compute_stats(activities, expenses, harvests)
    ai_summary = _generate_ai_summary(activities, expenses, harvests, field.field_name)

    return {
        "field_id": str(field_id),
        "field_name": field.field_name,
        "season": None,
        "crop_id": None,
        "crop_name": None,
        "ai_summary": ai_summary,
        "stats": stats,
    }


def generate_crop_summary(db: Session, crop_id: UUID) -> Dict[str, Any]:
    """Generate summary for a specific crop."""
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise ValueError(f"Crop {crop_id} not found.")

    field = db.query(Field).filter(Field.id == crop.field_id).first()

    activities = _get_activities(db, crop_id=crop_id)
    expenses = _get_expenses(db, crop_id=crop_id)
    harvests = _get_harvests(db, crop_id=crop_id)

    stats = _compute_stats(activities, expenses, harvests)
    label = f"{crop.crop_name} ({crop.season or 'unknown season'})"
    ai_summary = _generate_ai_summary(activities, expenses, harvests, label)

    return {
        "field_id": str(crop.field_id),
        "field_name": field.field_name if field else None,
        "season": crop.season,
        "crop_id": str(crop_id),
        "crop_name": crop.crop_name,
        "ai_summary": ai_summary,
        "stats": stats,
    }
