"""
records.py — All CRUD record routes
  POST/GET /api/records/field(s)
  POST/GET /api/records/crop(s)
  POST/GET /api/records/activity(ies)
  POST/GET /api/records/expense(s)
  POST/GET /api/records/harvest(s)
  GET      /api/records/timeline
  GET      /api/records/filter
"""

import logging
from typing import List, Optional
from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.field import Field
from app.models.crop import Crop
from app.models.activity import Activity
from app.models.expense import Expense
from app.models.harvest import Harvest
from app.models.user import User
from app.schemas.record_schema import (
    FieldCreate, FieldOut,
    CropCreate, CropOut,
    ActivityCreate, ActivityOut,
    ExpenseCreate, ExpenseOut,
    HarvestCreate, HarvestOut,
    TimelineRecord,
)
from app.routes.auth import get_current_user
from app.services.vector_service import embed_and_store, delete_record

router = APIRouter(prefix="/api/records", tags=["Records"])
logger = logging.getLogger(__name__)


# ─── Helper: Embed record to Chroma after DB insert ───────────────────────────

def _embed_activity(activity: Activity, db: Session):
    field = db.query(Field).filter(Field.id == activity.field_id).first()
    crop = db.query(Crop).filter(Crop.id == activity.crop_id).first() if activity.crop_id else None
    try:
        embed_and_store(
            str(activity.id), "activities",
            {
                "field_name": field.field_name if field else "",
                "crop_name": crop.crop_name if crop else "",
                "season": crop.season if crop else "",
                "activity_type": activity.activity_type,
                "description": activity.description,
                "date": str(activity.date),
                "quantity": activity.quantity,
                "unit": activity.unit,
                "cost": activity.cost,
            }
        )
    except Exception as e:
        logger.warning(f"Chroma embed failed for activity {activity.id}: {e}")


def _embed_expense(expense: Expense, db: Session):
    field = db.query(Field).filter(Field.id == expense.field_id).first()
    crop = db.query(Crop).filter(Crop.id == expense.crop_id).first() if expense.crop_id else None
    try:
        embed_and_store(
            str(expense.id), "expenses",
            {
                "field_name": field.field_name if field else "",
                "crop_name": crop.crop_name if crop else "",
                "season": crop.season if crop else "",
                "expense_type": expense.expense_type,
                "amount": expense.amount,
                "description": expense.description,
                "date": str(expense.date),
            }
        )
    except Exception as e:
        logger.warning(f"Chroma embed failed for expense {expense.id}: {e}")


def _embed_harvest(harvest: Harvest, db: Session):
    field = db.query(Field).filter(Field.id == harvest.field_id).first()
    crop = db.query(Crop).filter(Crop.id == harvest.crop_id).first()
    try:
        embed_and_store(
            str(harvest.id), "harvests",
            {
                "field_name": field.field_name if field else "",
                "crop_name": crop.crop_name if crop else "",
                "season": crop.season if crop else "",
                "harvest_date": str(harvest.harvest_date),
                "quantity": harvest.quantity,
                "unit": harvest.unit,
                "selling_price": harvest.selling_price,
                "total_revenue": harvest.total_revenue,
                "quality_notes": harvest.quality_notes,
            }
        )
    except Exception as e:
        logger.warning(f"Chroma embed failed for harvest {harvest.id}: {e}")


def _embed_crop(crop: Crop, db: Session):
    field = db.query(Field).filter(Field.id == crop.field_id).first()
    try:
        embed_and_store(
            str(crop.id), "crops",
            {
                "field_name": field.field_name if field else "",
                "crop_name": crop.crop_name,
                "season": crop.season,
                "sowing_date": str(crop.sowing_date) if crop.sowing_date else "",
                "expected_harvest_date": str(crop.expected_harvest_date) if crop.expected_harvest_date else "",
                "status": crop.status,
            }
        )
    except Exception as e:
        logger.warning(f"Chroma embed failed for crop {crop.id}: {e}")


# ─── Field Endpoints ──────────────────────────────────────────────────────────

@router.post("/field", response_model=FieldOut, status_code=status.HTTP_201_CREATED)
def add_field(
    payload: FieldCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a new field for the authenticated farmer."""
    field = Field(**payload.model_dump(), user_id=current_user.id)
    db.add(field)
    db.commit()
    db.refresh(field)
    return FieldOut.model_validate(field)


@router.get("/fields", response_model=List[FieldOut])
def get_fields(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all fields for the authenticated farmer."""
    fields = db.query(Field).filter(Field.user_id == current_user.id).all()
    return [FieldOut.model_validate(f) for f in fields]


@router.delete("/field/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(
    field_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found.")
    db.delete(field)
    db.commit()


# ─── Crop Endpoints ───────────────────────────────────────────────────────────

@router.post("/crop", response_model=CropOut, status_code=status.HTTP_201_CREATED)
def add_crop(
    payload: CropCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a new crop to a field."""
    field = db.query(Field).filter(Field.id == payload.field_id, Field.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found or not owned by you.")

    crop = Crop(**payload.model_dump())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    _embed_crop(crop, db)
    return CropOut.model_validate(crop)


@router.get("/crops", response_model=List[CropOut])
def get_crops(
    field_id: Optional[UUID] = None,
    season: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all crops, optionally filtered by field and/or season."""
    user_field_ids = [f.id for f in db.query(Field).filter(Field.user_id == current_user.id).all()]
    q = db.query(Crop).filter(Crop.field_id.in_(user_field_ids))
    if field_id:
        q = q.filter(Crop.field_id == field_id)
    if season:
        q = q.filter(Crop.season == season)
    return [CropOut.model_validate(c) for c in q.order_by(Crop.created_at.desc()).all()]


# ─── Activity Endpoints ───────────────────────────────────────────────────────

@router.post("/activity", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def add_activity(
    payload: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add an activity record (irrigation, fertilizer, pesticide, etc.)."""
    field = db.query(Field).filter(Field.id == payload.field_id, Field.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found or not owned by you.")

    activity = Activity(**payload.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    _embed_activity(activity, db)
    return ActivityOut.model_validate(activity)


@router.get("/activities", response_model=List[ActivityOut])
def get_activities(
    field_id: Optional[UUID] = None,
    crop_id: Optional[UUID] = None,
    activity_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all activities with optional filters."""
    user_field_ids = [f.id for f in db.query(Field).filter(Field.user_id == current_user.id).all()]
    q = db.query(Activity).filter(Activity.field_id.in_(user_field_ids))
    if field_id:
        q = q.filter(Activity.field_id == field_id)
    if crop_id:
        q = q.filter(Activity.crop_id == crop_id)
    if activity_type:
        q = q.filter(Activity.activity_type == activity_type)
    return [ActivityOut.model_validate(a) for a in q.order_by(Activity.date.desc()).all()]


# ─── Expense Endpoints ────────────────────────────────────────────────────────

@router.post("/expense", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def add_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add an expense record."""
    field = db.query(Field).filter(Field.id == payload.field_id, Field.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found or not owned by you.")

    expense = Expense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    _embed_expense(expense, db)
    return ExpenseOut.model_validate(expense)


@router.get("/expenses", response_model=List[ExpenseOut])
def get_expenses(
    field_id: Optional[UUID] = None,
    crop_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all expenses."""
    user_field_ids = [f.id for f in db.query(Field).filter(Field.user_id == current_user.id).all()]
    q = db.query(Expense).filter(Expense.field_id.in_(user_field_ids))
    if field_id:
        q = q.filter(Expense.field_id == field_id)
    if crop_id:
        q = q.filter(Expense.crop_id == crop_id)
    return [ExpenseOut.model_validate(e) for e in q.order_by(Expense.date.desc()).all()]


# ─── Harvest Endpoints ────────────────────────────────────────────────────────

@router.post("/harvest", response_model=HarvestOut, status_code=status.HTTP_201_CREATED)
def add_harvest(
    payload: HarvestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a harvest record."""
    field = db.query(Field).filter(Field.id == payload.field_id, Field.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found or not owned by you.")

    harvest = Harvest(**payload.model_dump())
    db.add(harvest)
    db.commit()
    db.refresh(harvest)
    _embed_harvest(harvest, db)
    return HarvestOut.model_validate(harvest)


@router.get("/harvests", response_model=List[HarvestOut])
def get_harvests(
    field_id: Optional[UUID] = None,
    crop_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all harvests."""
    user_field_ids = [f.id for f in db.query(Field).filter(Field.user_id == current_user.id).all()]
    q = db.query(Harvest).filter(Harvest.field_id.in_(user_field_ids))
    if field_id:
        q = q.filter(Harvest.field_id == field_id)
    if crop_id:
        q = q.filter(Harvest.crop_id == crop_id)
    return [HarvestOut.model_validate(h) for h in q.order_by(Harvest.harvest_date.desc()).all()]


# ─── Timeline Endpoint ────────────────────────────────────────────────────────

@router.get("/timeline", response_model=List[TimelineRecord])
def get_timeline(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all records chronologically — activities, expenses, harvests.
    Returns a unified timeline sorted by date descending.
    """
    user_field_ids = [f.id for f in db.query(Field).filter(Field.user_id == current_user.id).all()]

    # Build a field name lookup
    field_map = {f.id: f.field_name for f in db.query(Field).filter(Field.user_id == current_user.id).all()}
    crop_map = {c.id: c for c in db.query(Crop).filter(Crop.field_id.in_(user_field_ids)).all()}

    records: List[TimelineRecord] = []

    # Activities
    for a in db.query(Activity).filter(Activity.field_id.in_(user_field_ids)).all():
        crop = crop_map.get(a.crop_id) if a.crop_id else None
        records.append(TimelineRecord(
            id=a.id,
            record_type="activity",
            date=a.date,
            field_id=a.field_id,
            field_name=field_map.get(a.field_id),
            crop_id=a.crop_id,
            crop_name=crop.crop_name if crop else None,
            season=crop.season if crop else None,
            title=f"{a.activity_type.replace('_', ' ').title()} — {field_map.get(a.field_id, '')}",
            details={
                "activity_type": a.activity_type,
                "description": a.description,
                "quantity": a.quantity,
                "unit": a.unit,
                "cost": a.cost,
            }
        ))

    # Expenses
    for e in db.query(Expense).filter(Expense.field_id.in_(user_field_ids)).all():
        crop = crop_map.get(e.crop_id) if e.crop_id else None
        records.append(TimelineRecord(
            id=e.id,
            record_type="expense",
            date=e.date,
            field_id=e.field_id,
            field_name=field_map.get(e.field_id),
            crop_id=e.crop_id,
            crop_name=crop.crop_name if crop else None,
            season=crop.season if crop else None,
            title=f"{e.expense_type} Expense — ₹{e.amount}",
            details={
                "expense_type": e.expense_type,
                "amount": e.amount,
                "description": e.description,
            }
        ))

    # Harvests
    for h in db.query(Harvest).filter(Harvest.field_id.in_(user_field_ids)).all():
        crop = crop_map.get(h.crop_id)
        records.append(TimelineRecord(
            id=h.id,
            record_type="harvest",
            date=h.harvest_date,
            field_id=h.field_id,
            field_name=field_map.get(h.field_id),
            crop_id=h.crop_id,
            crop_name=crop.crop_name if crop else None,
            season=crop.season if crop else None,
            title=f"Harvest — {crop.crop_name if crop else 'Unknown'} ({h.quantity} {h.unit or 'kg'})",
            details={
                "quantity": h.quantity,
                "unit": h.unit,
                "selling_price": h.selling_price,
                "total_revenue": h.total_revenue,
                "quality_notes": h.quality_notes,
            }
        ))

    # Sort by date descending
    records.sort(key=lambda r: r.date, reverse=True)
    return records[:limit]


# ─── Filter Endpoint ──────────────────────────────────────────────────────────

@router.get("/filter", response_model=List[TimelineRecord])
def filter_records(
    field_id: Optional[UUID] = None,
    crop_id: Optional[UUID] = None,
    activity_type: Optional[str] = None,
    season: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    record_type: Optional[str] = None,  # activity | expense | harvest
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Filter farm records by field, crop, activity type, season, date range, or record type.
    """
    user_field_ids = [f.id for f in db.query(Field).filter(Field.user_id == current_user.id).all()]
    field_map = {f.id: f.field_name for f in db.query(Field).filter(Field.user_id == current_user.id).all()}
    crop_map = {c.id: c for c in db.query(Crop).filter(Crop.field_id.in_(user_field_ids)).all()}

    records: List[TimelineRecord] = []

    # ── Activities ──
    if record_type in (None, "activity"):
        q = db.query(Activity).filter(Activity.field_id.in_(user_field_ids))
        if field_id:
            q = q.filter(Activity.field_id == field_id)
        if crop_id:
            q = q.filter(Activity.crop_id == crop_id)
        if activity_type:
            q = q.filter(Activity.activity_type == activity_type)
        if date_from:
            q = q.filter(Activity.date >= date_from)
        if date_to:
            q = q.filter(Activity.date <= date_to)
        if season:
            q = q.join(Crop, Activity.crop_id == Crop.id).filter(Crop.season == season)

        for a in q.all():
            crop = crop_map.get(a.crop_id) if a.crop_id else None
            records.append(TimelineRecord(
                id=a.id,
                record_type="activity",
                date=a.date,
                field_id=a.field_id,
                field_name=field_map.get(a.field_id),
                crop_id=a.crop_id,
                crop_name=crop.crop_name if crop else None,
                season=crop.season if crop else None,
                title=f"{a.activity_type.replace('_', ' ').title()} — {field_map.get(a.field_id, '')}",
                details={
                    "activity_type": a.activity_type,
                    "description": a.description,
                    "quantity": a.quantity,
                    "unit": a.unit,
                    "cost": a.cost,
                }
            ))

    # ── Expenses ──
    if record_type in (None, "expense"):
        q = db.query(Expense).filter(Expense.field_id.in_(user_field_ids))
        if field_id:
            q = q.filter(Expense.field_id == field_id)
        if crop_id:
            q = q.filter(Expense.crop_id == crop_id)
        if date_from:
            q = q.filter(Expense.date >= date_from)
        if date_to:
            q = q.filter(Expense.date <= date_to)
        if season:
            q = q.join(Crop, Expense.crop_id == Crop.id).filter(Crop.season == season)

        for e in q.all():
            crop = crop_map.get(e.crop_id) if e.crop_id else None
            records.append(TimelineRecord(
                id=e.id,
                record_type="expense",
                date=e.date,
                field_id=e.field_id,
                field_name=field_map.get(e.field_id),
                crop_id=e.crop_id,
                crop_name=crop.crop_name if crop else None,
                season=crop.season if crop else None,
                title=f"{e.expense_type} Expense — ₹{e.amount}",
                details={
                    "expense_type": e.expense_type,
                    "amount": e.amount,
                    "description": e.description,
                }
            ))

    # ── Harvests ──
    if record_type in (None, "harvest"):
        q = db.query(Harvest).filter(Harvest.field_id.in_(user_field_ids))
        if field_id:
            q = q.filter(Harvest.field_id == field_id)
        if crop_id:
            q = q.filter(Harvest.crop_id == crop_id)
        if date_from:
            q = q.filter(Harvest.harvest_date >= date_from)
        if date_to:
            q = q.filter(Harvest.harvest_date <= date_to)
        if season:
            q = q.join(Crop, Harvest.crop_id == Crop.id).filter(Crop.season == season)

        for h in q.all():
            crop = crop_map.get(h.crop_id)
            records.append(TimelineRecord(
                id=h.id,
                record_type="harvest",
                date=h.harvest_date,
                field_id=h.field_id,
                field_name=field_map.get(h.field_id),
                crop_id=h.crop_id,
                crop_name=crop.crop_name if crop else None,
                season=crop.season if crop else None,
                title=f"Harvest — {crop.crop_name if crop else 'Unknown'} ({h.quantity} {h.unit or 'kg'})",
                details={
                    "quantity": h.quantity,
                    "unit": h.unit,
                    "selling_price": h.selling_price,
                    "total_revenue": h.total_revenue,
                    "quality_notes": h.quality_notes,
                }
            ))

    records.sort(key=lambda r: r.date, reverse=True)
    return records
