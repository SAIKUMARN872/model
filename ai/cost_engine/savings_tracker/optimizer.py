"""
Cost optimization recommendations.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Iterable


@dataclass(frozen=True)
class OptimizationCandidate:
    """
    Represents a possible optimization.
    """

    optimization_type: str

    current_model: str | None
    recommended_model: str | None

    current_cost: Decimal
    estimated_cost: Decimal

    estimated_savings: Decimal
    estimated_savings_percent: Decimal

    confidence: float

    reason: str

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class ModelOption:
    """
    Represents a possible alternative model.
    """

    model: str

    estimated_cost: Decimal

    quality_score: float = 1.0

    latency_score: float = 1.0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class SavingsOptimizer:
    """
    Finds potential cost optimization opportunities.
    """

    def find_model_alternatives(
        self,
        current_model: str,
        current_cost: Decimal,
        alternatives: Iterable[ModelOption],
        minimum_savings_percent: Decimal = Decimal(
            "10"
        ),
        minimum_quality_score: float = 0.8,
    ) -> list[OptimizationCandidate]:

        current_cost = Decimal(
            str(current_cost)
        )

        candidates: list[
            OptimizationCandidate
        ] = []

        for alternative in alternatives:

            if alternative.model == current_model:
                continue

            if (
                alternative.quality_score
                < minimum_quality_score
            ):
                continue

            estimated_cost = Decimal(
                str(alternative.estimated_cost)
            )

            savings = max(
                Decimal("0"),
                current_cost - estimated_cost,
            )

            if current_cost <= 0:
                savings_percent = Decimal("0")
            else:
                savings_percent = (
                    savings
                    / current_cost
                    * Decimal("100")
                )

            if (
                savings_percent
                < minimum_savings_percent
            ):
                continue

            confidence = self._confidence(
                savings_percent=savings_percent,
                quality_score=alternative.quality_score,
                latency_score=alternative.latency_score,
            )

            candidates.append(
                OptimizationCandidate(
                    optimization_type="model_switch",
                    current_model=current_model,
                    recommended_model=(
                        alternative.model
                    ),
                    current_cost=current_cost,
                    estimated_cost=estimated_cost,
                    estimated_savings=savings,
                    estimated_savings_percent=(
                        savings_percent
                    ),
                    confidence=confidence,
                    reason=(
                        "Alternative model provides "
                        "lower estimated cost while "
                        "meeting quality requirements."
                    ),
                    metadata=alternative.metadata,
                )
            )

        candidates.sort(
            key=lambda item: item.estimated_savings,
            reverse=True,
        )

        return candidates

    def recommend_token_optimization(
        self,
        current_cost: Decimal,
        current_tokens: int,
        target_reduction_percent: Decimal = Decimal(
            "20"
        ),
    ) -> OptimizationCandidate | None:

        current_cost = Decimal(
            str(current_cost)
        )

        if current_tokens <= 0:
            return None

        if (
            target_reduction_percent <= 0
            or target_reduction_percent >= 100
        ):
            raise ValueError(
                "target_reduction_percent must be "
                "between 0 and 100"
            )

        estimated_cost = (
            current_cost
            * (
                Decimal("100")
                - target_reduction_percent
            )
            / Decimal("100")
        )

        savings = (
            current_cost
            - estimated_cost
        )

        return OptimizationCandidate(
            optimization_type="token_reduction",
            current_model=None,
            recommended_model=None,
            current_cost=current_cost,
            estimated_cost=estimated_cost,
            estimated_savings=savings,
            estimated_savings_percent=(
                target_reduction_percent
            ),
            confidence=0.7,
            reason=(
                "Reduce prompt and/or completion "
                "tokens through prompt optimization."
            ),
            metadata={
                "current_tokens": current_tokens,
                "target_reduction_percent": str(
                    target_reduction_percent
                ),
            },
        )

    def recommend_caching(
        self,
        current_cost: Decimal,
        cache_hit_rate: Decimal = Decimal("50"),
    ) -> OptimizationCandidate | None:

        current_cost = Decimal(
            str(current_cost)
        )

        cache_hit_rate = Decimal(
            str(cache_hit_rate)
        )

        if not 0 <= cache_hit_rate <= 100:
            raise ValueError(
                "cache_hit_rate must be between 0 and 100"
            )

        if cache_hit_rate <= 0:
            return None

        estimated_savings = (
            current_cost
            * cache_hit_rate
            / Decimal("100")
        )

        estimated_cost = (
            current_cost
            - estimated_savings
        )

        return OptimizationCandidate(
            optimization_type="caching",
            current_model=None,
            recommended_model=None,
            current_cost=current_cost,
            estimated_cost=estimated_cost,
            estimated_savings=estimated_savings,
            estimated_savings_percent=(
                cache_hit_rate
            ),
            confidence=0.85,
            reason=(
                "Repeated requests may benefit "
                "from response or prompt caching."
            ),
            metadata={
                "cache_hit_rate": str(
                    cache_hit_rate
                ),
            },
        )

    @staticmethod
    def _confidence(
        savings_percent: Decimal,
        quality_score: float,
        latency_score: float,
    ) -> float:

        savings_score = min(
            1.0,
            float(savings_percent) / 50.0,
        )

        quality_score = max(
            0.0,
            min(1.0, quality_score),
        )

        latency_score = max(
            0.0,
            min(1.0, latency_score),
        )

        return round(
            (
                savings_score * 0.5
                + quality_score * 0.3
                + latency_score * 0.2
            ),
            4,
        )