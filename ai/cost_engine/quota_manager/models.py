from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional


@dataclass
class QuotaAccount:
    """Defines a usage quota for an entity."""

    quota_id: str
    limit: int
    used: int = 0
    unit: str = "tokens"
    owner_id: Optional[str] = None
    period: str = "monthly"
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    @property
    def remaining(self) -> int:
        return max(self.limit - self.used, 0)

    @property
    def utilization(self) -> Decimal:
        if self.limit <= 0:
            return Decimal("0")

        return Decimal(self.used) / Decimal(self.limit)

    @property
    def exceeded(self) -> bool:
        return self.used > self.limit

    def record_usage(self, amount: int) -> None:
        if amount < 0:
            raise ValueError(
                "Usage amount cannot be negative"
            )

        self.used += amount


@dataclass(frozen=True)
class QuotaUsage:
    """Represents one quota usage event."""

    quota_id: str
    amount: int
    request_id: Optional[str] = None
    model: Optional[str] = None
    provider: Optional[str] = None
    recorded_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


@dataclass(frozen=True)
class QuotaCheck:
    """Result of checking a requested quota usage."""

    quota_id: str
    limit: int
    used: int
    requested: int
    remaining: int
    utilization: Decimal
    exceeded: bool


__all__ = [
    "QuotaAccount",
    "QuotaUsage",
    "QuotaCheck",
]
