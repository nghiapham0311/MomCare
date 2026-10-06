import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MomCare - Baby Routine Tracker"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "momcare")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "momcare_secret")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "momcare_db")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    @property
    def DATABASE_URL(self) -> str:
        url = os.getenv("DATABASE_URL")
        if url:
            if url.startswith("postgresql://"):
                return url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return url
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_jwt_key_momcare_2026_change_in_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "90"))
    
    class Config:
        case_sensitive = True

settings = Settings()
