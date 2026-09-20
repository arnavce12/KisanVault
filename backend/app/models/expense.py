import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    field_id = Column(UUID(as_uuid=True), ForeignKey("fields.id", ondelete="CASCADE"), nullable=False)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crops.id", ondelete="SET NULL"), nullable=True)
    expense_type = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    field = relationship("Field", back_populates="expenses")
    crop = relationship("Crop", back_populates="expenses")

    def __repr__(self):
        return f"<Expense id={self.id} type={self.expense_type} amount={self.amount}>"
