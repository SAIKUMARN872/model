"""
Model Usage table definition.
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ModelUsage(BaseModel):
    """
    Stores AI model usage statistics.
    """

    __tablename__ = "model_usage"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    organization_id: Mapped[int | None] = mapped_column(
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    agent_id: Mapped[int | None] = mapped_column(
        ForeignKey("agents.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    model_id: Mapped[int] = mapped_column(
        ForeignKey("models.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    model_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    prompt_tokens: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    completion_tokens: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    total_tokens: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    request_count: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    latency_ms: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    cost: Mapped[Decimal] = mapped_column(
        Numeric(10, 6),
        default=0,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="model_usages",
    )

    organization = relationship(
        "Organization",
        back_populates="model_usages",
    )

    agent = relationship(
        "Agent",
        back_populates="model_usages",
    )

    model = relationship(
        "AIModel",
        back_populates="model_usages",
    )

    def __repr__(self) -> str:
        return (
            f"<ModelUsage("
            f"id={self.id}, "
            f"model='{self.model_name}', "
            f"tokens={self.total_tokens}, "
            f"cost={self.cost}"
            f")>"
        )