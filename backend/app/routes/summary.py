"""
summary.py — AI Summary routes
  GET /api/summary/season    → Season-wise summary
  GET /api/summary/field     → Field-wise summary
  GET /api/summary/crop      → Crop-wise summary
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.field import Field
from app.models.crop import Crop
from app.schemas.record_schema import SummaryResponse
from app.services.summary_service import (
    generate_season_summary,
    generate_field_summary,
    generate_crop_summary,
)
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/summary", tags=["Summary"])


def _assert_field_ownership(field_id: UUID, current_user: User, db: Session) -> Field:
    field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found or not owned by you.")
    return field


@router.get("/season", response_model=SummaryResponse)
def season_summary(
    field_id: UUID = Query(..., description="UUID of the field"),
    season: str = Query(..., description="Season name e.g. 'Rabi 2024' or 'Kharif 2024'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate an AI summary for a specific field and season.
    Includes: activity breakdown, total expenses, total revenue, AI narrative.
    """
    _assert_field_ownership(field_id, current_user, db)
    try:
        result = generate_season_summary(db, field_id, season)
        return SummaryResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/field", response_model=SummaryResponse)
def field_summary(
    field_id: UUID = Query(..., description="UUID of the field"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate an AI summary for a field across all seasons.
    """
    _assert_field_ownership(field_id, current_user, db)
    try:
        result = generate_field_summary(db, field_id)
        return SummaryResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/crop", response_model=SummaryResponse)
def crop_summary(
    crop_id: UUID = Query(..., description="UUID of the crop"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate an AI summary for a specific crop.
    """
    # Verify ownership via crop → field
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found.")
    _assert_field_ownership(crop.field_id, current_user, db)

    try:
        result = generate_crop_summary(db, crop_id)
        return SummaryResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
