"""
Audit Log table definition.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class AuditLog(BaseModel):
    """
    Stores audit events for users and system actions.
    """

    __tablename__ = "audit_logs"

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    organization_id: Mapped[int | None] = mapped_column(
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    resource_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    resource_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )

    user_agent: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    metadata: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="audit_logs",
    )

    organization = relationship(
        "Organization",
        back_populates="audit_logs",
    )

    def __repr__(self) -> str:
        return (
            f"<AuditLog(id={self.id}, "
            f"action='{self.action}', "
            f"resource='{self.resource_type}')>"
        )