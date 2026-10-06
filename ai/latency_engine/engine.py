from __future__ import annotations

from collections import defaultdict
from threading import Lock
from typing import Iterable

from .constants import (
    DEFAULT_DEGRADATION_THRESHOLD_PERCENT,
    DEFAULT_HISTORY_LIMIT,
    DEFAULT_MIN_SAMPLES,
    DEFAULT_SLA_TARGET_MS,
)
from .exceptions import InsufficientLatencyDataError
from .models import (
    LatencyDegradation,
    LatencyObservation,
    LatencyPrediction,
    LatencyStatistics,
    SLAResult,
)
from .utils import (
    average,
    latency_values,
    percentage_change,
    percentile,
    validate_latency,
    validate_positive,
)


class LatencyEngine:
    """Core latency intelligence engine for ModelNow."""

    def __init__(
        self,
        max_records: int = DEFAULT_HISTORY_LIMIT,
        min_samples: int = DEFAULT_MIN_SAMPLES,
        degradation_threshold_percent: float = (
            DEFAULT_DEGRADATION_THRESHOLD_PERCENT
        ),
        default_sla_target_ms: float = DEFAULT_SLA_TARGET_MS,
    ) -> None:
        if max_records <= 0:
            raise ValueError("max_records must be greater than zero")

        if min_samples <= 0:
            raise ValueError("min_samples must be greater than zero")

        if degradation_threshold_percent < 0.0:
            raise ValueError(
                "degradation_threshold_percent cannot be negative"
            )

        if default_sla_target_ms <= 0.0:
            raise ValueError(
                "default_sla_target_ms must be greater than zero"
            )

        self._max_records = int(max_records)
        self._min_samples = int(min_samples)
        self._degradation_threshold_percent = float(
            degradation_threshold_percent
        )
        self._default_sla_target_ms = float(default_sla_target_ms)

        self._records: list[LatencyObservation] = []
        self._lock = Lock()

    @property
    def max_records(self) -> int:
        return self._max_records

    @property
    def min_samples(self) -> int:
        return self._min_samples

    @property
    def degradation_threshold_percent(self) -> float:
        return self._degradation_threshold_percent

    @property
    def default_sla_target_ms(self) -> float:
        return self._default_sla_target_ms

    @property
    def count(self) -> int:
        with self._lock:
            return len(self._records)

    def record(
        self,
        observation: LatencyObservation,
    ) -> LatencyObservation:
        if not isinstance(observation, LatencyObservation):
            raise TypeError(
                "observation must be a LatencyObservation"
            )

        with self._lock:
            self._records.append(observation)

            if len(self._records) > self._max_records:
                overflow = len(self._records) - self._max_records
                del self._records[:overflow]

        return observation

    def record_many(
        self,
        observations: Iterable[LatencyObservation],
    ) -> int:
        items = list(observations)

        for observation in items:
            if not isinstance(observation, LatencyObservation):
                raise TypeError(
                    "all observations must be LatencyObservation instances"
                )

        with self._lock:
            self._records.extend(items)

            if len(self._records) > self._max_records:
                overflow = len(self._records) - self._max_records
                del self._records[:overflow]

        return len(items)

    def records(self) -> list[LatencyObservation]:
        with self._lock:
            return list(self._records)

    def clear(self) -> int:
        with self._lock:
            count = len(self._records)
            self._records.clear()
            return count

    def statistics(
        self,
        observations: Iterable[LatencyObservation] | None = None,
    ) -> LatencyStatistics:
        if observations is None:
            observations = self.records()

        values = latency_values(observations)

        if len(values) < self._min_samples:
            raise InsufficientLatencyDataError(
                "Insufficient latency observations"
            )

        return LatencyStatistics(
            samples=len(values),
            average_ms=average(values),
            p50_ms=percentile(values, 50.0),
            p95_ms=percentile(values, 95.0),
            p99_ms=percentile(values, 99.0),
            minimum_ms=min(values),
            maximum_ms=max(values),
        )

    def model_statistics(
        self,
        model_id: str,
    ) -> LatencyStatistics:
        model_id = str(model_id).strip()

        if not model_id:
            raise ValueError("model_id cannot be empty")

        observations = [
            observation
            for observation in self.records()
            if observation.model_id == model_id
        ]

        return self.statistics(observations)

    def provider_statistics(
        self,
        provider: str,
    ) -> LatencyStatistics:
        provider = str(provider).strip()

        if not provider:
            raise ValueError("provider cannot be empty")

        observations = [
            observation
            for observation in self.records()
            if observation.provider == provider
        ]

        return self.statistics(observations)

    def predict(
        self,
        model_id: str,
        provider: str,
    ) -> LatencyPrediction:
        model_id = str(model_id).strip()
        provider = str(provider).strip()

        if not model_id:
            raise ValueError("model_id cannot be empty")

        if not provider:
            raise ValueError("provider cannot be empty")

        observations = [
            observation
            for observation in self.records()
            if observation.model_id == model_id
            and observation.provider == provider
        ]

        values = latency_values(observations)

        if len(values) < self._min_samples:
            raise InsufficientLatencyDataError(
                "Insufficient latency observations for prediction"
            )

        statistics = self.statistics(observations)

        confidence = min(
            1.0,
            len(values) / max(10, self._min_samples),
        )

        return LatencyPrediction(
            model_id=model_id,
            provider=provider,
            predicted_latency_ms=statistics.p95_ms,
            confidence=confidence,
            samples=len(values),
            metadata={
                "prediction_method": "historical_p95",
                "average_latency_ms": statistics.average_ms,
                "p50_latency_ms": statistics.p50_ms,
                "p99_latency_ms": statistics.p99_ms,
            },
        )

    def check_sla(
        self,
        actual_latency_ms: float,
        target_latency_ms: float | None = None,
    ) -> SLAResult:
        actual = validate_latency(
            actual_latency_ms,
            "actual_latency_ms",
        )

        target = (
            self._default_sla_target_ms
            if target_latency_ms is None
            else validate_positive(
                target_latency_ms,
                "target_latency_ms",
            )
        )

        margin = target - actual
        utilization = actual / target

        return SLAResult(
            target_latency_ms=target,
            actual_latency_ms=actual,
            compliant=actual <= target,
            margin_ms=margin,
            utilization=utilization,
        )

    def detect_degradation(
        self,
        model_id: str,
        provider: str,
        baseline_latency_ms: float,
        current_latency_ms: float,
        threshold_percent: float | None = None,
    ) -> LatencyDegradation:
        model_id = str(model_id).strip()
        provider = str(provider).strip()

        if not model_id:
            raise ValueError("model_id cannot be empty")

        if not provider:
            raise ValueError("provider cannot be empty")

        baseline = validate_positive(
            baseline_latency_ms,
            "baseline_latency_ms",
        )
        current = validate_latency(
            current_latency_ms,
            "current_latency_ms",
        )

        threshold = (
            self._degradation_threshold_percent
            if threshold_percent is None
            else float(threshold_percent)
        )

        if threshold < 0.0:
            raise ValueError(
                "threshold_percent cannot be negative"
            )

        increase = percentage_change(
            baseline,
            current,
        )

        return LatencyDegradation(
            model_id=model_id,
            provider=provider,
            baseline_latency_ms=baseline,
            current_latency_ms=current,
            increase_percent=increase,
            degraded=increase >= threshold,
            threshold_percent=threshold,
            metadata={
                "detection_method": "baseline_percentage_change",
            },
        )

    def model_predictions(
        self,
    ) -> list[LatencyPrediction]:
        grouped: dict[tuple[str, str], list[LatencyObservation]] = (
            defaultdict(list)
        )

        for observation in self.records():
            grouped[
                (observation.model_id, observation.provider)
            ].append(observation)

        predictions: list[LatencyPrediction] = []

        for (model_id, provider), observations in sorted(grouped.items()):
            if len(observations) < self._min_samples:
                continue

            statistics = self.statistics(observations)
            confidence = min(
                1.0,
                len(observations) / max(10, self._min_samples),
            )

            predictions.append(
                LatencyPrediction(
                    model_id=model_id,
                    provider=provider,
                    predicted_latency_ms=statistics.p95_ms,
                    confidence=confidence,
                    samples=len(observations),
                    metadata={
                        "prediction_method": "historical_p95",
                    },
                )
            )

        return predictions


__all__ = [
    "LatencyEngine",
]
