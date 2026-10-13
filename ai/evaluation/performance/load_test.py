"""Fixed-iteration load testing for a supplied callable."""
from __future__ import annotations

from time import perf_counter
from typing import Any, Callable

from ai.evaluation.performance.performance import (
    measure_operation,
    summarize_measurements,
)


def run_load_test(
    operation: Callable[[], Any],
    iterations: int = 10,
) -> dict[str, Any]:
    """Run sequential operations and return aggregated performance metrics."""
    if not callable(operation):
        raise ValueError("operation must be callable")
    if isinstance(iterations, bool) or not isinstance(iterations, int) or iterations < 1:
        raise ValueError("iterations must be a positive integer")

    latencies = []
    errors = []
    start = perf_counter()

    for index in range(iterations):
        latency_ms, _, error = measure_operation(operation)
        if error is None:
            latencies.append(latency_ms)
        else:
            errors.append({
                "iteration": index + 1,
                "error_type": type(error).__name__,
                "message": str(error),
            })

    duration = perf_counter() - start
    measurement = summarize_measurements(
        latencies,
        error_count=len(errors),
        duration_seconds=duration,
    )

    return {
        "test_type": "load",
        "status": "completed",
        "requested_iterations": iterations,
        "measurement": measurement.__dict__,
        "errors": errors,
        "limitations": [
            "Operations execute sequentially; this is not a concurrency test.",
            "Results depend on the supplied callable and test environment.",
        ],
    }
