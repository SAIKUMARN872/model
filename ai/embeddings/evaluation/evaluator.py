"""
Main ModelNow evaluation engine.
"""

from __future__ import annotations

import asyncio
import inspect
from dataclasses import dataclass, field
from typing import Any, Callable

from .metrics import (
    accuracy,
    exact_match,
    f1_score,
    mean_cosine_similarity,
    precision,
    recall,
)
from .utils import (
    elapsed_ms,
    normalize_metric_name,
    safe_mean,
    timer_start,
    utc_now,
)


MetricFunction = Callable[
    [Any, Any],
    float,
]


@dataclass
class EvaluationSample:
    """
    One evaluation sample.
    """

    sample_id: str

    input: Any

    prediction: Any

    reference: Any = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class MetricResult:
    """
    Result of one metric.
    """

    name: str

    score: float

    sample_count: int

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "name": self.name,
            "score": self.score,
            "sample_count": self.sample_count,
            "metadata": dict(
                self.metadata
            ),
        }


@dataclass
class SampleEvaluation:
    """
    Evaluation result for one sample.
    """

    sample_id: str

    prediction: Any

    reference: Any

    metrics: dict[str, float]

    duration_ms: float = 0.0

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "sample_id": self.sample_id,
            "prediction": self.prediction,
            "reference": self.reference,
            "metrics": dict(
                self.metrics
            ),
            "duration_ms": self.duration_ms,
            "error": self.error,
            "metadata": dict(
                self.metadata
            ),
        }


@dataclass
class EvaluationReport:
    """
    Complete evaluation report.
    """

    name: str

    sample_count: int

    metrics: dict[str, MetricResult]

    samples: list[SampleEvaluation]

    duration_ms: float

    created_at: Any = field(
        default_factory=utc_now
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "name": self.name,
            "sample_count": self.sample_count,
            "metrics": {
                name: metric.to_dict()
                for name, metric
                in self.metrics.items()
            },
            "samples": [
                sample.to_dict()
                for sample in self.samples
            ],
            "duration_ms": self.duration_ms,
            "created_at": (
                self.created_at.isoformat()
            ),
            "metadata": dict(
                self.metadata
            ),
        }


class Evaluator:
    """
    General-purpose evaluation engine.

    Built-in metrics:
        - exact_match
        - accuracy
        - precision
        - recall
        - f1
        - cosine_similarity
    """

    def __init__(
        self,
        name: str = "model-evaluation",
    ) -> None:

        self.name = name

        self._metrics: dict[
            str,
            MetricFunction,
        ] = {}

        self._register_builtin_metrics()

    # --------------------------------------------------
    # Metrics
    # --------------------------------------------------

    def _register_builtin_metrics(
        self,
    ) -> None:

        self.register_metric(
            "exact_match",
            exact_match,
        )

        self.register_metric(
            "accuracy",
            lambda prediction, reference:
                float(
                    prediction == reference
                ),
        )

        self.register_metric(
            "precision",
            lambda prediction, reference:
                precision(
                    [prediction],
                    [reference],
                ),
        )

        self.register_metric(
            "recall",
            lambda prediction, reference:
                recall(
                    [prediction],
                    [reference],
                ),
        )

        self.register_metric(
            "f1",
            lambda prediction, reference:
                f1_score(
                    [prediction],
                    [reference],
                ),
        )

        self.register_metric(
            "cosine_similarity",
            lambda prediction, reference:
                mean_cosine_similarity(
                    [prediction],
                    [reference],
                ),
        )

    def register_metric(
        self,
        name: str,
        function: MetricFunction,
        overwrite: bool = False,
    ) -> None:

        metric_name = (
            normalize_metric_name(
                name
            )
        )

        if (
            metric_name in self._metrics
            and not overwrite
        ):

            raise ValueError(
                f"Metric already exists: "
                f"{metric_name}"
            )

        if not callable(function):

            raise TypeError(
                "Metric function must be callable"
            )

        self._metrics[
            metric_name
        ] = function

    def unregister_metric(
        self,
        name: str,
    ) -> bool:

        name = normalize_metric_name(
            name
        )

        if name not in self._metrics:
            return False

        del self._metrics[
            name
        ]

        return True

    def list_metrics(
        self,
    ) -> list[str]:

        return sorted(
            self._metrics.keys()
        )

    # --------------------------------------------------
    # Single evaluation
    # --------------------------------------------------

    def evaluate_sample(
        self,
        prediction: Any,
        reference: Any,
        metrics: list[str] | None = None,
    ) -> dict[str, float]:

        metric_names = (
            metrics
            or self.list_metrics()
        )

        result = {}

        for name in metric_names:

            metric_name = (
                normalize_metric_name(
                    name
                )
            )

            function = self._metrics.get(
                metric_name
            )

            if function is None:

                raise KeyError(
                    f"Metric not found: "
                    f"{metric_name}"
                )

            try:

                score = function(
                    prediction,
                    reference,
                )

            except Exception:

                # Some metrics such as cosine similarity
                # only apply to vector inputs.
                score = 0.0

            result[
                metric_name
            ] = float(score)

        return result

    # --------------------------------------------------
    # Dataset evaluation
    # --------------------------------------------------

    def evaluate(
        self,
        samples: list[EvaluationSample],
        metrics: list[str] | None = None,
        name: str | None = None,
    ) -> EvaluationReport:

        started_at = timer_start()

        sample_results: list[
            SampleEvaluation
        ] = []

        metric_values: dict[
            str,
            list[float],
        ] = {}

        for sample in samples:

            sample_started = (
                timer_start()
            )

            error = None

            try:

                sample_metrics = (
                    self.evaluate_sample(
                        prediction=sample.prediction,
                        reference=sample.reference,
                        metrics=metrics,
                    )
                )

                for metric_name, score in (
                    sample_metrics.items()
                ):

                    metric_values.setdefault(
                        metric_name,
                        [],
                    ).append(score)

            except Exception as exc:

                sample_metrics = {}

                error = str(exc)

            sample_results.append(
                SampleEvaluation(
                    sample_id=sample.sample_id,
                    prediction=sample.prediction,
                    reference=sample.reference,
                    metrics=sample_metrics,
                    duration_ms=elapsed_ms(
                        sample_started
                    ),
                    error=error,
                    metadata=dict(
                        sample.metadata
                    ),
                )
            )

        metric_results = {}

        for metric_name, values in (
            metric_values.items()
        ):

            metric_results[
                metric_name
            ] = MetricResult(
                name=metric_name,
                score=safe_mean(
                    values
                ),
                sample_count=len(
                    values
                ),
            )

        return EvaluationReport(
            name=(
                name
                or self.name
            ),
            sample_count=len(
                samples
            ),
            metrics=metric_results,
            samples=sample_results,
            duration_ms=elapsed_ms(
                started_at
            ),
        )

    # --------------------------------------------------
    # Model evaluation
    # --------------------------------------------------

    async def evaluate_model_async(
        self,
        model: Callable[[Any], Any],
        inputs: list[Any],
        references: list[Any],
        metrics: list[str] | None = None,
        name: str | None = None,
    ) -> EvaluationReport:

        if len(inputs) != len(references):

            raise ValueError(
                "inputs and references must "
                "have the same length"
            )

        samples = []

        for index, (
            input_value,
            reference,
        ) in enumerate(
            zip(
                inputs,
                references,
            )
        ):

            try:

                prediction = model(
                    input_value
                )

                if inspect.isawaitable(
                    prediction
                ):

                    prediction = (
                        await prediction
                    )

                samples.append(
                    EvaluationSample(
                        sample_id=f"sample-{index}",
                        input=input_value,
                        prediction=prediction,
                        reference=reference,
                    )
                )

            except Exception as exc:

                samples.append(
                    EvaluationSample(
                        sample_id=f"sample-{index}",
                        input=input_value,
                        prediction=None,
                        reference=reference,
                        metadata={
                            "error": str(exc)
                        },
                    )
                )

        return self.evaluate(
            samples=samples,
            metrics=metrics,
            name=name,
        )

    def evaluate_model(
        self,
        model: Callable[[Any], Any],
        inputs: list[Any],
        references: list[Any],
        metrics: list[str] | None = None,
        name: str | None = None,
    ) -> EvaluationReport:

        return asyncio.run(
            self.evaluate_model_async(
                model=model,
                inputs=inputs,
                references=references,
                metrics=metrics,
                name=name,
            )
        )