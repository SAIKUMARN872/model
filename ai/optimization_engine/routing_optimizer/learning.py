from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple


@dataclass(frozen=True)
class RoutingOutcome:
    """Observed result of a routing decision."""

    model: str
    provider: str
    cost: Decimal
    latency_ms: Decimal
    quality_score: Decimal
    success: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class RoutingStatistics:
    """Aggregated routing statistics."""

    model: str
    provider: str
    sample_count: int
    success_count: int
    failure_count: int
    average_cost: Decimal
    average_latency_ms: Decimal
    average_quality_score: Decimal
    success_rate: Decimal


class RoutingLearningStore:
    """In-memory historical store for routing outcomes."""

    def __init__(self) -> None:
        self._outcomes: List[RoutingOutcome] = []

    def record(self, outcome: RoutingOutcome) -> None:
        """Record a routing outcome."""
        if not outcome.model:
            raise ValueError("model must not be empty")

        if not outcome.provider:
            raise ValueError("provider must not be empty")

        if outcome.cost < Decimal("0"):
            raise ValueError("cost must not be negative")

        if outcome.latency_ms < Decimal("0"):
            raise ValueError("latency_ms must not be negative")

        if (
            outcome.quality_score < Decimal("0")
            or outcome.quality_score > Decimal("1")
        ):
            raise ValueError(
                "quality_score must be between 0 and 1"
            )

        self._outcomes.append(outcome)

    def record_result(
        self,
        model: str,
        provider: str,
        cost: Decimal,
        latency_ms: Decimal,
        quality_score: Decimal,
        success: bool = True,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> RoutingOutcome:
        """Create and record a routing outcome."""
        outcome = RoutingOutcome(
            model=model,
            provider=provider,
            cost=Decimal(str(cost)),
            latency_ms=Decimal(str(latency_ms)),
            quality_score=Decimal(str(quality_score)),
            success=success,
            metadata=metadata or {},
        )

        self.record(outcome)
        return outcome

    def all(self) -> List[RoutingOutcome]:
        """Return all recorded outcomes."""
        return list(self._outcomes)

    def clear(self) -> None:
        """Remove all historical outcomes."""
        self._outcomes.clear()

    def size(self) -> int:
        """Return the number of recorded outcomes."""
        return len(self._outcomes)

    def get_route_outcomes(
        self,
        model: str,
        provider: str,
    ) -> List[RoutingOutcome]:
        """Return outcomes for one model/provider route."""
        return [
            outcome
            for outcome in self._outcomes
            if outcome.model == model
            and outcome.provider == provider
        ]

    def routes(self) -> List[Tuple[str, str]]:
        """Return unique model/provider routes."""
        return sorted(
            {
                (outcome.model, outcome.provider)
                for outcome in self._outcomes
            }
        )

    def statistics(
        self,
        model: str,
        provider: str,
    ) -> Optional[RoutingStatistics]:
        """Calculate statistics for one route."""
        outcomes = self.get_route_outcomes(model, provider)

        if not outcomes:
            return None

        sample_count = len(outcomes)
        success_count = sum(
            1 for outcome in outcomes if outcome.success
        )
        failure_count = sample_count - success_count

        average_cost = sum(
            (outcome.cost for outcome in outcomes),
            Decimal("0"),
        ) / Decimal(sample_count)

        average_latency = sum(
            (outcome.latency_ms for outcome in outcomes),
            Decimal("0"),
        ) / Decimal(sample_count)

        average_quality = sum(
            (outcome.quality_score for outcome in outcomes),
            Decimal("0"),
        ) / Decimal(sample_count)

        success_rate = (
            Decimal(success_count) / Decimal(sample_count)
        )

        return RoutingStatistics(
            model=model,
            provider=provider,
            sample_count=sample_count,
            success_count=success_count,
            failure_count=failure_count,
            average_cost=average_cost,
            average_latency_ms=average_latency,
            average_quality_score=average_quality,
            success_rate=success_rate,
        )

    def all_statistics(self) -> List[RoutingStatistics]:
        """Return statistics for all known routes."""
        results: List[RoutingStatistics] = []

        for model, provider in self.routes():
            statistics = self.statistics(model, provider)

            if statistics is not None:
                results.append(statistics)

        return results

    def best_route(
        self,
        minimum_quality: Decimal = Decimal("0"),
    ) -> Optional[RoutingStatistics]:
        """Return the strongest historical route by quality/success."""
        candidates = [
            statistics
            for statistics in self.all_statistics()
            if statistics.average_quality_score >= minimum_quality
        ]

        if not candidates:
            return None

        return max(
            candidates,
            key=lambda item: (
                item.average_quality_score,
                item.success_rate,
                -item.average_latency_ms,
                -item.average_cost,
            ),
        )


class RoutingLearning:
    """Learning facade used by the routing optimizer."""

    def __init__(
        self,
        store: Optional[RoutingLearningStore] = None,
    ) -> None:
        self.store = store or RoutingLearningStore()

    def observe(self, outcome: RoutingOutcome) -> None:
        """Learn from a routing outcome."""
        self.store.record(outcome)

    def observe_result(
        self,
        model: str,
        provider: str,
        cost: Decimal,
        latency_ms: Decimal,
        quality_score: Decimal,
        success: bool = True,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> RoutingOutcome:
        """Learn from raw routing metrics."""
        return self.store.record_result(
            model=model,
            provider=provider,
            cost=cost,
            latency_ms=latency_ms,
            quality_score=quality_score,
            success=success,
            metadata=metadata,
        )

    def get_statistics(
        self,
        model: str,
        provider: str,
    ) -> Optional[RoutingStatistics]:
        """Get historical statistics for a route."""
        return self.store.statistics(model, provider)

    def recommend_route(
        self,
        minimum_quality: Decimal = Decimal("0"),
    ) -> Optional[RoutingStatistics]:
        """Recommend the best historically observed route."""
        return self.store.best_route(minimum_quality)

    def reset(self) -> None:
        """Reset learned routing history."""
        self.store.clear()


__all__ = [
    "RoutingOutcome",
    "RoutingStatistics",
    "RoutingLearningStore",
    "RoutingLearning",
]
