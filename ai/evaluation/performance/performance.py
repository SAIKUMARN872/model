"""Performance measurements for ModelNow evaluation."""
from __future__ import annotations

from dataclasses import asdict, dataclass
from math import ceil
from statistics import mean
from time import perf_counter
from typing import Any, Callable


@dataclass(frozen=True)
class PerformanceMeasurement:
    operation_count: int
    success_count: int
    error_count: int
    duration_seconds: float
    mean_latency_ms: float | None
    median_latency_ms: float | None
    p95_latency_ms: float | None
    max_latency_ms: float | None
    throughput_ops_per_second: float
    error_rate: float


def percentile(values: list[float], percentile_value: float) -> float | None:
    """Return a linearly interpolated percentile for non-empty values."""
    if not values:
        return None
    if not 0 <= percentile_value <= 100:
        raise ValueError("percentile_value must be between 0 and 100")

    ordered = sorted(values)
    position = (len(ordered) - 1) * percentile_value / 100
    lower = int(position)
    upper = min(lower + 1, len(ordered) - 1)
    fraction = position - lower
    return ordered[lower] + (ordered[upper] - ordered[lower]) * fraction


def summarize_measurements(
    latencies_ms: list[float],
    error_count: int = 0,
    duration_seconds: float = 0.0,
) -> PerformanceMeasurement:
    """Aggregate operation latencies and error counts into metrics."""
    if not isinstance(latencies_ms, list):
        raise ValueError("latencies_ms must be a list")
    if any(
        isinstance(value, bool) or not isinstance(value, (int, float))
        or value < 0 or value == float("inf") or value != value
        for value in latencies_ms
    ):
        raise ValueError("latencies must be finite non-negative numbers")
    if isinstance(error_count, bool) or not isinstance(error_count, int) or error_count < 0:
        raise ValueError("error_count must be a non-negative integer")
    if (
        isinstance(duration_seconds, bool)
        or not isinstance(duration_seconds, (int, float))
        or duration_seconds < 0
        or duration_seconds == float("inf")
        or duration_seconds != duration_seconds
    ):
        raise ValueError("duration_seconds must be finite and non-negative")

    latencies = [float(value) for value in latencies_ms]
    success_count = len(latencies)
    operation_count = success_count + error_count

    return PerformanceMeasurement(
        operation_count=operation_count,
        success_count=success_count,
        error_count=error_count,
        duration_seconds=float(duration_seconds),
        mean_latency_ms=round(mean(latencies), 4) if latencies else None,
        median_latency_ms=round(percentile(latencies, 50), 4)
        if latencies else None,
        p95_latency_ms=round(percentile(latencies, 95), 4)
        if latencies else None,
        max_latency_ms=max(latencies) if latencies else None,
        throughput_ops_per_second=round(operation_count / duration_seconds, 4)
        if duration_seconds > 0 else 0.0,
        error_rate=round(error_count / operation_count, 4)
        if operation_count else 0.0,
    )


def measure_operation(operation: Callable[[], Any]) -> tuple[float, Any, Exception | None]:
    """Run one callable and return elapsed milliseconds, result, and error."""
    if not callable(operation):
        raise ValueError("operation must be callable")

    start = perf_counter()
    try:
        result = operation()
        return (perf_counter() - start) * 1000, result, None
    except Exception as exc:
        return (perf_counter() - start) * 1000, None, exc


def measurement_to_dict(measurement: PerformanceMeasurement) -> dict[str, Any]:
    """Convert a measurement into a serializable dictionary."""
    if not isinstance(measurement, PerformanceMeasurement):
        raise ValueError("measurement must be a PerformanceMeasurement")
    return asdict(measurement)
