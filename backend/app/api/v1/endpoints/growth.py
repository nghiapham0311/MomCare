from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.activity import GrowthLog
from app.models.user import User
from app.schemas.growth import GrowthLogCreate, GrowthLogResponse
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.get("/", response_model=List[GrowthLogResponse])
def list_growth_logs(
    baby_id: UUID = Query(...),
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(GrowthLog).filter(
        GrowthLog.baby_id == baby_id
    ).order_by(GrowthLog.logged_date.desc()).limit(limit).all()
    return logs


@router.post("/", response_model=GrowthLogResponse, status_code=201)
def create_growth_log(
    log_in: GrowthLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    growth_log = GrowthLog(
        baby_id=log_in.baby_id,
        logged_date=log_in.logged_date,
        weight_kg=log_in.weight_kg,
        height_cm=log_in.height_cm,
        head_circ_cm=log_in.head_circ_cm,
        notes=log_in.notes
    )
    db.add(growth_log)
    db.commit()
    db.refresh(growth_log)
    return growth_log


@router.delete("/{log_id}")
def delete_growth_log(
    log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = db.query(GrowthLog).filter(GrowthLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Growth log not found")
    db.delete(log)
    db.commit()
    return {"message": "Growth log deleted successfully"}
