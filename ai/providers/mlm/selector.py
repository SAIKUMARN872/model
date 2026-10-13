from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from ..base.models import ModelCapability, ModelInfo
from .common import normalize_model_id


@dataclass(frozen=True)
class MLMSelection:
    """A ranked MLM model selection."""

    model: ModelInfo
    score: float


class MLMSelector:
    """
    Select and rank MLM models using quality, latency, and cost.

    Default priorities:
      quality = 45%
      latency = 30%
      cost    = 25%
    """

    def __init__(
        self,
        *,
        quality_weight: float = 0.45,
        latency_weight: float = 0.30,
        cost_weight: float = 0.25,
    ) -> None:
        total = (
            quality_weight
            + latency_weight
            + cost_weight
        )

        if total <= 0:
            raise ValueError(
                "Selector weights must have a positive total."
            )

        self.quality_weight = quality_weight / total
        self.latency_weight = latency_weight / total
        self.cost_weight = cost_weight / total

    @staticmethod
    def _normalize_capabilities(
        capabilities: Iterable[ModelCapability | str] | None,
    ) -> set[str]:
        if capabilities is None:
            return set()

        normalized: set[str] = set()

        for capability in capabilities:
            if isinstance(capability, ModelCapability):
                normalized.add(capability.value.lower())
            else:
                normalized.add(str(capability).strip().lower())

        return normalized

    def filter_candidates(
        self,
        models: Iterable[ModelInfo],
        *,
        required_capabilities: Iterable[ModelCapability | str] | None = None,
    ) -> list[ModelInfo]:
        """Filter models to enabled MLM candidates."""

        required = self._normalize_capabilities(
            required_capabilities
        )

        candidates: list[ModelInfo] = []

        for model in models:
            if not model.enabled:
                continue

            if str(model.tier).lower() not in {
                "mlm",
                "providertier.mlm",
            }:
                continue

            if required:
                model_capabilities = {
                    capability.value.lower()
                    if isinstance(capability, ModelCapability)
                    else str(capability).strip().lower()
                    for capability in model.capabilities
                }

                if not required.issubset(model_capabilities):
                    continue

            candidates.append(model)

        return candidates

    @staticmethod
    def _quality_score(model: ModelInfo) -> float:
        if model.quality_score is None:
            return 0.5

        return max(
            0.0,
            min(1.0, float(model.quality_score)),
        )

    @staticmethod
    def _latency_score(model: ModelInfo) -> float:
        latency = model.estimated_latency_ms

        if latency is None or latency <= 0:
            return 0.5

        return 1.0 / (1.0 + latency / 100.0)

    @staticmethod
    def _cost_score(model: ModelInfo) -> float:
        cost = (
            float(model.input_cost_per_1m_tokens)
            + float(model.output_cost_per_1m_tokens)
        )

        if cost <= 0:
            return 1.0

        return 1.0 / (1.0 + cost)

    def score(self, model: ModelInfo) -> float:
        """Calculate normalized model selection score."""

        return (
            self.quality_weight
            * self._quality_score(model)
            + self.latency_weight
            * self._latency_score(model)
            + self.cost_weight
            * self._cost_score(model)
        )

    def rank(
        self,
        models: Iterable[ModelInfo],
        *,
        required_capabilities: Iterable[ModelCapability | str]
        | None = None,
    ) -> list[MLMSelection]:
        """Return candidates ranked from best to worst."""

        candidates = self.filter_candidates(
            models,
            required_capabilities=required_capabilities,
        )

        selections = [
            MLMSelection(
                model=model,
                score=self.score(model),
            )
            for model in candidates
        ]

        selections.sort(
            key=lambda selection: selection.score,
            reverse=True,
        )

        return selections

    def select(
        self,
        models: Iterable[ModelInfo],
        *,
        model_id: str | None = None,
        required_capabilities: Iterable[ModelCapability | str]
        | None = None,
    ) -> MLMSelection | None:
        """Select the highest-ranked MLM candidate."""

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
            required_capabilities=required_capabilities,
        )

        return ranked[0] if ranked else None


__all__ = [
    "MLMSelection",
    "MLMSelector",
]
