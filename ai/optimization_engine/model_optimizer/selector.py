from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, List, Optional

from .analyzer import ModelAnalysis, ModelAnalyzer, ModelProfile


@dataclass(frozen=True)
class ModelSelectionConstraints:
    """Constraints used during model selection."""

    minimum_quality: Decimal = Decimal("0")
    maximum_cost: Optional[Decimal] = None
    maximum_latency_ms: Optional[Decimal] = None
    minimum_availability: Decimal = Decimal("0")


@dataclass(frozen=True)
class ModelSelection:
    """Selected model result."""

    model: str
    provider: str
    score: Decimal
    quality_score: Decimal
    estimated_cost: Decimal
    estimated_latency_ms: Decimal
    availability: Decimal
    candidates_evaluated: int
    metadata: Dict[str, Any] = field(default_factory=dict)


class ModelSelector:
    """Select the strongest feasible model."""

    def __init__(
        self,
        analyzer: Optional[ModelAnalyzer] = None,
    ) -> None:
        self.analyzer = analyzer or ModelAnalyzer()

    @staticmethod
    def _validate_constraints(
        constraints: ModelSelectionConstraints,
    ) -> None:
        if not (
            Decimal("0")
            <= constraints.minimum_quality
            <= Decimal("1")
        ):
            raise ValueError(
                "minimum_quality must be between 0 and 1"
            )

        if constraints.maximum_cost is not None:
            if constraints.maximum_cost < Decimal("0"):
                raise ValueError(
                    "maximum_cost must not be negative"
                )

        if constraints.maximum_latency_ms is not None:
            if constraints.maximum_latency_ms < Decimal("0"):
                raise ValueError(
                    "maximum_latency_ms must not be negative"
                )

        if not (
            Decimal("0")
            <= constraints.minimum_availability
            <= Decimal("1")
        ):
            raise ValueError(
                "minimum_availability must be between 0 and 1"
            )

    @staticmethod
    def _is_feasible(
        profile: ModelProfile,
        constraints: ModelSelectionConstraints,
    ) -> bool:
        if profile.quality_score < constraints.minimum_quality:
            return False

        if (
            constraints.maximum_cost is not None
            and profile.cost > constraints.maximum_cost
        ):
            return False

        if (
            constraints.maximum_latency_ms is not None
            and profile.latency_ms
            > constraints.maximum_latency_ms
        ):
            return False

        if (
            profile.availability
            < constraints.minimum_availability
        ):
            return False

        return True

    @staticmethod
    def _selection_from_analysis(
        analysis: ModelAnalysis,
        profiles: List[ModelProfile],
        candidate_count: int,
    ) -> ModelSelection:
        profile = next(
            profile
            for profile in profiles
            if (
                profile.model == analysis.model
                and profile.provider == analysis.provider
            )
        )

        return ModelSelection(
            model=analysis.model,
            provider=analysis.provider,
            score=analysis.overall_score,
            quality_score=profile.quality_score,
            estimated_cost=profile.cost,
            estimated_latency_ms=profile.latency_ms,
            availability=profile.availability,
            candidates_evaluated=candidate_count,
            metadata=dict(profile.metadata),
        )

    def select(
        self,
        profiles: List[ModelProfile],
        constraints: Optional[
            ModelSelectionConstraints
        ] = None,
    ) -> ModelSelection:
        """Select the best feasible model."""
        if not profiles:
            raise ValueError("no model profiles provided")

        constraints = (
            constraints
            or ModelSelectionConstraints()
        )

        self._validate_constraints(constraints)

        feasible_profiles = [
            profile
            for profile in profiles
            if self._is_feasible(
                profile,
                constraints,
            )
        ]

        if not feasible_profiles:
            raise ValueError(
                "no feasible models available"
            )

        analyses = self.analyzer.analyze(
            feasible_profiles,
        )

        if not analyses:
            raise ValueError(
                "no model analysis available"
            )

        return self._selection_from_analysis(
            analyses[0],
            feasible_profiles,
            len(profiles),
        )

    def rank(
        self,
        profiles: List[ModelProfile],
        constraints: Optional[
            ModelSelectionConstraints
        ] = None,
    ) -> List[ModelSelection]:
        """Rank all feasible models."""
        if not profiles:
            raise ValueError("no model profiles provided")

        constraints = (
            constraints
            or ModelSelectionConstraints()
        )

        self._validate_constraints(constraints)

        feasible_profiles = [
            profile
            for profile in profiles
            if self._is_feasible(
                profile,
                constraints,
            )
        ]

        analyses = self.analyzer.analyze(
            feasible_profiles,
        )

        return [
            self._selection_from_analysis(
                analysis,
                feasible_profiles,
                len(profiles),
            )
            for analysis in analyses
        ]


__all__ = [
    "ModelSelectionConstraints",
    "ModelSelection",
    "ModelSelector",
]
