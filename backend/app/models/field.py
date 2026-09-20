import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Field(Base):
    __tablename__ = "fields"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String(100), nullable=False)
    location = Column(Text, nullable=True)
    area_acres = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="fields")
    crops = relationship("Crop", back_populates="field", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="field", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="field", cascade="all, delete-orphan")
    harvests = relationship("Harvest", back_populates="field", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Field id={self.id} name={self.field_name}>"
