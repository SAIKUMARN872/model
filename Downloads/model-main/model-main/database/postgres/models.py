"""
AI Model table definition.
"""

from __future__ import annotations

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class AIModel(BaseModel):
    """
    Stores AI model metadata.
    """

    __tablename__ = "models"

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    context_window: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    max_output_tokens: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    supports_streaming: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    supports_tools: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    supports_vision: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    model_usages = relationship(
        "ModelUsage",
        back_populates="model",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<AIModel(id={self.id}, "
            f"name='{self.name}', "
            f"provider='{self.provider}')>"
        )