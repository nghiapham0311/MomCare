from typing import Optional
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel


class BabyCreate(BaseModel):
    name: str
    gender: Optional[str] = "boy"
    birth_date: date
    birth_weight_kg: Optional[float] = None
    birth_height_cm: Optional[float] = None


class BabyResponse(BaseModel):
    id: UUID
    name: str
    gender: Optional[str]
    birth_date: date
    birth_weight_kg: Optional[float] = None
    birth_height_cm: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BabyUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    birth_weight_kg: Optional[float] = None
    birth_height_cm: Optional[float] = None
