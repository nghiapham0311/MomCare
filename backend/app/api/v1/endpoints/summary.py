from uuid import UUID
from datetime import date, datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from pydantic import BaseModel

from app.db.session import get_db
from app.models.activity import Activity
from app.models.user import User
from app.api.v1.deps import get_current_user

router = APIRouter()


class DailySummary(BaseModel):
    date: date
    feed_count: int = 0
    feed_total_ml: float = 0
    sleep_count: int = 0
    sleep_total_minutes: float = 0
    diaper_count: int = 0
    health_count: int = 0


@router.get("/daily", response_model=DailySummary)
def get_daily_summary(
    baby_id: UUID = Query(...),
    target_date: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not target_date:
        target_date = date.today()

    activities = db.query(Activity).filter(
        Activity.baby_id == baby_id,
        cast(Activity.start_time, Date) == target_date
    ).all()

    summary = DailySummary(date=target_date)

    for act in activities:
        if act.activity_type == "FEED":
            summary.feed_count += 1
            if act.details and act.details.get("amount_ml"):
                summary.feed_total_ml += act.details["amount_ml"]
        elif act.activity_type == "SLEEP":
            summary.sleep_count += 1
            if act.details and act.details.get("duration_minutes"):
                summary.sleep_total_minutes += act.details["duration_minutes"]
            elif act.end_time and act.start_time:
                diff = (act.end_time - act.start_time).total_seconds() / 60
                summary.sleep_total_minutes += diff
        elif act.activity_type == "DIAPER":
            summary.diaper_count += 1
        elif act.activity_type == "HEALTH":
            summary.health_count += 1

    return summary


@router.get("/weekly", response_model=list[DailySummary])
def get_weekly_summary(
    baby_id: UUID = Query(...),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not end_date:
        end_date = date.today()

    start_date = end_date - timedelta(days=6)

    activities = db.query(Activity).filter(
        Activity.baby_id == baby_id,
        cast(Activity.start_time, Date) >= start_date,
        cast(Activity.start_time, Date) <= end_date
    ).all()

    # Build daily summaries for 7 days
    summaries = {}
    for i in range(7):
        d = start_date + timedelta(days=i)
        summaries[d] = DailySummary(date=d)

    for act in activities:
        act_date = act.start_time.date() if isinstance(act.start_time, datetime) else act.start_time
        if act_date not in summaries:
            continue
        s = summaries[act_date]
        if act.activity_type == "FEED":
            s.feed_count += 1
            if act.details and act.details.get("amount_ml"):
                s.feed_total_ml += act.details["amount_ml"]
        elif act.activity_type == "SLEEP":
            s.sleep_count += 1
            if act.details and act.details.get("duration_minutes"):
                s.sleep_total_minutes += act.details["duration_minutes"]
            elif act.end_time and act.start_time:
                diff = (act.end_time - act.start_time).total_seconds() / 60
                s.sleep_total_minutes += diff
        elif act.activity_type == "DIAPER":
            s.diaper_count += 1
        elif act.activity_type == "HEALTH":
            s.health_count += 1

    return sorted(summaries.values(), key=lambda x: x.date)
