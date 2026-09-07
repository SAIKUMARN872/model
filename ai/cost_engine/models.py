"""
Data models for usage forecasting.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any


@dataclass(frozen=True)
class UsagePoint:
    """
    Represents one historical usage observation.
    """

    timestamp: datetime

    requests: int = 0
    tokens: int = 0

    input_tokens: int = 0
    output_tokens: int = 0

    cost: Decimal = Decimal("0")

    currency: str = "USD"

    scope_id: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if self.requests < 0:
            raise ValueError(
                "requests cannot be negative"
            )

        if self.tokens < 0:
            raise ValueError(
                "tokens cannot be negative"
            )

        if self.input_tokens < 0:
            raise ValueError(
                "input_tokens cannot be negative"
            )

        if self.output_tokens < 0:
            raise ValueError(
                "output_tokens cannot be negative"
            )

        if self.cost < 0:
            raise ValueError(
                "cost cannot be negative"
            )

        if not self.currency:
            raise ValueError(
                "currency cannot be empty"
            )


@dataclass(frozen=True)
class ForecastValue:
    """
    Forecast for a single metric.
    """

    metric: str

    predicted_value: Decimal

    lower_bound: Decimal | None = None

    upper_bound: Decimal | None = None

    confidence: float = 0.0

    timestamp: datetime | None = None

    def __post_init__(self) -> None:

        if self.predicted_value < 0:
            raise ValueError(
                "predicted_value cannot be negative"
            )

        if not 0 <= self.confidence <= 1:
            raise ValueError(
                "confidence must be between 0 and 1"
            )

        if (
            self.lower_bound is not None
            and self.lower_bound < 0
        ):
            raise ValueError(
                "lower_bound cannot be negative"
            )

        if (
            self.upper_bound is not None
            and self.upper_bound < 0
        ):
            raise ValueError(
                "upper_bound cannot be negative"
            )

    def to_dict(self) -> dict[str, Any]:

        return {
            "metric": self.metric,
            "predicted_value": str(
                self.predicted_value
            ),
            "lower_bound": (
                str(self.lower_bound)
                if self.lower_bound is not None
                else None
            ),
            "upper_bound": (
                str(self.upper_bound)
                if self.upper_bound is not None
                else None
            ),
            "confidence": self.confidence,
            "timestamp": (
                self.timestamp.isoformat()
                if self.timestamp
                else None
            ),
        }


@dataclass
class UsageForecast:
    """
    Complete usage forecast.
    """

    scope_id: str | None

    method: str

    period: str

    horizon: int

    generated_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    forecasts: list[ForecastValue] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    @property
    def total_predicted_requests(
        self,
    ) -> Decimal:

        return sum(
            (
                value.predicted_value
                for value in self.forecasts
                if value.metric == "requests"
            ),
            Decimal("0"),
        )

    @property
    def total_predicted_tokens(
        self,
    ) -> Decimal:

        return sum(
            (
                value.predicted_value
                for value in self.forecasts
                if value.metric == "tokens"
            ),
            Decimal("0"),
        )

    @property
    def total_predicted_cost(
        self,
    ) -> Decimal:

        return sum(
            (
                value.predicted_value
                for value in self.forecasts
                if value.metric == "cost"
            ),
            Decimal("0"),
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "scope_id": self.scope_id,
            "method": self.method,
            "period": self.period,
            "horizon": self.horizon,
            "generated_at": (
                self.generated_at.isoformat()
            ),
            "forecasts": [
                item.to_dict()
                for item in self.forecasts
            ],
            "total_predicted_requests": str(
                self.total_predicted_requests
            ),
            "total_predicted_tokens": str(
                self.total_predicted_tokens
            ),
            "total_predicted_cost": str(
                self.total_predicted_cost
            ),
            "metadata": self.metadata,
        }


@dataclass(frozen=True)
class ForecastConfiguration:
    """
    Configuration for the forecasting engine.
    """

    method: str = "weighted_moving_average"

    window_size: int = 7

    horizon: int = 7

    confidence_level: float = 0.95

    decay_factor: float = 0.5

    minimum_history_points: int = 2

    def __post_init__(self) -> None:

        if self.window_size <= 0:
            raise ValueError(
                "window_size must be positive"
            )

        if self.horizon <= 0:
            raise ValueError(
                "horizon must be positive"
            )

        if not 0 < self.confidence_level < 1:
            raise ValueError(
                "confidence_level must be between 0 and 1"
            )

        if not 0 < self.decay_factor <= 1:
            raise ValueError(
                "decay_factor must be between 0 and 1"
            )

        if self.minimum_history_points <= 0:
            raise ValueError(
                "minimum_history_points must be positive"
            )