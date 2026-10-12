from typing import List, Optional
from uuid import UUID
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import cast, Date

from app.db.session import get_db
from app.models.activity import Activity
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.api.v1.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ActivityResponse])
def list_activities(
    baby_id: UUID = Query(...),
    activity_type: Optional[str] = None,
    target_date: Optional[date] = Query(None, alias="date"),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    limit: int = 150,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Activity).filter(Activity.baby_id == baby_id)
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    if target_date:
        query = query.filter(cast(Activity.start_time, Date) == target_date)
    
    if order == "asc":
        activities = query.order_by(Activity.start_time.asc()).limit(limit).all()
    else:
        activities = query.order_by(Activity.start_time.desc()).limit(limit).all()
    return activities

@router.post("/", response_model=ActivityResponse)
def create_activity(
    activity_in: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activity = Activity(
        baby_id=activity_in.baby_id,
        logged_by=current_user.id,
        activity_type=activity_in.activity_type.upper(),
        start_time=activity_in.start_time or datetime.utcnow(),
        end_time=activity_in.end_time,
        details=activity_in.details,
        notes=activity_in.notes
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: UUID,
    activity_in: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    activity.activity_type = activity_in.activity_type.upper()
    if activity_in.start_time:
        activity.start_time = activity_in.start_time
    activity.end_time = activity_in.end_time
    activity.details = activity_in.details
    activity.notes = activity_in.notes

    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/{activity_id}")
def delete_activity(
    activity_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    db.delete(activity)
    db.commit()
    return {"message": "Activity deleted successfully"}
