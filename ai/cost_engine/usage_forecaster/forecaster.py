from __future__ import annotations

from decimal import Decimal
from typing import List, Optional

from .estimator import UsageEstimator
from .models import (
    ForecastSummary,
    UsageForecast,
    UsageForecastRequest,
    UsagePoint,
)


class UsageForecaster:
    """High-level usage forecasting service."""

    def __init__(self) -> None:
        self.estimator = UsageEstimator()

    def forecast(
        self,
        request: UsageForecastRequest,
    ) -> UsageForecast:
        return self.estimator.estimate(request)

    def forecast_from_history(
        self,
        history: List[UsagePoint],
        periods_ahead: int = 1,
        *,
        model: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> UsageForecast:
        request = UsageForecastRequest(
            history=history,
            periods_ahead=periods_ahead,
            model=model,
            provider=provider,
        )

        return self.forecast(request)

    def summarize(
        self,
        request: UsageForecastRequest,
        *,
        currency: str = "USD",
    ) -> ForecastSummary:
        forecast = self.forecast(request)

        historical_tokens = sum(
            point.tokens
            for point in request.history
        )

        historical_requests = sum(
            point.requests
            for point in request.history
        )

        historical_cost = sum(
            (Decimal(point.cost) for point in request.history),
            Decimal("0"),
        )

        return ForecastSummary(
            historical_periods=len(request.history),
            historical_tokens=historical_tokens,
            historical_requests=historical_requests,
            historical_cost=historical_cost,
            forecast_tokens=forecast.predicted_tokens,
            forecast_requests=forecast.predicted_requests,
            forecast_cost=forecast.predicted_cost,
            confidence=forecast.confidence,
            currency=currency,
        )


__all__ = ["UsageForecaster"]
