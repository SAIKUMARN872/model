"""
Billing table definition.
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Billing(BaseModel):
    """
    Stores billing and payment information.
    """

    __tablename__ = "billing"

    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    invoice_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(
        String(10),
        default="USD",
        nullable=False,
    )

    payment_status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING",
        nullable=False,
    )

    payment_method: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    transaction_id: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
    )

    billing_period: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    due_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

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

    organization = relationship(
        "Organization",
        back_populates="billings",
    )

    user = relationship(
        "User",
        back_populates="billings",
    )

    def __repr__(self) -> str:
        return (
            f"<Billing("
            f"id={self.id}, "
            f"invoice='{self.invoice_number}', "
            f"amount={self.amount}, "
            f"status='{self.payment_status}'"
            f")>"
        )