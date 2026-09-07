"""
Database Configuration

Contains:
- Database URL configuration
- SQLAlchemy engine creation
- Session factory
- Base model configuration
"""

from pathlib import Path
from typing import Final

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlalchemy.orm import DeclarativeBase


# -------------------------------------------------
# Environment Configuration
# -------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class DatabaseSettings(BaseSettings):
    """
    Database environment settings.
    """

    DATABASE_URL: str

    DB_ECHO: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


database_settings = DatabaseSettings()


# -------------------------------------------------
# SQLAlchemy Async Engine
# -------------------------------------------------

engine: Final[AsyncEngine] = create_async_engine(
    database_settings.DATABASE_URL,
    echo=database_settings.DB_ECHO,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)


# -------------------------------------------------
# Database Session Factory
# -------------------------------------------------

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# -------------------------------------------------
# Base Model
# -------------------------------------------------

class Base(DeclarativeBase):
    """
    SQLAlchemy Base class.

    All database models inherit from this.
    """

    pass