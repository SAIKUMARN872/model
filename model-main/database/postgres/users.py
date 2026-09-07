"""
User table definition.
"""

from __future__ import annotations

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class User(BaseModel):
    """
    Stores application users.
    """

    __tablename__ = "users"

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # Relationships
    api_keys = relationship(
        "APIKey",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="user",
    )

    billings = relationship(
        "Billing",
        back_populates="user",
    )

    connections = relationship(
        "Connection",
        back_populates="user",
    )

    sessions = relationship(
        "Session",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    projects = relationship(
        "Project",
        back_populates="owner",
        cascade="all, delete-orphan",
    )

    transactions = relationship(
        "Transaction",
        back_populates="user",
    )

    model_usages = relationship(
        "ModelUsage",
        back_populates="user",
    )

    def __repr__(self) -> str:
        return (
            f"<User(id={self.id}, "
            f"email='{self.email}')>"
        )