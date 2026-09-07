"""
Transaction table definition.
"""

from __future__ import annotations

from datetime import datetime

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


class Transaction(BaseModel):
    """
    Stores payment transactions.
    """

    __tablename__ = "transactions"

    billing_id: Mapped[int] = mapped_column(
        ForeignKey("billing.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

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

    transaction_id: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    payment_gateway: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    amount: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(
        String(10),
        default="USD",
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING",
        nullable=False,
    )

    payment_method: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    gateway_response: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    processed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    billing = relationship(
        "Billing",
        back_populates="transactions",
    )

    organization = relationship(
        "Organization",
        back_populates="transactions",
    )

    user = relationship(
        "User",
        back_populates="transactions",
    )

    def __repr__(self) -> str:
        return (
            f"<Transaction(id={self.id}, "
            f"transaction='{self.transaction_id}', "
            f"status='{self.status}')>"
        )