import uuid
from sqlalchemy import Column, String, DateTime, Text, Numeric, Date, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.base import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    baby_id = Column(UUID(as_uuid=True), ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    logged_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Activity types: 'FEED', 'SLEEP', 'DIAPER', 'PUMP', 'HEALTH'
    activity_type = Column(String(20), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    
    # Store dynamic metrics as JSONB
    details = Column(JSONB, default={}, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    baby = relationship("Baby", back_populates="activities")
    user = relationship("User", back_populates="activities")

class GrowthLog(Base):
    __tablename__ = "growth_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    baby_id = Column(UUID(as_uuid=True), ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    logged_date = Column(Date, nullable=False)
    weight_kg = Column(Numeric(4, 2), nullable=True)
    height_cm = Column(Numeric(4, 1), nullable=True)
    head_circ_cm = Column(Numeric(4, 1), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    baby = relationship("Baby", back_populates="growth_logs")
