from __future__ import annotations

from decimal import Decimal
from typing import List

from .models import UsageForecast, UsageForecastRequest, UsagePoint
from .trends import UsageTrendAnalyzer


class UsageEstimator:
    """Estimates future usage from historical observations."""

    def __init__(self) -> None:
        self.trend_analyzer = UsageTrendAnalyzer()

    def estimate(
        self,
        request: UsageForecastRequest,
    ) -> UsageForecast:
        if request.periods_ahead < 1:
            raise ValueError("periods_ahead must be at least 1")

        history = self._filter_history(request)

        if not history:
            return UsageForecast(
                periods_ahead=request.periods_ahead,
                predicted_tokens=Decimal("0"),
                predicted_requests=Decimal("0"),
                predicted_cost=Decimal("0"),
                confidence=Decimal("0"),
                model=request.model,
                provider=request.provider,
                metadata=request.metadata,
            )

        trend = self.trend_analyzer.analyze(history)

        growth_factor = (
            Decimal("1")
            + trend.growth_rate / Decimal("100")
        )

        if growth_factor < Decimal("0"):
            growth_factor = Decimal("0")

        periods = Decimal(request.periods_ahead)

        predicted_tokens = (
            trend.average_tokens
            * (growth_factor ** periods)
        )

        predicted_requests = (
            trend.average_requests
            * (growth_factor ** periods)
        )

        predicted_cost = (
            trend.average_cost
            * (growth_factor ** periods)
        )

        confidence = self._calculate_confidence(len(history))

        return UsageForecast(
            periods_ahead=request.periods_ahead,
            predicted_tokens=predicted_tokens,
            predicted_requests=predicted_requests,
            predicted_cost=predicted_cost,
            confidence=confidence,
            model=request.model,
            provider=request.provider,
            metadata=request.metadata,
        )

    def estimate_from_history(
        self,
        history: List[UsagePoint],
        periods_ahead: int = 1,
    ) -> UsageForecast:
        request = UsageForecastRequest(
            history=history,
            periods_ahead=periods_ahead,
        )

        return self.estimate(request)

    def _filter_history(
        self,
        request: UsageForecastRequest,
    ) -> List[UsagePoint]:
        history = request.history

        if request.model is not None:
            history = [
                point
                for point in history
                if point.model == request.model
            ]

        if request.provider is not None:
            history = [
                point
                for point in history
                if point.provider == request.provider
            ]

        return history

    @staticmethod
    def _calculate_confidence(history_count: int) -> Decimal:
        if history_count <= 0:
            return Decimal("0")

        if history_count == 1:
            return Decimal("25")

        if history_count == 2:
            return Decimal("40")

        if history_count == 3:
            return Decimal("55")

        if history_count == 4:
            return Decimal("70")

        if history_count == 5:
            return Decimal("80")

        return min(
            Decimal("95"),
            Decimal("80") + Decimal(history_count - 5),
        )


__all__ = ["UsageEstimator"]
