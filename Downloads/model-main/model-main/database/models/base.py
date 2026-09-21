"""
Base model definitions.

Provides the declarative base class and common mixins
used by all SQLAlchemy ORM models.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.
    """

    pass


class TimestampMixin:
    """
    Adds timestamp columns to models.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class IDMixin:
    """
    Adds an integer primary key column.
    """

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
        autoincrement=True,
    )


class BaseModel(Base, IDMixin, TimestampMixin):
    """
    Base model inherited by application models.
    """

    __abstract__ = True