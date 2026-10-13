from __future__ import annotations

from dataclasses import dataclass
from collections.abc import Iterable

from ..base.models import ModelCapability, ModelInfo, ProviderTier
from .common import enabled_models, normalize_model_id


@dataclass(frozen=True)
class SLMSelection:
    """Result of SLM model selection."""

    model: ModelInfo
    score: float
    reason: str


class SLMSelector:
    """
    Select the best available SLM using normalized model metadata.

    The selector is intentionally lightweight. The global ModelNow
    Routing Engine remains responsible for SLM/MLM/LLM decisions.
    This component only ranks candidates inside the SLM tier.
    """

    def __init__(
        self,
        *,
        quality_weight: float = 0.45,
        latency_weight: float = 0.30,
        cost_weight: float = 0.25,
    ) -> None:
        weights = (
            quality_weight,
            latency_weight,
            cost_weight,
        )

        if any(weight < 0 for weight in weights):
            raise ValueError(
                "selector weights cannot be negative"
            )

        total = sum(weights)

        if total <= 0:
            raise ValueError(
                "selector weights must have a positive total"
            )

        self.quality_weight = quality_weight / total
        self.latency_weight = latency_weight / total
        self.cost_weight = cost_weight / total

    def candidates(
        self,
        models: Iterable[ModelInfo],
        *,
        capability: ModelCapability | None = None,
    ) -> list[ModelInfo]:
        """Return enabled SLM candidates."""
        values = [
            model
            for model in enabled_models(models)
            if model.tier == ProviderTier.SLM
        ]

        if capability is not None:
            if not isinstance(
                capability,
                ModelCapability,
            ):
                raise TypeError(
                    "capability must be a ModelCapability"
                )

            values = [
                model
                for model in values
                if model.supports(capability)
            ]

        return values

    def score(self, model: ModelInfo) -> float:
        """Calculate a normalized SLM selection score."""
        if not isinstance(model, ModelInfo):
            raise TypeError(
                "model must be a ModelInfo"
            )

        quality = (
            model.quality_score
            if model.quality_score is not None
            else 0.5
        )

        latency = (
            model.estimated_latency_ms
            if model.estimated_latency_ms is not None
            else 1000.0
        )

        input_cost = max(
            0.0,
            float(model.input_cost_per_1m_tokens),
        )
        output_cost = max(
            0.0,
            float(model.output_cost_per_1m_tokens),
        )
        average_cost = (
            input_cost + output_cost
        ) / 2.0

        latency_score = 1.0 / (
            1.0 + max(0.0, latency) / 1000.0
        )

        cost_score = 1.0 / (
            1.0 + average_cost
        )

        quality_score = min(
            1.0,
            max(0.0, float(quality)),
        )

        return (
            self.quality_weight * quality_score
            + self.latency_weight * latency_score
            + self.cost_weight * cost_score
        )

    def rank(
        self,
        models: Iterable[ModelInfo],
        *,
        capability: ModelCapability | None = None,
    ) -> list[SLMSelection]:
        """Rank SLM candidates from best to worst."""
        candidates = self.candidates(
            models,
            capability=capability,
        )

        selections = [
            SLMSelection(
                model=model,
                score=self.score(model),
                reason=(
                    "SLM candidate ranked using "
                    "quality, latency and cost."
                ),
            )
            for model in candidates
        ]

        return sorted(
            selections,
            key=lambda item: (
                -item.score,
                item.model.id.lower(),
            ),
        )

    def select(
        self,
        models: Iterable[ModelInfo],
        *,
        capability: ModelCapability | None = None,
        model_id: str | None = None,
    ) -> SLMSelection | None:
        """Select the highest-scoring SLM candidate."""
        values = list(models)

        if model_id is not None:
            normalized = normalize_model_id(model_id)

            values = [
                model
                for model in values
                if model.matches(normalized)
            ]

        ranked = self.rank(
            values,
            capability=capability,
        )

        return ranked[0] if ranked else None


__all__ = [
    "SLMSelection",
    "SLMSelector",
]
