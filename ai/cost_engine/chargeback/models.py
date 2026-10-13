from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional


@dataclass(frozen=True)
class ChargebackEntry:
    """Represents an attributed AI cost."""

    chargeback_id: str
    amount: Decimal
    currency: str = "USD"
    entity_type: str = "project"
    entity_id: str = ""
    request_id: Optional[str] = None
    model: Optional[str] = None
    provider: Optional[str] = None
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ChargebackAllocation:
    """Represents allocation of a cost across entities."""

    entity_type: str
    entity_id: str
    amount: Decimal
    percentage: Decimal


@dataclass(frozen=True)
class ChargebackSummary:
    """Aggregated cost for an entity."""

    entity_type: str
    entity_id: str
    total_cost: Decimal
    currency: str = "USD"
    entry_count: int = 0


__all__ = [
    "ChargebackEntry",
    "ChargebackAllocation",
    "ChargebackSummary",
]
