import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Harvest(Base):
    __tablename__ = "harvests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crops.id", ondelete="CASCADE"), nullable=False)
    field_id = Column(UUID(as_uuid=True), ForeignKey("fields.id", ondelete="CASCADE"), nullable=False)
    harvest_date = Column(Date, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True, default="kg")
    quality_notes = Column(Text, nullable=True)
    selling_price = Column(Float, nullable=True)   # price per unit
    total_revenue = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    crop = relationship("Crop", back_populates="harvests")
    field = relationship("Field", back_populates="harvests")

    def __repr__(self):
        return f"<Harvest id={self.id} date={self.harvest_date} qty={self.quantity}>"
