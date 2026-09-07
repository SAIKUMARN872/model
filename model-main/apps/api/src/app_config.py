"""
Application configuration.

Central configuration management for the API service.
Loads environment variables and application settings.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)



class AppConfig(BaseSettings):
    """
    Application settings.

    Values are loaded from:
    - Environment variables
    - .env file
    """

    # -----------------------------
    # Application
    # -----------------------------

    APP_NAME: str = "AI Platform API"

    VERSION: str = "1.0.0"

    ENVIRONMENT: str = "development"

    DEBUG: bool = False


    # -----------------------------
    # API
    # -----------------------------

    API_PREFIX: str = "/api"

    HOST: str = "0.0.0.0"

    PORT: int = 8000


    # -----------------------------
    # Security
    # -----------------------------

    SECRET_KEY: str = "change-this-secret"

    JWT_SECRET_KEY: str = "change-this-jwt-secret"

    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30



    # -----------------------------
    # Database
    # -----------------------------

    DATABASE_URL: str = (
        "postgresql+asyncpg://"
        "user:password@localhost/db"
    )



    # -----------------------------
    # Redis
    # -----------------------------

    REDIS_URL: str = (
        "redis://localhost:6379/0"
    )



    # -----------------------------
    # Storage
    # -----------------------------

    STORAGE_PROVIDER: str = "local"

    STORAGE_BUCKET: str | None = None

    AWS_ACCESS_KEY_ID: str | None = None

    AWS_SECRET_ACCESS_KEY: str | None = None

    AWS_REGION: str | None = None



    # -----------------------------
    # AI Providers
    # -----------------------------

    OPENAI_API_KEY: str | None = None

    ANTHROPIC_API_KEY: str | None = None

    GOOGLE_API_KEY: str | None = None

    GROQ_API_KEY: str | None = None



    # -----------------------------
    # Webhooks
    # -----------------------------

    WEBHOOK_SECRET: str | None = None



    # -----------------------------
    # Observability
    # -----------------------------

    LOG_LEVEL: str = "INFO"

    OTEL_EXPORTER_ENDPOINT: str | None = None



    # -----------------------------
    # CORS
    # -----------------------------

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]



    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )



@lru_cache()
def get_config() -> AppConfig:
    """
    Cached application configuration.
    """

    return AppConfig()



# Global configuration instance

settings = get_config()