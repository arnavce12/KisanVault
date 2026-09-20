from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.record_schema import SummaryResponse
from app.services.summary_service import (
    generate_season_summary,
    generate_field_summary,
    generate_crop_summary,
)
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/summary", tags=["Summary"])


@router.get("/season", response_model=SummaryResponse)
def season_summary(
    field_name: str = Query(..., description="Name of the field"),
    season: str = Query(..., description="Season name e.g. 'Rabi 2024' or 'Kharif 2024'"),
    generate_ai: bool = Query(False, description="Whether to generate the AI narrative summary"),
    lang: Optional[str] = Query(None, description="Language code for AI summary translation"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = generate_season_summary(db, field_name, season, current_user.id, generate_ai, lang)
        return SummaryResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/field", response_model=SummaryResponse)
def field_summary(
    field_name: str = Query(..., description="Name of the field"),
    generate_ai: bool = Query(False, description="Whether to generate the AI narrative summary"),
    lang: Optional[str] = Query(None, description="Language code for AI summary translation"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = generate_field_summary(db, field_name, current_user.id, generate_ai, lang)
        return SummaryResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/crop", response_model=SummaryResponse)
def crop_summary(
    crop_name: str = Query(..., description="Name of the crop"),
    generate_ai: bool = Query(False, description="Whether to generate the AI narrative summary"),
    lang: Optional[str] = Query(None, description="Language code for AI summary translation"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = generate_crop_summary(db, crop_name, current_user.id, generate_ai, lang)
        return SummaryResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
