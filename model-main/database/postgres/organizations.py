"""
Organization table definition.
"""

from __future__ import annotations

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Organization(BaseModel):
    """
    Stores organization information.
    """

    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    website: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(25),
        nullable=True,
    )

    address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    api_keys = relationship(
        "APIKey",
        back_populates="organization",
        cascade="all, delete-orphan",
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="organization",
        cascade="all, delete-orphan",
    )

    billings = relationship(
        "Billing",
        back_populates="organization",
        cascade="all, delete-orphan",
    )

    connections = relationship(
        "Connection",
        back_populates="organization",
        cascade="all, delete-orphan",
    )

    model_usages = relationship(
        "ModelUsage",
        back_populates="organization",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Organization(id={self.id}, "
            f"name='{self.name}')>"
        )