import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Explicitly locate backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

# Load environment from the resolved .env file
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH, override=True)
else:
    load_dotenv(override=True)

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"
    APP_NAME: str = "AI Interview Practice Assistant"
    APP_ENV: str = "development"
    PORT: int = 8000
    HOST: str = "127.0.0.1"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    DATABASE_URL: str = "sqlite:///./interview_assistant.db"

    def refresh_from_env(self):
        """Re-read .env file dynamically if it changed on disk."""
        if ENV_PATH.exists():
            load_dotenv(dotenv_path=ENV_PATH, override=True)
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip().strip('"\'')
        self.GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip().strip('"\'') or "gemini-3.8-flash"
        self.APP_NAME = os.getenv("APP_NAME", "AI Interview Practice Assistant")
        self.APP_ENV = os.getenv("APP_ENV", "development")
        self.PORT = int(os.getenv("PORT", "8000"))
        self.HOST = os.getenv("HOST", "127.0.0.1")
        self.CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./interview_assistant.db")

    @property
    def cors_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def has_api_key(self) -> bool:
        key = self.GEMINI_API_KEY.strip().strip('"\'') if self.GEMINI_API_KEY else ""
        invalid_placeholders = {
            "",
            "your_gemini_api_key_here",
            "your_actual_api_key",
            "none",
            "null",
            "undefined"
        }
        return bool(key and key.lower() not in invalid_placeholders)

    @property
    def is_demo_mode(self) -> bool:
        return not self.has_api_key

    class Config:
        env_file = str(ENV_PATH)
        extra = "ignore"

settings = Settings()
# Initial load
settings.refresh_from_env()
