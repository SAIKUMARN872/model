"""
Enterprise Application Settings

Production-grade configuration management using Pydantic Settings.

Features
--------
- Environment based configuration
- Strong type validation
- Secret management
- Cached singleton settings
- Nested configuration
- Production ready defaults
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application configuration.

    Values are automatically loaded from:

    1. Environment Variables
    2. .env
    3. Default Values
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        validate_default=True,
    )

    # ==========================================================
    # Application
    # ==========================================================

    APP_NAME: str = "ModelNow"

    APP_VERSION: str = "1.0.0"

    ENVIRONMENT: Literal[
        "development",
        "testing",
        "staging",
        "production",
    ] = "development"

    DEBUG: bool = True

    API_PREFIX: str = "/api/v1"

    # ==========================================================
    # Server
    # ==========================================================

    HOST: str = "0.0.0.0"

    PORT: int = 8000

    WORKERS: int = 4

    # ==========================================================
    # Security
    # ==========================================================

    SECRET_KEY: SecretStr = SecretStr(
        "CHANGE_ME_IN_PRODUCTION"
    )

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    JWT_ALGORITHM: str = "HS256"

    # ==========================================================
    # Database
    # ==========================================================

    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:password@localhost/modelnow"
    )

    DATABASE_POOL_SIZE: int = 20

    DATABASE_MAX_OVERFLOW: int = 40

    DATABASE_POOL_TIMEOUT: int = 30

    DATABASE_ECHO: bool = False

    # ==========================================================
    # Redis
    # ==========================================================

    REDIS_URL: str = "redis://localhost:6379/0"

    REDIS_TTL: int = 3600

    # ==========================================================
    # AI Providers
    # ==========================================================

    OPENAI_API_KEY: SecretStr | None = None

    ANTHROPIC_API_KEY: SecretStr | None = None

    GEMINI_API_KEY: SecretStr | None = None

    GROQ_API_KEY: SecretStr | None = None

    OPENAI_DEFAULT_MODEL: str = "gpt-5"

    ANTHROPIC_DEFAULT_MODEL: str = "claude-opus-4"

    GEMINI_DEFAULT_MODEL: str = "gemini-2.5-pro"

    GROQ_DEFAULT_MODEL: str = "llama-3.3-70b"

    # ==========================================================
    # Logging
    # ==========================================================

    LOG_LEVEL: str = "INFO"

    LOG_JSON: bool = True

    LOG_FILE: str = "logs/modelnow.log"

    # ==========================================================
    # Rate Limiting
    # ==========================================================

    RATE_LIMIT_PER_MINUTE: int = 120

    # ==========================================================
    # Uploads
    # ==========================================================

    MAX_UPLOAD_SIZE_MB: int = 100

    ALLOWED_FILE_TYPES: list[str] = [
        "pdf",
        "docx",
        "txt",
        "md",
        "csv",
        "xlsx",
    ]

    # ==========================================================
    # Observability
    # ==========================================================

    ENABLE_METRICS: bool = True

    ENABLE_TRACING: bool = True

    PROMETHEUS_PORT: int = 9090

    # ==========================================================
    # Celery
    # ==========================================================

    CELERY_BROKER_URL: str = "redis://localhost:6379/1"

    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # ==========================================================
    # CORS
    # ==========================================================

    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    # ==========================================================
    # Helpers
    # ==========================================================

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def is_testing(self) -> bool:
        return self.ENVIRONMENT == "testing"


@lru_cache
def get_settings() -> Settings:
    """
    Cached singleton configuration.

    Returns
    -------
    Settings
        Global application settings.
    """
    return Settings()


settings = get_settings()