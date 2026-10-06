from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class ActivityCreate(BaseModel):
    baby_id: UUID
    activity_type: str  # 'FEED', 'SLEEP', 'DIAPER', 'PUMP', 'HEALTH'
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    details: Dict[str, Any] = {}
    notes: Optional[str] = None

class ActivityResponse(BaseModel):
    id: UUID
    baby_id: UUID
    logged_by: Optional[UUID] = None
    activity_type: str
    start_time: datetime
    end_time: Optional[datetime] = None
    details: Dict[str, Any]
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
