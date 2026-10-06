from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, LoginRequest, TokenResponse
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.api.v1.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered"
        )
    
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id, remember_me=login_data.remember_me)
    
    # Set HttpOnly Cookie for Remember Me logic
    cookie_max_age = 90 * 24 * 3600 if login_data.remember_me else None
    response.set_cookie(
        key="momcare_refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=cookie_max_age,
        samesite="lax",
        secure=False  # Set to True in production with HTTPS
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    request: Request,
    response: Response,
    momcare_refresh_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):
    if not momcare_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )
    
    payload = decode_token(momcare_refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    new_access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=new_access_token,
        token_type="bearer",
        user=user
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("momcare_refresh_token")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
