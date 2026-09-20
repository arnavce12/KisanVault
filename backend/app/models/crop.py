import uuid
from datetime import datetime
from sqlalchemy import Column, String, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    field_id = Column(UUID(as_uuid=True), ForeignKey("fields.id", ondelete="CASCADE"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    season = Column(String(50), nullable=True)
    sowing_date = Column(Date, nullable=True)
    expected_harvest_date = Column(Date, nullable=True)
    status = Column(String(50), default="active")  # active, harvested, failed
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    field = relationship("Field", back_populates="crops")
    activities = relationship("Activity", back_populates="crop", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="crop", cascade="all, delete-orphan")
    harvests = relationship("Harvest", back_populates="crop", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Crop id={self.id} name={self.crop_name} season={self.season}>"
