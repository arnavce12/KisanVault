from pydantic import BaseModel, Field
from datetime import date, datetime
from uuid import UUID
from typing import Optional, List, Any, Dict

# ─── Unified Farm Record Schemas ──────────────────────────────────────────────

class UnifiedRecordCreate(BaseModel):
    field_name: str
    crop_name: str
    season: str
    date: date
    record_type: str # "activity" | "expense" | "harvest"
    details: Dict[str, Any]


class UnifiedRecordResponse(BaseModel):
    id: UUID
    user_id: UUID
    field_name: str
    crop_name: str
    season: str
    date: date
    record_type: str
    
    activity_type: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    cost: Optional[float] = None
    
    expense_type: Optional[str] = None
    amount: Optional[float] = None
    
    harvest_quantity: Optional[float] = None
    harvest_unit: Optional[str] = None
    quality_notes: Optional[str] = None
    selling_price: Optional[float] = None
    total_revenue: Optional[float] = None
    
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Search / AI Schemas ──────────────────────────────────────────────────────

class SearchQuery(BaseModel):
    query: str
    original_query: Optional[str] = None
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
    field_id: Optional[str] = None
    field_name: Optional[str] = None
    season: Optional[str] = None
    crop_id: Optional[str] = None
    crop_name: Optional[str] = None
    ai_summary: Optional[str] = None
    stats: SummaryStats
