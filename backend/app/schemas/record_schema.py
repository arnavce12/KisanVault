from pydantic import BaseModel, Field
from datetime import date, datetime
from uuid import UUID
from typing import Optional, List, Any


# ─── Field Schemas ────────────────────────────────────────────────────────────

class FieldCreate(BaseModel):
    field_name: str
    location: Optional[str] = None
    area_acres: Optional[float] = None


class FieldOut(FieldCreate):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Crop Schemas ─────────────────────────────────────────────────────────────

class CropCreate(BaseModel):
    field_id: UUID
    crop_name: str
    season: Optional[str] = None
    sowing_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    status: Optional[str] = "active"


class CropOut(CropCreate):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Activity Schemas ─────────────────────────────────────────────────────────

VALID_ACTIVITY_TYPES = [
    "irrigation", "fertilizer", "pesticide",
    "field_preparation", "observation", "other"
]


class ActivityCreate(BaseModel):
    field_id: UUID
    crop_id: Optional[UUID] = None
    activity_type: str
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    date: date
    cost: Optional[float] = 0.0


class ActivityOut(ActivityCreate):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Expense Schemas ──────────────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    field_id: UUID
    crop_id: Optional[UUID] = None
    expense_type: str
    amount: float
    description: Optional[str] = None
    date: date


class ExpenseOut(ExpenseCreate):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Harvest Schemas ──────────────────────────────────────────────────────────

class HarvestCreate(BaseModel):
    crop_id: UUID
    field_id: UUID
    harvest_date: date
    quantity: float
    unit: Optional[str] = "kg"
    quality_notes: Optional[str] = None
    selling_price: Optional[float] = None
    total_revenue: Optional[float] = None


class HarvestOut(HarvestCreate):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Timeline / Filter Schemas ────────────────────────────────────────────────

class TimelineRecord(BaseModel):
    """Unified record shape for timeline and history views."""
    id: UUID
    record_type: str          # "activity" | "expense" | "harvest" | "crop"
    date: date
    field_id: UUID
    field_name: Optional[str] = None
    crop_id: Optional[UUID] = None
    crop_name: Optional[str] = None
    season: Optional[str] = None
    title: str                # human-readable headline
    details: dict             # full record data

    model_config = {"from_attributes": True}


# ─── Search / AI Schemas ──────────────────────────────────────────────────────

class SearchQuery(BaseModel):
    query: str
    n_results: Optional[int] = Field(default=5, ge=1, le=20)


class SourceRecord(BaseModel):
    record_id: str
    table: str
    text_preview: str
    distance: Optional[float] = None
    full_record: Optional[Any] = None


class SearchResponse(BaseModel):
    answer: str
    source_records: List[SourceRecord]
    query: str


# ─── Summary Schemas ──────────────────────────────────────────────────────────

class SummaryStats(BaseModel):
    total_activities: int
    total_expenses: float
    total_harvest_quantity: float
    total_revenue: float
    activity_breakdown: dict   # {type: count}
    expense_breakdown: dict    # {type: total_amount}


class SummaryResponse(BaseModel):
    field_id: Optional[UUID] = None
    field_name: Optional[str] = None
    season: Optional[str] = None
    crop_id: Optional[UUID] = None
    crop_name: Optional[str] = None
    ai_summary: str
    stats: SummaryStats
