from __future__ import annotations

from dataclasses import dataclass
from threading import Lock


@dataclass(frozen=True)
class LatencyMetricSnapshot:
    samples: int
    average_ms: float
    p50_ms: float
    p95_ms: float
    p99_ms: float
    min_ms: float
    max_ms: float
    average_ttft_ms: float
    average_queue_ms: float
    average_generation_ms: float


class LatencyMetricsCollector:
    """Thread-safe collector for real-time latency metrics."""

    def __init__(self, max_samples: int = 10000) -> None:
        if max_samples <= 0:
            raise ValueError("max_samples must be positive")

        self._max_samples = max_samples
        self._latencies: list[float] = []
        self._ttft: list[float] = []
        self._queue: list[float] = []
        self._generation: list[float] = []
        self._lock = Lock()

    @staticmethod
    def _validate(value: float | None, name: str) -> float:
        if value is None:
            return 0.0

        value = float(value)

        if value < 0:
            raise ValueError(
                f"{name} cannot be negative"
            )

        return value

    @staticmethod
    def _percentile(
        values: list[float],
        percentile: float,
    ) -> float:
        if not values:
            return 0.0

        ordered = sorted(values)

        if len(ordered) == 1:
            return ordered[0]

        position = (
            percentile / 100.0
        ) * (len(ordered) - 1)

        lower = int(position)
        upper = min(lower + 1, len(ordered) - 1)

        if lower == upper:
            return ordered[lower]

        fraction = position - lower

        return (
            ordered[lower]
            + (
                ordered[upper]
                - ordered[lower]
            )
            * fraction
        )

    @staticmethod
    def _average(values: list[float]) -> float:
        if not values:
            return 0.0

        return sum(values) / len(values)

    def _append(
        self,
        values: list[float],
        value: float,
    ) -> None:
        values.append(value)

        if len(values) > self._max_samples:
            del values[
                : len(values) - self._max_samples
            ]

    def record(
        self,
        latency_ms: float,
        *,
        ttft_ms: float | None = None,
        queue_ms: float | None = None,
        generation_ms: float | None = None,
    ) -> None:
        latency = self._validate(
            latency_ms,
            "latency_ms",
        )

        ttft = self._validate(
            ttft_ms,
            "ttft_ms",
        )

        queue = self._validate(
            queue_ms,
            "queue_ms",
        )

        generation = self._validate(
            generation_ms,
            "generation_ms",
        )

        with self._lock:
            self._append(
                self._latencies,
                latency,
            )
            self._append(
                self._ttft,
                ttft,
            )
            self._append(
                self._queue,
                queue,
            )
            self._append(
                self._generation,
                generation,
            )

    def record_many(
        self,
        observations: list[dict[str, float]],
    ) -> None:
        for observation in observations:
            self.record(
                observation["latency_ms"],
                ttft_ms=observation.get("ttft_ms"),
                queue_ms=observation.get("queue_ms"),
                generation_ms=observation.get(
                    "generation_ms"
                ),
            )

    def snapshot(self) -> LatencyMetricSnapshot:
        with self._lock:
            values = list(self._latencies)
            ttft = list(self._ttft)
            queue = list(self._queue)
            generation = list(self._generation)

        return LatencyMetricSnapshot(
            samples=len(values),
            average_ms=self._average(values),
            p50_ms=self._percentile(values, 50.0),
            p95_ms=self._percentile(values, 95.0),
            p99_ms=self._percentile(values, 99.0),
            min_ms=min(values) if values else 0.0,
            max_ms=max(values) if values else 0.0,
            average_ttft_ms=self._average(ttft),
            average_queue_ms=self._average(queue),
            average_generation_ms=self._average(
                generation
            ),
        )

    @property
    def samples(self) -> int:
        with self._lock:
            return len(self._latencies)

    @property
    def max_samples(self) -> int:
        return self._max_samples

    def latencies(self) -> tuple[float, ...]:
        with self._lock:
            return tuple(self._latencies)

    def clear(self) -> None:
        with self._lock:
            self._latencies.clear()
            self._ttft.clear()
            self._queue.clear()
            self._generation.clear()


__all__ = [
    "LatencyMetricSnapshot",
    "LatencyMetricsCollector",
]
