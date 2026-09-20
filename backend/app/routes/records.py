from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.farm_record import FarmRecord
from app.routes.auth import get_current_user
from app.schemas.record_schema import UnifiedRecordCreate, UnifiedRecordResponse
from app.services.vector_service import embed_and_store

router = APIRouter(prefix="/api/records", tags=["Records"])

@router.post("/add", response_model=UnifiedRecordResponse)
def add_record(
    record: UnifiedRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Map details based on type
    details = record.details
    
    new_record = FarmRecord(
        user_id=current_user.id,
        field_name=record.field_name,
        crop_name=record.crop_name,
        season=record.season,
        date=record.date,
        record_type=record.record_type
    )

    if record.record_type == "activity":
        new_record.activity_type = details.get("activity_type")
        new_record.description = details.get("description")
        new_record.quantity = details.get("quantity")
        new_record.unit = details.get("unit")
        new_record.cost = details.get("cost")
    elif record.record_type == "expense":
        new_record.expense_type = details.get("expense_type")
        new_record.amount = details.get("amount")
        new_record.description = details.get("description")
    elif record.record_type == "harvest":
        new_record.harvest_quantity = details.get("harvest_quantity")
        new_record.harvest_unit = details.get("harvest_unit")
        new_record.quality_notes = details.get("quality_notes")
        new_record.selling_price = details.get("selling_price")
        new_record.total_revenue = details.get("total_revenue")
        
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    
    # Embed text
    non_null_details = ", ".join([f"{k}: {v}" for k, v in details.items() if v is not None])
    text_to_embed = f"Field: {record.field_name}, Crop: {record.crop_name}, Season: {record.season}, Date: {record.date}, Type: {record.record_type}, Details: {non_null_details}"
    
    # Store directly with record_id, using "farm_records" as table
    embed_and_store(str(new_record.id), "farm_records", text_to_embed)
    
    return new_record


@router.get("/fields", response_model=List[str])
def get_fields(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fields = db.query(FarmRecord.field_name).filter(FarmRecord.user_id == current_user.id).distinct().all()
    return [f[0] for f in fields if f[0]]


@router.get("/crops", response_model=List[str])
def get_crops(
    field: str = Query(..., description="Field name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crops = db.query(FarmRecord.crop_name).filter(
        FarmRecord.user_id == current_user.id, 
        FarmRecord.field_name == field
    ).distinct().all()
    return [c[0] for c in crops if c[0]]


@router.get("/filter", response_model=List[UnifiedRecordResponse])
def get_filtered_records(
    field: Optional[str] = None,
    crop: Optional[str] = None,
    season: Optional[str] = None,
    record_type: Optional[str] = None,
    activity_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(FarmRecord).filter(FarmRecord.user_id == current_user.id)
    
    if field and field.strip():
        q = q.filter(FarmRecord.field_name == field)
    if crop and crop.strip():
        q = q.filter(FarmRecord.crop_name == crop)
    if season and season.strip() and season != "All Seasons" and season != "All":
        q = q.filter(FarmRecord.season == season)
    if record_type and record_type.strip() and record_type != "All":
        # The frontend might pass "Activity,Expense" but filter requests just 1 type per record technically. 
        # Or multi-select could send a comma-separated list
        if "," in record_type:
            types = [t.strip().lower() for t in record_type.split(",")]
            q = q.filter(FarmRecord.record_type.in_(types))
        else:
            q = q.filter(FarmRecord.record_type == record_type.lower())
    if activity_type and activity_type.strip() and activity_type != "All":
        q = q.filter(FarmRecord.activity_type == activity_type)
    if date_from:
        q = q.filter(FarmRecord.date >= date_from)
    if date_to:
        q = q.filter(FarmRecord.date <= date_to)
        
    records = q.order_by(FarmRecord.date.desc()).all()
    return records
