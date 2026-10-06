from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, List, Optional

from .learning import RoutingLearning
from .policy import (
    RoutingOptimizationObjective,
    RoutingOptimizationPolicy,
    create_balanced_policy,
)


@dataclass(frozen=True)
class RoutingCandidate:
    """Candidate route considered by the routing optimizer."""

    model: str
    provider: str
    estimated_cost: Decimal
    estimated_latency_ms: Decimal
    quality_score: Decimal
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class RoutingOptimizationDecision:
    """Final routing optimization decision."""

    selected_model: str
    selected_provider: str
    score: Decimal
    estimated_cost: Decimal
    estimated_latency_ms: Decimal
    quality_score: Decimal
    changed: bool
    reason: str
    candidates_evaluated: int
    request_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class RoutingOptimizer:
    """Optimize model/provider routing using policy and learned history."""

    def __init__(
        self,
        policy: Optional[RoutingOptimizationPolicy] = None,
        learning: Optional[RoutingLearning] = None,
    ) -> None:
        self.policy = policy or create_balanced_policy()
        self.learning = learning or RoutingLearning()

    @staticmethod
    def _normalize(
        value: Decimal,
        minimum: Decimal,
        maximum: Decimal,
    ) -> Decimal:
        if maximum <= minimum:
            return Decimal("0")

        result = (value - minimum) / (maximum - minimum)

        return max(
            Decimal("0"),
            min(Decimal("1"), result),
        )

    def _historical_bonus(
        self,
        candidate: RoutingCandidate,
    ) -> Decimal:
        statistics = self.learning.get_statistics(
            candidate.model,
            candidate.provider,
        )

        if statistics is None:
            return Decimal("0")

        return (
            statistics.average_quality_score
            * statistics.success_rate
            * Decimal("0.10")
        )

    def _score_candidates(
        self,
        candidates: List[RoutingCandidate],
    ) -> List[tuple[RoutingCandidate, Decimal]]:
        if not candidates:
            return []

        costs = [candidate.estimated_cost for candidate in candidates]
        latencies = [
            candidate.estimated_latency_ms
            for candidate in candidates
        ]
        qualities = [candidate.quality_score for candidate in candidates]

        min_cost, max_cost = min(costs), max(costs)
        min_latency, max_latency = min(latencies), max(latencies)
        min_quality, max_quality = min(qualities), max(qualities)

        weights = self.policy.normalized_weights()

        scored: List[tuple[RoutingCandidate, Decimal]] = []

        for candidate in candidates:
            cost_score = Decimal("1") - self._normalize(
                candidate.estimated_cost,
                min_cost,
                max_cost,
            )

            latency_score = Decimal("1") - self._normalize(
                candidate.estimated_latency_ms,
                min_latency,
                max_latency,
            )

            quality_score = self._normalize(
                candidate.quality_score,
                min_quality,
                max_quality,
            )

            score = (
                cost_score * weights["cost"]
                + latency_score * weights["latency"]
                + quality_score * weights["quality"]
                + self._historical_bonus(candidate)
            )

            scored.append((candidate, score))

        return scored

    def _is_feasible(
        self,
        candidate: RoutingCandidate,
    ) -> bool:
        constraints = self.policy.constraints()

        if (
            candidate.quality_score
            < constraints["minimum_quality"]
        ):
            return False

        maximum_cost = constraints["maximum_cost"]

        if (
            maximum_cost is not None
            and candidate.estimated_cost > maximum_cost
        ):
            return False

        maximum_latency = constraints["maximum_latency_ms"]

        if (
            maximum_latency is not None
            and candidate.estimated_latency_ms > maximum_latency
        ):
            return False

        return True

    def optimize(
        self,
        candidates: List[RoutingCandidate],
        current_model: Optional[str] = None,
        current_provider: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> RoutingOptimizationDecision:
        """Select the best feasible route."""
        if not candidates:
            raise ValueError("no routing candidates provided")

        feasible = [
            candidate
            for candidate in candidates
            if self._is_feasible(candidate)
        ]

        if not feasible:
            raise ValueError(
                "no feasible routing candidates"
            )

        scored = self._score_candidates(feasible)

        selected, score = max(
            scored,
            key=lambda item: (
                item[1],
                item[0].quality_score,
                -item[0].estimated_latency_ms,
                -item[0].estimated_cost,
            ),
        )

        changed = (
            current_model != selected.model
            or current_provider != selected.provider
        )

        if not self.policy.allow_model_switch:
            if (
                current_model is not None
                and selected.model != current_model
            ):
                current_candidates = [
                    item
                    for item in scored
                    if item[0].model == current_model
                ]

                if current_candidates:
                    selected, score = max(
                        current_candidates,
                        key=lambda item: item[1],
                    )

        if not self.policy.allow_provider_switch:
            if (
                current_provider is not None
                and selected.provider != current_provider
            ):
                current_candidates = [
                    item
                    for item in scored
                    if item[0].provider == current_provider
                ]

                if current_candidates:
                    selected, score = max(
                        current_candidates,
                        key=lambda item: item[1],
                    )

        changed = (
            current_model != selected.model
            or current_provider != selected.provider
        )

        objective = self.policy.objective

        if not changed:
            reason = (
                f"current route remains optimal under "
                f"{objective.value} policy"
            )
        else:
            reason = (
                f"route optimized using "
                f"{objective.value} policy"
            )

        return RoutingOptimizationDecision(
            selected_model=selected.model,
            selected_provider=selected.provider,
            score=score,
            estimated_cost=selected.estimated_cost,
            estimated_latency_ms=selected.estimated_latency_ms,
            quality_score=selected.quality_score,
            changed=changed,
            reason=reason,
            candidates_evaluated=len(candidates),
            request_id=request_id,
            metadata={
                "objective": objective.value,
                "feasible_candidates": len(feasible),
            },
        )


def create_default_routing_optimizer() -> RoutingOptimizer:
    """Create the default routing optimizer."""
    return RoutingOptimizer()


__all__ = [
    "RoutingCandidate",
    "RoutingOptimizationDecision",
    "RoutingOptimizer",
    "create_default_routing_optimizer",
]
