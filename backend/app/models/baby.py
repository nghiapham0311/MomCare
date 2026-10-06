import uuid
from sqlalchemy import Column, String, Date, Numeric, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Baby(Base):
    __tablename__ = "babies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    gender = Column(String(10), nullable=True) # 'boy', 'girl'
    birth_date = Column(Date, nullable=False)
    birth_weight_kg = Column(Numeric(4, 2), nullable=True)
    birth_height_cm = Column(Numeric(4, 1), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family_members = relationship("FamilyMember", back_populates="baby", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="baby", cascade="all, delete-orphan")
    growth_logs = relationship("GrowthLog", back_populates="baby", cascade="all, delete-orphan")

class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    baby_id = Column(UUID(as_uuid=True), ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), default="parent") # 'mother', 'father', 'caregiver'

    user = relationship("User", back_populates="family_members")
    baby = relationship("Baby", back_populates="family_members")

    __table_args__ = (UniqueConstraint('user_id', 'baby_id', name='_user_baby_uc'),)
