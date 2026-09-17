"""
A/B experiment result analysis.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .experiment import ABExperiment
from .variant import Variant


@dataclass
class ABResult:
    """Comparison result between variants."""

    winner: str | None

    scores: dict[str, float]

    score_difference: float

    confidence: float

    significant: bool

    reason: str

    details: dict[str, Any]


class ABAnalyzer:
    """
    Analyzes A/B experiment performance.

    This implementation provides deterministic descriptive
    statistics. It does not claim statistical significance
    from insufficient samples.
    """

    def __init__(
        self,
        minimum_samples: int = 30,
        significance_threshold: float = 0.05,
    ) -> None:

        if minimum_samples <= 0:
            raise ValueError(
                "minimum_samples must be positive."
            )

        if not 0 < significance_threshold < 1:
            raise ValueError(
                "significance_threshold must be between 0 and 1."
            )

        self.minimum_samples = minimum_samples

        self.significance_threshold = (
            significance_threshold
        )

    def analyze(
        self,
        experiment: ABExperiment,
    ) -> ABResult:

        if not experiment.variants:
            raise ValueError(
                "Experiment contains no variants."
            )

        scores = {
            variant.name:
                variant.average_score
            for variant in experiment.variants
        }

        ordered = sorted(
            experiment.variants,
            key=lambda item:
                item.average_score,
            reverse=True,
        )

        winner = ordered[0]

        runner_up = (
            ordered[1]
            if len(ordered) > 1
            else None
        )

        difference = (
            winner.average_score
            - (
                runner_up.average_score
                if runner_up
                else 0.0
            )
        )

        total_samples = sum(
            variant.sample_count
            for variant in experiment.variants
        )

        enough_samples = (
            total_samples
            >= self.minimum_samples
        )

        confidence = (
            self._confidence(
                difference,
                winner,
                runner_up,
            )
        )

        significant = (
            enough_samples
            and confidence
            >= (
                1.0
                - self.significance_threshold
            )
        )

        reason = (
            "Winner has sufficient samples and "
            "a strong observed performance difference."
            if significant
            else
            "Observed difference is descriptive only; "
            "more evidence may be required."
        )

        return ABResult(
            winner=(
                winner.name
                if winner
                else None
            ),
            scores=scores,
            score_difference=difference,
            confidence=confidence,
            significant=significant,
            reason=reason,
            details={
                "total_samples":
                    total_samples,
                "minimum_samples":
                    self.minimum_samples,
                "winner_samples":
                    winner.sample_count,
                "runner_up_samples":
                    (
                        runner_up.sample_count
                        if runner_up
                        else 0
                    ),
            },
        )

    def _confidence(
        self,
        difference: float,
        winner: Variant,
        runner_up: Variant | None,
    ) -> float:

        if runner_up is None:
            return 1.0

        if winner.sample_count == 0:
            return 0.0

        scale = max(
            abs(winner.average_score),
            abs(runner_up.average_score),
            1.0,
        )

        normalized_difference = min(
            abs(difference) / scale,
            1.0,
        )

        sample_factor = min(
            (
                min(
                    winner.sample_count,
                    runner_up.sample_count,
                )
                / self.minimum_samples
            ),
            1.0,
        )

        return (
            normalized_difference
            * sample_factor
        )