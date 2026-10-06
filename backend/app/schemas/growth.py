from typing import Optional
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel


class GrowthLogCreate(BaseModel):
    baby_id: UUID
    logged_date: date
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    head_circ_cm: Optional[float] = None
    notes: Optional[str] = None


class GrowthLogResponse(BaseModel):
    id: UUID
    baby_id: UUID
    logged_date: date
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    head_circ_cm: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
