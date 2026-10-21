from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class UsagePoint:
    """Represents usage observed during a time period."""

    timestamp: datetime
    tokens: int
    requests: int = 0
    cost: Decimal = Decimal("0")
    model: Optional[str] = None
    provider: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class UsageTrend:
    """Represents a calculated usage trend."""

    period_count: int
    total_tokens: int
    total_requests: int
    total_cost: Decimal
    average_tokens: Decimal
    average_requests: Decimal
    average_cost: Decimal
    growth_rate: Decimal = Decimal("0")


@dataclass(frozen=True)
class UsageForecastRequest:
    """Input for usage forecasting."""

    history: List[UsagePoint]
    periods_ahead: int = 1
    model: Optional[str] = None
    provider: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class UsageForecast:
    """Predicted future usage."""

    periods_ahead: int
    predicted_tokens: Decimal
    predicted_requests: Decimal
    predicted_cost: Decimal
    confidence: Decimal
    model: Optional[str] = None
    provider: Optional[str] = None
    currency: str = "USD"
    generated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ForecastSummary:
    """Summary of historical usage and forecast."""

    historical_periods: int
    historical_tokens: int
    historical_requests: int
    historical_cost: Decimal
    forecast_tokens: Decimal
    forecast_requests: Decimal
    forecast_cost: Decimal
    confidence: Decimal
    currency: str = "USD"


__all__ = [
    "UsagePoint",
    "UsageTrend",
    "UsageForecastRequest",
    "UsageForecast",
    "ForecastSummary",
]
