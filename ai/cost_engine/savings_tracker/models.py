from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional


@dataclass(frozen=True)
class SavingsRecord:
    """Represents savings achieved by an optimization."""

    savings_id: str
    baseline_cost: Decimal
    optimized_cost: Decimal
    savings_amount: Decimal
    savings_percentage: Decimal
    currency: str = "USD"
    model: Optional[str] = None
    optimized_model: Optional[str] = None
    provider: Optional[str] = None
    request_id: Optional[str] = None
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class SavingsSummary:
    """Aggregated savings information."""

    baseline_cost: Decimal
    optimized_cost: Decimal
    savings_amount: Decimal
    savings_percentage: Decimal
    currency: str = "USD"
    record_count: int = 0


__all__ = [
    "SavingsRecord",
    "SavingsSummary",
]
