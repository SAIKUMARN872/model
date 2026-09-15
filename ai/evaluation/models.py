"""
Evaluation data models.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from .constants import (
    EvaluationStatus,
    EvaluationType,
)


def utc_now() -> datetime:
    return datetime.now(
        timezone.utc
    )


@dataclass
class EvaluationMetric:
    """Represents one evaluation metric."""

    name: str
    value: float
    normalized_value: float | None = None
    weight: float = 0.0
    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.name = str(
            self.name
        ).strip()

        if not self.name:
            raise ValueError(
                "Metric name cannot be empty."
            )

        self.value = float(
            self.value
        )

        if self.normalized_value is not None:
            self.normalized_value = float(
                self.normalized_value
            )

        self.weight = float(
            self.weight
        )

        if self.weight < 0:
            raise ValueError(
                "Metric weight cannot be negative."
            )

    def to_dict(self) -> dict[str, Any]:

        return {
            "name": self.name,
            "value": self.value,
            "normalized_value":
                self.normalized_value,
            "weight": self.weight,
            "metadata":
                dict(self.metadata),
        }


@dataclass
class EvaluationRequest:
    """Input to the evaluation engine."""

    evaluation_id: str

    input_text: str = ""

    output_text: str = ""

    expected_output: str | None = None

    context: list[str] = field(
        default_factory=list
    )

    evaluation_type: EvaluationType = (
        EvaluationType.GENERAL
    )

    metrics: list[str] = field(
        default_factory=list
    )

    threshold: float = 0.70

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.evaluation_id = str(
            self.evaluation_id
        ).strip()

        if isinstance(
            self.evaluation_type,
            str,
        ):

            self.evaluation_type = (
                EvaluationType(
                    self.evaluation_type
                )
            )

        self.threshold = float(
            self.threshold
        )

    def validate(self) -> None:

        if not self.evaluation_id:
            raise ValueError(
                "evaluation_id is required."
            )

        if not 0 <= self.threshold <= 1:
            raise ValueError(
                "threshold must be between 0 and 1."
            )

        if not isinstance(
            self.context,
            list,
        ):
            raise ValueError(
                "context must be a list."
            )

        if not isinstance(
            self.metrics,
            list,
        ):
            raise ValueError(
                "metrics must be a list."
            )

        self.metrics = [
            str(metric).strip()
            for metric in self.metrics
            if str(metric).strip()
        ]

    def to_dict(self) -> dict[str, Any]:

        return {
            "evaluation_id":
                self.evaluation_id,
            "input_text":
                self.input_text,
            "output_text":
                self.output_text,
            "expected_output":
                self.expected_output,
            "context":
                list(self.context),
            "evaluation_type":
                self.evaluation_type.value,
            "metrics":
                list(self.metrics),
            "threshold":
                self.threshold,
            "metadata":
                dict(self.metadata),
        }


@dataclass
class EvaluationResult:
    """Final evaluation result."""

    evaluation_id: str

    status: EvaluationStatus

    evaluation_type: EvaluationType

    score: float = 0.0

    percentage: float = 0.0

    passed: bool = False

    threshold: float = 0.70

    metrics: list[EvaluationMetric] = field(
        default_factory=list
    )

    duration_ms: float = 0.0

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    created_at: datetime = field(
        default_factory=utc_now
    )

    started_at: datetime | None = None

    completed_at: datetime | None = None

    def start(self) -> None:

        self.status = (
            EvaluationStatus.RUNNING
        )

        self.started_at = utc_now()

    def add_metric(
        self,
        metric: EvaluationMetric,
    ) -> None:

        for index, existing in enumerate(
            self.metrics
        ):

            if existing.name == metric.name:
                self.metrics[index] = metric
                return

        self.metrics.append(metric)

    def get_metric(
        self,
        name: str,
    ) -> EvaluationMetric | None:

        for metric in self.metrics:

            if metric.name == name:
                return metric

        return None

    def complete(
        self,
        score: float,
        threshold: float | None = None,
    ) -> None:

        if threshold is not None:
            self.threshold = float(
                threshold
            )

        self.score = max(
            0.0,
            min(1.0, float(score)),
        )

        self.percentage = (
            self.score * 100.0
        )

        self.passed = (
            self.score
            >= self.threshold
        )

        self.status = (
            EvaluationStatus.COMPLETED
        )

        self.completed_at = utc_now()

    def fail(
        self,
        error: str,
    ) -> None:

        self.status = (
            EvaluationStatus.FAILED
        )

        self.error = str(error)

        self.completed_at = utc_now()

    def to_dict(self) -> dict[str, Any]:

        return {
            "evaluation_id":
                self.evaluation_id,
            "status":
                self.status.value,
            "evaluation_type":
                self.evaluation_type.value,
            "score":
                self.score,
            "percentage":
                self.percentage,
            "passed":
                self.passed,
            "threshold":
                self.threshold,
            "metrics": [
                metric.to_dict()
                for metric in self.metrics
            ],
            "duration_ms":
                self.duration_ms,
            "error":
                self.error,
            "metadata":
                dict(self.metadata),
            "created_at":
                self.created_at.isoformat(),
            "started_at":
                (
                    self.started_at.isoformat()
                    if self.started_at
                    else None
                ),
            "completed_at":
                (
                    self.completed_at.isoformat()
                    if self.completed_at
                    else None
                ),
        }