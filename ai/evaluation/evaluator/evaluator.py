"""
Core evaluation engine.
"""

from __future__ import annotations

import inspect
from dataclasses import dataclass, field
from typing import Any, Callable

from ..datasets.dataset import (
    EvaluationDataset,
)
from .utils import (
    normalize_score,
    safe_average,
)


@dataclass
class EvaluationItemResult:
    """Result for one dataset item."""

    item_id: str

    input_data: Any

    expected_output: Any

    prediction: Any

    score: float

    success: bool

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class EvaluationResult:
    """Aggregate evaluation result."""

    evaluator_name: str

    dataset_name: str

    total: int

    successful: int

    failed: int

    score: float

    items: list[
        EvaluationItemResult
    ] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    @property
    def percentage(self) -> float:
        return self.score * 100.0

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "evaluator_name":
                self.evaluator_name,
            "dataset_name":
                self.dataset_name,
            "total":
                self.total,
            "successful":
                self.successful,
            "failed":
                self.failed,
            "score":
                self.score,
            "percentage":
                self.percentage,
            "items": [
                {
                    "item_id":
                        item.item_id,
                    "prediction":
                        item.prediction,
                    "expected_output":
                        item.expected_output,
                    "score":
                        item.score,
                    "success":
                        item.success,
                    "error":
                        item.error,
                    "metadata":
                        item.metadata,
                }
                for item in self.items
            ],
            "metadata":
                self.metadata,
        }


class Evaluator:
    """
    General evaluation engine.

    predictor:
        async/sync function receiving input.

    scorer:
        function receiving prediction and expected output,
        returning a value between 0 and 1 or an object with
        a `value` property.
    """

    def __init__(
        self,
        name: str = "default_evaluator",
    ) -> None:

        self.name = name.strip()

        if not self.name:
            raise ValueError(
                "Evaluator name cannot be empty."
            )

    async def evaluate(
        self,
        dataset: EvaluationDataset,
        predictor: Callable[
            [Any],
            Any,
        ],
        scorer: Callable[
            [Any, Any],
            Any,
        ],
    ) -> EvaluationResult:

        results: list[
            EvaluationItemResult
        ] = []

        for item in dataset:

            try:

                prediction = predictor(
                    item.input_data
                )

                if inspect.isawaitable(
                    prediction
                ):

                    prediction = await prediction

                score = normalize_score(
                    scorer(
                        prediction,
                        item.expected_output,
                    )
                )

                results.append(
                    EvaluationItemResult(
                        item_id=item.item_id,
                        input_data=item.input_data,
                        expected_output=item.expected_output,
                        prediction=prediction,
                        score=score,
                        success=True,
                        metadata=dict(
                            item.metadata
                        ),
                    )
                )

            except Exception as exc:

                results.append(
                    EvaluationItemResult(
                        item_id=item.item_id,
                        input_data=item.input_data,
                        expected_output=item.expected_output,
                        prediction=None,
                        score=0.0,
                        success=False,
                        error=str(exc),
                        metadata=dict(
                            item.metadata
                        ),
                    )
                )

        successful = sum(
            item.success
            for item in results
        )

        failed = (
            len(results)
            - successful
        )

        score = safe_average(
            [
                item.score
                for item in results
            ]
        )

        return EvaluationResult(
            evaluator_name=self.name,
            dataset_name=dataset.name,
            total=len(results),
            successful=int(successful),
            failed=failed,
            score=score,
            items=results,
        )