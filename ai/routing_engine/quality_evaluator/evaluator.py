from __future__ import annotations

from dataclasses import dataclass

from .metrics import QualityMetrics, QualityWeights
from .scorer import QualityScore, QualityScorer
from .utils import (
    completeness_score,
    cost_efficiency_score,
    latency_score,
    normalize_score,
    response_coverage,
    token_overlap,
)


@dataclass(frozen=True)
class EvaluationInput:
    """Signals required to evaluate a model response."""

    response: str
    reference: str | None = None
    required_terms: tuple[str, ...] = ()
    relevance: float | None = None
    correctness: float | None = None
    completeness: float | None = None
    coherence: float | None = None
    latency_ms: float | None = None
    target_latency_ms: float | None = None
    cost: float | None = None
    target_cost: float | None = None


class QualityEvaluator:
    """Evaluate model responses using normalized quality signals."""

    def __init__(
        self,
        weights: QualityWeights | None = None,
        pass_threshold: float = 0.70,
    ) -> None:
        self._scorer = QualityScorer(
            weights=weights,
            pass_threshold=pass_threshold,
        )

    @property
    def scorer(self) -> QualityScorer:
        return self._scorer

    def evaluate(
        self,
        data: EvaluationInput,
    ) -> QualityScore:
        if not isinstance(data, EvaluationInput):
            raise TypeError(
                "data must be an EvaluationInput instance"
            )

        metrics = self.metrics(data)

        return self._scorer.score(metrics)

    def metrics(
        self,
        data: EvaluationInput,
    ) -> QualityMetrics:
        if not isinstance(data, EvaluationInput):
            raise TypeError(
                "data must be an EvaluationInput instance"
            )

        relevance = self._relevance(data)
        correctness = self._correctness(data)
        completeness = self._completeness(data)
        coherence = self._coherence(data)
        latency = self._latency(data)
        cost_efficiency = self._cost_efficiency(data)

        return QualityMetrics(
            relevance=relevance,
            correctness=correctness,
            completeness=completeness,
            coherence=coherence,
            latency=latency,
            cost_efficiency=cost_efficiency,
        )

    def _relevance(
        self,
        data: EvaluationInput,
    ) -> float:
        if data.relevance is not None:
            return normalize_score(data.relevance)

        if data.reference:
            return token_overlap(
                data.reference,
                data.response,
            )

        if data.required_terms:
            return response_coverage(
                data.required_terms,
                data.response,
            )

        return 1.0 if data.response.strip() else 0.0

    def _correctness(
        self,
        data: EvaluationInput,
    ) -> float:
        if data.correctness is not None:
            return normalize_score(data.correctness)

        if data.reference:
            return token_overlap(
                data.reference,
                data.response,
            )

        return 0.5 if data.response.strip() else 0.0

    def _completeness(
        self,
        data: EvaluationInput,
    ) -> float:
        if data.completeness is not None:
            return normalize_score(data.completeness)

        if data.required_terms:
            return completeness_score(
                data.required_terms,
                data.response,
            )

        return 1.0 if data.response.strip() else 0.0

    def _coherence(
        self,
        data: EvaluationInput,
    ) -> float:
        if data.coherence is not None:
            return normalize_score(data.coherence)

        response = data.response.strip()

        if not response:
            return 0.0

        if response[-1] in ".!?":
            return 1.0

        return 0.8

    def _latency(
        self,
        data: EvaluationInput,
    ) -> float:
        if data.latency_ms is None:
            return 1.0

        if data.target_latency_ms is None:
            return normalize_score(
                1.0 / (1.0 + data.latency_ms / 1000.0)
            )

        return latency_score(
            data.latency_ms,
            data.target_latency_ms,
        )

    def _cost_efficiency(
        self,
        data: EvaluationInput,
    ) -> float:
        if data.cost is None:
            return 1.0

        if data.target_cost is None:
            return normalize_score(
                1.0 / (1.0 + data.cost)
            )

        return cost_efficiency_score(
            data.cost,
            data.target_cost,
        )


__all__ = [
    "EvaluationInput",
    "QualityEvaluator",
]
