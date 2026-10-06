from __future__ import annotations

from decimal import Decimal
from typing import List

from .models import UsagePoint, UsageTrend


class UsageTrendAnalyzer:
    """Analyzes historical usage patterns."""

    def analyze(self, history: List[UsagePoint]) -> UsageTrend:
        if not history:
            return UsageTrend(
                period_count=0,
                total_tokens=0,
                total_requests=0,
                total_cost=Decimal("0"),
                average_tokens=Decimal("0"),
                average_requests=Decimal("0"),
                average_cost=Decimal("0"),
                growth_rate=Decimal("0"),
            )

        total_tokens = sum(point.tokens for point in history)
        total_requests = sum(point.requests for point in history)
        total_cost = sum(
            (Decimal(point.cost) for point in history),
            Decimal("0"),
        )

        period_count = len(history)

        average_tokens = (
            Decimal(total_tokens) / Decimal(period_count)
        )

        average_requests = (
            Decimal(total_requests) / Decimal(period_count)
        )

        average_cost = (
            total_cost / Decimal(period_count)
        )

        growth_rate = self.calculate_growth_rate(history)

        return UsageTrend(
            period_count=period_count,
            total_tokens=total_tokens,
            total_requests=total_requests,
            total_cost=total_cost,
            average_tokens=average_tokens,
            average_requests=average_requests,
            average_cost=average_cost,
            growth_rate=growth_rate,
        )

    def calculate_growth_rate(
        self,
        history: List[UsagePoint],
    ) -> Decimal:
        """Calculate percentage growth between the first and last period."""

        if len(history) < 2:
            return Decimal("0")

        first = Decimal(history[0].tokens)
        last = Decimal(history[-1].tokens)

        if first == Decimal("0"):
            return Decimal("0")

        return ((last - first) / first) * Decimal("100")

    def average_tokens(
        self,
        history: List[UsagePoint],
    ) -> Decimal:
        if not history:
            return Decimal("0")

        total = sum(point.tokens for point in history)

        return Decimal(total) / Decimal(len(history))

    def average_cost(
        self,
        history: List[UsagePoint],
    ) -> Decimal:
        if not history:
            return Decimal("0")

        total = sum(
            (Decimal(point.cost) for point in history),
            Decimal("0"),
        )

        return total / Decimal(len(history))


__all__ = ["UsageTrendAnalyzer"]
