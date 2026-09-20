import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crops.id", ondelete="CASCADE"), nullable=True)
    field_id = Column(UUID(as_uuid=True), ForeignKey("fields.id", ondelete="CASCADE"), nullable=False)
    # Types: irrigation, fertilizer, pesticide, field_preparation, observation
    activity_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    date = Column(Date, nullable=False)
    cost = Column(Float, nullable=True, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    crop = relationship("Crop", back_populates="activities")
    field = relationship("Field", back_populates="activities")

    def __repr__(self):
        return f"<Activity id={self.id} type={self.activity_type} date={self.date}>"
