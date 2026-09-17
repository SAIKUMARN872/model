"""
Evaluation pipeline.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .evaluator import (
    EvaluationResult,
    Evaluator,
)


@dataclass
class PipelineResult:
    """Result from multiple evaluation stages."""

    results: list[EvaluationResult] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    @property
    def overall_score(self) -> float:

        if not self.results:
            return 0.0

        return sum(
            result.score
            for result in self.results
        ) / len(self.results)

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "overall_score":
                self.overall_score,
            "evaluations": [
                result.to_dict()
                for result in self.results
            ],
            "metadata":
                self.metadata,
        }


class EvaluationPipeline:
    """
    Runs multiple evaluation stages.

    Each stage is:

        (dataset, predictor, scorer)
    """

    def __init__(self) -> None:

        self._stages: list[
            tuple[
                Evaluator,
                Any,
                Any,
                Any,
            ]
        ] = []

    def add(
        self,
        evaluator: Evaluator,
        dataset: Any,
        predictor: Any,
        scorer: Any,
    ) -> None:

        self._stages.append(
            (
                evaluator,
                dataset,
                predictor,
                scorer,
            )
        )

    async def run(
        self,
    ) -> PipelineResult:

        results = []

        for (
            evaluator,
            dataset,
            predictor,
            scorer,
        ) in self._stages:

            result = await evaluator.evaluate(
                dataset,
                predictor,
                scorer,
            )

            results.append(
                result
            )

        return PipelineResult(
            results=results
        )

    def clear(self) -> None:

        self._stages.clear()

    def __len__(self) -> int:

        return len(
            self._stages
        )