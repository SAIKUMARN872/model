from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional


@dataclass(frozen=True)
class CostReportEntry:
    """Represents one cost record in a report."""

    entity_type: str
    entity_id: str
    amount: Decimal
    currency: str = "USD"
    model: Optional[str] = None
    provider: Optional[str] = None
    request_count: int = 0
    token_count: int = 0
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class CostReport:
    """Aggregated cost report."""

    report_id: str
    total_cost: Decimal
    currency: str = "USD"
    total_requests: int = 0
    total_tokens: int = 0
    entries: tuple[CostReportEntry, ...] = ()
    generated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class CostReportSummary:
    """Summary of cost activity."""

    total_cost: Decimal
    currency: str = "USD"
    total_requests: int = 0
    total_tokens: int = 0
    average_cost_per_request: Decimal = Decimal("0")
    average_cost_per_1k_tokens: Decimal = Decimal("0")


__all__ = [
    "CostReportEntry",
    "CostReport",
    "CostReportSummary",
]
