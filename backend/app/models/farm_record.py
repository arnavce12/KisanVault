from sqlalchemy import Column, String, Float, Date, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class FarmRecord(Base):
    __tablename__ = "farm_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    field_name = Column(String(100), nullable=False)
    crop_name = Column(String(100), nullable=False)
    season = Column(String(100), nullable=False)
    date = Column(Date, nullable=False)
    record_type = Column(String(50), nullable=False) # 'activity', 'expense', 'harvest'
    
    # Activity fields
    activity_type = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    quantity = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    cost = Column(Float, nullable=True)
    
    # Expense fields
    expense_type = Column(String(100), nullable=True)
    amount = Column(Float, nullable=True)
    
    # Harvest fields
    harvest_quantity = Column(Float, nullable=True)
    harvest_unit = Column(String(50), nullable=True)
    quality_notes = Column(Text, nullable=True)
    selling_price = Column(Float, nullable=True)
    total_revenue = Column(Float, nullable=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
