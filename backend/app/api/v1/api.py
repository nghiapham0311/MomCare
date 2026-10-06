from fastapi import APIRouter
from app.api.v1.endpoints import auth, activities, babies, growth, summary

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(babies.router, prefix="/babies", tags=["Babies"])
api_router.include_router(activities.router, prefix="/activities", tags=["Activities"])
api_router.include_router(growth.router, prefix="/growth", tags=["Growth Tracking"])
api_router.include_router(summary.router, prefix="/summary", tags=["Summary & Stats"])
