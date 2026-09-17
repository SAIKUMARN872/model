"""
Evaluation request and result schemas.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .constants import EvaluationType
from .models import (
    EvaluationRequest,
    EvaluationResult,
)


@dataclass
class EvaluationRequestSchema:
    """Validated evaluation request."""

    evaluation_id: str
    input_text: str
    output_text: str
    expected_output: str | None
    context: list[str]
    evaluation_type: EvaluationType
    metrics: list[str]
    threshold: float
    metadata: dict[str, Any]

    @classmethod
    def from_dict(
        cls,
        data: dict[str, Any],
    ) -> "EvaluationRequestSchema":

        if not isinstance(data, dict):
            raise TypeError(
                "Request must be a dictionary."
            )

        evaluation_id = str(
            data.get(
                "evaluation_id",
                "",
            )
        ).strip()

        if not evaluation_id:
            raise ValueError(
                "evaluation_id is required."
            )

        evaluation_type = data.get(
            "evaluation_type",
            EvaluationType.GENERAL,
        )

        if isinstance(
            evaluation_type,
            str,
        ):

            evaluation_type = (
                EvaluationType(
                    evaluation_type
                )
            )

        context = data.get(
            "context",
            [],
        )

        if context is None:
            context = []

        if isinstance(
            context,
            str,
        ):
            context = [context]

        if not isinstance(
            context,
            list,
        ):
            raise TypeError(
                "context must be a list."
            )

        metrics = data.get(
            "metrics",
            [],
        )

        if metrics is None:
            metrics = []

        if isinstance(
            metrics,
            str,
        ):
            metrics = [metrics]

        if not isinstance(
            metrics,
            list,
        ):
            raise TypeError(
                "metrics must be a list."
            )

        threshold = float(
            data.get(
                "threshold",
                0.70,
            )
        )

        if not 0 <= threshold <= 1:
            raise ValueError(
                "threshold must be between 0 and 1."
            )

        metadata = data.get(
            "metadata",
            {},
        )

        if metadata is None:
            metadata = {}

        if not isinstance(
            metadata,
            dict,
        ):
            raise TypeError(
                "metadata must be a dictionary."
            )

        return cls(
            evaluation_id=evaluation_id,
            input_text=str(
                data.get(
                    "input_text",
                    "",
                )
            ),
            output_text=str(
                data.get(
                    "output_text",
                    "",
                )
            ),
            expected_output=(
                str(
                    data["expected_output"]
                )
                if data.get(
                    "expected_output"
                ) is not None
                else None
            ),
            context=[
                str(item)
                for item in context
            ],
            evaluation_type=evaluation_type,
            metrics=[
                str(metric).strip()
                for metric in metrics
                if str(metric).strip()
            ],
            threshold=threshold,
            metadata=dict(metadata),
        )

    def to_model(
        self,
    ) -> EvaluationRequest:

        request = EvaluationRequest(
            evaluation_id=self.evaluation_id,
            input_text=self.input_text,
            output_text=self.output_text,
            expected_output=self.expected_output,
            context=self.context,
            evaluation_type=self.evaluation_type,
            metrics=self.metrics,
            threshold=self.threshold,
            metadata=self.metadata,
        )

        request.validate()

        return request


class EvaluationResultSchema:
    """Result serialization helper."""

    @staticmethod
    def from_model(
        result: EvaluationResult,
    ) -> dict[str, Any]:

        return result.to_dict()