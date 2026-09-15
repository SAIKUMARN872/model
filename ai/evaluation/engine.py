"""
Central ModelNow evaluation engine.
"""

from __future__ import annotations

import time
from threading import RLock
from typing import Any

from .constants import EvaluationStatus
from .exceptions import (
    EvaluationExecutionError,
    EvaluationNotFoundError,
    EvaluationValidationError,
    MetricError,
)
from .interfaces import (
    MetricEvaluator,
    ResultStore,
)
from .models import (
    EvaluationMetric,
    EvaluationRequest,
    EvaluationResult,
)
from .scoring import (
    Scorer,
    WeightSet,
)
from .utils import (
    generate_evaluation_id,
    text_similarity,
)


class InMemoryResultStore(ResultStore):
    """Thread-safe in-memory result storage."""

    def __init__(self) -> None:

        self._results: dict[
            str,
            EvaluationResult,
        ] = {}

        self._lock = RLock()

    def save(
        self,
        result: EvaluationResult,
    ) -> None:

        with self._lock:
            self._results[
                result.evaluation_id
            ] = result

    def get(
        self,
        evaluation_id: str,
    ) -> EvaluationResult | None:

        with self._lock:
            return self._results.get(
                evaluation_id
            )

    def delete(
        self,
        evaluation_id: str,
    ) -> bool:

        with self._lock:

            if evaluation_id not in self._results:
                return False

            del self._results[
                evaluation_id
            ]

            return True

    def list(
        self,
    ) -> list[EvaluationResult]:

        with self._lock:
            return list(
                self._results.values()
            )

    def clear(self) -> None:

        with self._lock:
            self._results.clear()


class EvaluationEngine:
    """
    Main evaluation orchestration engine.

    Request
       ↓
    Validation
       ↓
    Metrics
       ↓
    Scoring
       ↓
    Pass / Fail
       ↓
    Result Store
    """

    def __init__(
        self,
        *,
        scorer: Scorer | None = None,
        store: ResultStore | None = None,
    ) -> None:

        self.scorer = (
            scorer
            or Scorer()
        )

        self.store = (
            store
            or InMemoryResultStore()
        )

        self._evaluators: dict[
            str,
            MetricEvaluator,
        ] = {}

        self._lock = RLock()

    # ---------------------------------------------------------
    # Metrics
    # ---------------------------------------------------------

    def register_metric(
        self,
        evaluator: MetricEvaluator,
    ) -> None:

        if not isinstance(
            evaluator,
            MetricEvaluator,
        ):
            raise TypeError(
                "evaluator must implement MetricEvaluator."
            )

        name = evaluator.name.strip()

        if not name:
            raise ValueError(
                "Metric name cannot be empty."
            )

        with self._lock:
            self._evaluators[name] = evaluator

    def unregister_metric(
        self,
        name: str,
    ) -> bool:

        with self._lock:

            if name not in self._evaluators:
                return False

            del self._evaluators[name]

            return True

    def available_metrics(
        self,
    ) -> list[str]:

        with self._lock:
            return sorted(
                self._evaluators.keys()
            )

    # ---------------------------------------------------------
    # Evaluation
    # ---------------------------------------------------------

    def evaluate(
        self,
        request: EvaluationRequest,
    ) -> EvaluationResult:

        try:
            request.validate()

        except (
            ValueError,
            TypeError,
        ) as exc:

            raise EvaluationValidationError(
                str(exc)
            ) from exc

        existing = self.store.get(
            request.evaluation_id
        )

        if (
            existing
            and existing.status
            == EvaluationStatus.RUNNING
        ):

            raise EvaluationValidationError(
                f"Evaluation "
                f"'{request.evaluation_id}' "
                "is already running."
            )

        result = EvaluationResult(
            evaluation_id=request.evaluation_id,
            status=EvaluationStatus.PENDING,
            evaluation_type=request.evaluation_type,
            threshold=request.threshold,
            metadata=dict(
                request.metadata
            ),
        )

        result.start()

        self.store.save(
            result
        )

        started = time.perf_counter()

        try:

            metric_values = (
                self._calculate_metrics(
                    request,
                    result,
                )
            )

            if not metric_values:

                metric_values = (
                    self._calculate_default_metrics(
                        request,
                        result,
                    )
                )

            score = self.scorer.score(
                metric_values,
                threshold=request.threshold,
                metadata=request.metadata,
            )

            result.complete(
                score=score.score,
                threshold=score.threshold,
            )

            result.duration_ms = (
                time.perf_counter()
                - started
            ) * 1000.0

            result.metadata.update({
                "metric_count":
                    len(result.metrics),
                "score":
                    score.score,
            })

            self.store.save(
                result
            )

            return result

        except Exception as exc:

            result.duration_ms = (
                time.perf_counter()
                - started
            ) * 1000.0

            result.fail(
                str(exc)
            )

            self.store.save(
                result
            )

            raise EvaluationExecutionError(
                f"Evaluation failed: {exc}"
            ) from exc

    def evaluate_dict(
        self,
        data: dict[str, Any],
    ) -> EvaluationResult:

        from .schemas import (
            EvaluationRequestSchema,
        )

        try:

            schema = (
                EvaluationRequestSchema
                .from_dict(data)
            )

            request = schema.to_model()

        except (
            ValueError,
            TypeError,
        ) as exc:

            raise EvaluationValidationError(
                str(exc)
            ) from exc

        return self.evaluate(
            request
        )

    def evaluate_batch(
        self,
        requests: list[EvaluationRequest],
    ) -> list[EvaluationResult]:

        results: list[
            EvaluationResult
        ] = []

        for request in requests:

            try:

                results.append(
                    self.evaluate(
                        request
                    )
                )

            except EvaluationExecutionError:

                stored = self.store.get(
                    request.evaluation_id
                )

                if stored:
                    results.append(
                        stored
                    )
                else:
                    raise

        return results

    # ---------------------------------------------------------
    # Results
    # ---------------------------------------------------------

    def get_result(
        self,
        evaluation_id: str,
    ) -> EvaluationResult:

        result = self.store.get(
            evaluation_id
        )

        if result is None:

            raise EvaluationNotFoundError(
                f"Evaluation "
                f"'{evaluation_id}' "
                "not found."
            )

        return result

    def delete_result(
        self,
        evaluation_id: str,
    ) -> bool:

        return self.store.delete(
            evaluation_id
        )

    def list_results(
        self,
    ) -> list[EvaluationResult]:

        return self.store.list()

    # ---------------------------------------------------------
    # Metric execution
    # ---------------------------------------------------------

    def _calculate_metrics(
        self,
        request: EvaluationRequest,
        result: EvaluationResult,
    ) -> dict[str, float]:

        with self._lock:
            evaluators = dict(
                self._evaluators
            )

        requested = (
            request.metrics
            if request.metrics
            else list(evaluators.keys())
        )

        values: dict[str, float] = {}

        for metric_name in requested:

            evaluator = evaluators.get(
                metric_name
            )

            if evaluator is None:
                continue

            try:

                metric = evaluator.evaluate(
                    request
                )

            except Exception as exc:

                raise MetricError(
                    f"Metric '{metric_name}' "
                    f"failed: {exc}"
                ) from exc

            if not isinstance(
                metric,
                EvaluationMetric,
            ):

                raise MetricError(
                    f"Metric '{metric_name}' "
                    "must return EvaluationMetric."
                )

            result.add_metric(
                metric
            )

            values[
                metric.name
            ] = (
                metric.normalized_value
                if metric.normalized_value
                is not None
                else max(
                    0.0,
                    min(
                        1.0,
                        metric.value,
                    ),
                )
            )

        return values

    # ---------------------------------------------------------
    # Built-in fallback evaluation
    # ---------------------------------------------------------

    def _calculate_default_metrics(
        self,
        request: EvaluationRequest,
        result: EvaluationResult,
    ) -> dict[str, float]:

        metrics = self._default_metrics(
            request
        )

        for name, value in metrics.items():

            result.add_metric(
                EvaluationMetric(
                    name=name,
                    value=value,
                    normalized_value=value,
                )
            )

        return metrics

    def _default_metrics(
        self,
        request: EvaluationRequest,
    ) -> dict[str, float]:

        output = (
            request.output_text.strip()
        )

        if not output:

            return {
                "accuracy": 0.0,
                "quality": 0.0,
                "reliability": 0.0,
            }

        if request.expected_output:

            accuracy = text_similarity(
                output,
                request.expected_output,
            )

        elif request.input_text:

            accuracy = text_similarity(
                request.input_text,
                output,
            )

        else:

            accuracy = 1.0

        word_count = len(
            output.split()
        )

        quality = min(
            word_count / 50.0,
            1.0,
        )

        reliability = 1.0

        lowered = output.lower()

        if (
            "error" in lowered
            or "exception" in lowered
            or "failed" in lowered
        ):
            reliability = 0.5

        return {
            "accuracy": accuracy,
            "quality": quality,
            "reliability": reliability,
        }


def create_default_engine() -> EvaluationEngine:

    weights = WeightSet(
        weights={
            "accuracy": 0.40,
            "quality": 0.30,
            "reliability": 0.20,
            "relevance": 0.10,
        },
        directions={
            "accuracy": True,
            "quality": True,
            "reliability": True,
            "relevance": True,
        },
    )

    scorer = Scorer(
        weights=weights,
        threshold=0.70,
    )

    return EvaluationEngine(
        scorer=scorer
    )


def generate_request(
    *,
    input_text: str = "",
    output_text: str = "",
    expected_output: str | None = None,
    metrics: list[str] | None = None,
    threshold: float = 0.70,
    evaluation_type: str = "general",
    metadata: dict[str, Any] | None = None,
) -> EvaluationRequest:

    from .constants import EvaluationType

    return EvaluationRequest(
        evaluation_id=
            generate_evaluation_id(),
        input_text=input_text,
        output_text=output_text,
        expected_output=
            expected_output,
        metrics=metrics or [],
        threshold=threshold,
        evaluation_type=
            EvaluationType(
                evaluation_type
            ),
        metadata=metadata or {},
    )