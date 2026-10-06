from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, List


@dataclass(frozen=True)
class ModelProfile:
    """Performance profile for a model."""

    model: str
    provider: str
    cost: Decimal
    latency_ms: Decimal
    quality_score: Decimal
    availability: Decimal = Decimal("1")
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ModelAnalysis:
    """Analysis result for a model."""

    model: str
    provider: str
    cost_score: Decimal
    latency_score: Decimal
    quality_score: Decimal
    availability_score: Decimal
    overall_score: Decimal
    metadata: Dict[str, Any] = field(default_factory=dict)


class ModelAnalyzer:
    """Analyze models across quality, cost, latency and availability."""

    QUALITY_WEIGHT = Decimal("0.92")
    COST_WEIGHT = Decimal("0.05")
    LATENCY_WEIGHT = Decimal("0.02")
    AVAILABILITY_WEIGHT = Decimal("0.01")

    @staticmethod
    def _validate_profile(profile: ModelProfile) -> None:
        if not profile.model:
            raise ValueError("model must not be empty")

        if not profile.provider:
            raise ValueError("provider must not be empty")

        if profile.cost < Decimal("0"):
            raise ValueError("cost must not be negative")

        if profile.latency_ms < Decimal("0"):
            raise ValueError("latency_ms must not be negative")

        if not (
            Decimal("0")
            <= profile.quality_score
            <= Decimal("1")
        ):
            raise ValueError(
                "quality_score must be between 0 and 1"
            )

        if not (
            Decimal("0")
            <= profile.availability
            <= Decimal("1")
        ):
            raise ValueError(
                "availability must be between 0 and 1"
            )

    @staticmethod
    def _normalize(
        value: Decimal,
        minimum: Decimal,
        maximum: Decimal,
    ) -> Decimal:
        if maximum <= minimum:
            return Decimal("1")

        normalized = (
            value - minimum
        ) / (
            maximum - minimum
        )

        return max(
            Decimal("0"),
            min(Decimal("1"), normalized),
        )

    def analyze(
        self,
        profiles: List[ModelProfile],
    ) -> List[ModelAnalysis]:
        """Analyze all model profiles."""
        if not profiles:
            raise ValueError("no model profiles provided")

        for profile in profiles:
            self._validate_profile(profile)

        costs = [profile.cost for profile in profiles]
        latencies = [
            profile.latency_ms
            for profile in profiles
        ]

        min_cost = min(costs)
        max_cost = max(costs)
        min_latency = min(latencies)
        max_latency = max(latencies)

        results: List[ModelAnalysis] = []

        for profile in profiles:
            cost_score = Decimal("1") - self._normalize(
                profile.cost,
                min_cost,
                max_cost,
            )

            latency_score = Decimal("1") - self._normalize(
                profile.latency_ms,
                min_latency,
                max_latency,
            )

            quality_score = profile.quality_score
            availability_score = profile.availability

            overall_score = (
                quality_score * self.QUALITY_WEIGHT
                + cost_score * self.COST_WEIGHT
                + latency_score * self.LATENCY_WEIGHT
                + availability_score * self.AVAILABILITY_WEIGHT
            )

            results.append(
                ModelAnalysis(
                    model=profile.model,
                    provider=profile.provider,
                    cost_score=cost_score,
                    latency_score=latency_score,
                    quality_score=quality_score,
                    availability_score=availability_score,
                    overall_score=overall_score,
                    metadata=dict(profile.metadata),
                )
            )

        return sorted(
            results,
            key=lambda result: (
                result.overall_score,
                result.quality_score,
                result.availability_score,
            ),
            reverse=True,
        )

    def best(
        self,
        profiles: List[ModelProfile],
    ) -> ModelAnalysis:
        """Return the strongest model."""
        analyses = self.analyze(profiles)

        if not analyses:
            raise ValueError("no model analysis available")

        return analyses[0]

    def compare(
        self,
        first: ModelProfile,
        second: ModelProfile,
    ) -> Dict[str, Decimal]:
        """Compare two models."""
        self._validate_profile(first)
        self._validate_profile(second)

        return {
            "cost_difference": second.cost - first.cost,
            "latency_difference_ms": (
                second.latency_ms - first.latency_ms
            ),
            "quality_difference": (
                second.quality_score
                - first.quality_score
            ),
            "availability_difference": (
                second.availability
                - first.availability
            ),
        }


__all__ = [
    "ModelProfile",
    "ModelAnalysis",
    "ModelAnalyzer",
]
