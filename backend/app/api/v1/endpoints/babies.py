from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.baby import Baby, FamilyMember
from app.models.user import User
from app.schemas.baby import BabyCreate, BabyResponse, BabyUpdate
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.get("/", response_model=List[BabyResponse])
def get_user_babies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memberships = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()
    baby_ids = [m.baby_id for m in memberships]
    babies = db.query(Baby).filter(Baby.id.in_(baby_ids)).all()
    return babies


@router.post("/", response_model=BabyResponse, status_code=status.HTTP_201_CREATED)
def create_baby(
    baby_in: BabyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    baby = Baby(
        name=baby_in.name,
        gender=baby_in.gender,
        birth_date=baby_in.birth_date,
        birth_weight_kg=baby_in.birth_weight_kg,
        birth_height_cm=baby_in.birth_height_cm
    )
    db.add(baby)
    db.commit()
    db.refresh(baby)

    # Add current user as parent
    family = FamilyMember(
        user_id=current_user.id,
        baby_id=baby.id,
        role="parent"
    )
    db.add(family)
    db.commit()

    return baby


@router.put("/{baby_id}", response_model=BabyResponse)
def update_baby(
    baby_id: UUID,
    baby_in: BabyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership
    membership = db.query(FamilyMember).filter(
        FamilyMember.user_id == current_user.id,
        FamilyMember.baby_id == baby_id
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Baby not found")

    baby = db.query(Baby).filter(Baby.id == baby_id).first()
    if not baby:
        raise HTTPException(status_code=404, detail="Baby not found")

    update_data = baby_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(baby, field, value)

    db.commit()
    db.refresh(baby)
    return baby


@router.delete("/{baby_id}")
def delete_baby(
    baby_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    membership = db.query(FamilyMember).filter(
        FamilyMember.user_id == current_user.id,
        FamilyMember.baby_id == baby_id
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Baby not found")

    baby = db.query(Baby).filter(Baby.id == baby_id).first()
    if not baby:
        raise HTTPException(status_code=404, detail="Baby not found")

    db.delete(baby)
    db.commit()
    return {"message": "Baby deleted successfully"}
