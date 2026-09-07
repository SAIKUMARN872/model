"""
Schemas for usage forecasting requests and responses.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Iterable

from .constants import (
    ForecastMetric,
    ForecastMethod,
    ForecastPeriod,
)
from .models import (
    ForecastConfiguration,
    UsagePoint,
)


@dataclass(frozen=True)
class ForecastRequest:
    """
    Request for generating a usage forecast.
    """

    history: tuple[UsagePoint, ...]

    metrics: tuple[str, ...] = (
        ForecastMetric.REQUESTS.value,
        ForecastMetric.TOKENS.value,
        ForecastMetric.COST.value,
    )

    period: str = ForecastPeriod.DAY.value

    horizon: int = 7

    method: str = (
        ForecastMethod.WEIGHTED_MOVING_AVERAGE.value
    )

    scope_id: str | None = None

    configuration: ForecastConfiguration | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.history:
            raise ValueError(
                "history cannot be empty"
            )

        if self.horizon <= 0:
            raise ValueError(
                "horizon must be positive"
            )

        if not self.metrics:
            raise ValueError(
                "At least one metric is required"
            )

        valid_metrics = {
            metric.value
            for metric in ForecastMetric
        }

        for metric in self.metrics:

            if metric not in valid_metrics:
                raise ValueError(
                    f"Unsupported metric: {metric}"
                )

        valid_periods = {
            period.value
            for period in ForecastPeriod
        }

        if self.period not in valid_periods:
            raise ValueError(
                f"Unsupported period: {self.period}"
            )

        valid_methods = {
            method.value
            for method in ForecastMethod
        }

        if self.method not in valid_methods:
            raise ValueError(
                f"Unsupported method: {self.method}"
            )

    @classmethod
    def from_history(
        cls,
        history: Iterable[UsagePoint],
        **kwargs: Any,
    ) -> "ForecastRequest":

        return cls(
            history=tuple(history),
            **kwargs,
        )


@dataclass(frozen=True)
class ForecastResponse:
    """
    Standard response returned by the forecast engine.
    """

    success: bool

    forecast: Any | None = None

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "success": self.success,
            "forecast": (
                self.forecast.to_dict()
                if self.forecast is not None
                and hasattr(
                    self.forecast,
                    "to_dict",
                )
                else self.forecast
            ),
            "error": self.error,
            "metadata": self.metadata,
        }


@dataclass(frozen=True)
class ForecastSummary:
    """
    Compact summary of forecast results.
    """

    predicted_requests: Decimal = Decimal("0")

    predicted_tokens: Decimal = Decimal("0")

    predicted_cost: Decimal = Decimal("0")

    currency: str = "USD"

    confidence: float = 0.0

    def to_dict(self) -> dict[str, Any]:

        return {
            "predicted_requests": str(
                self.predicted_requests
            ),
            "predicted_tokens": str(
                self.predicted_tokens
            ),
            "predicted_cost": str(
                self.predicted_cost
            ),
            "currency": self.currency,
            "confidence": self.confidence,
        }