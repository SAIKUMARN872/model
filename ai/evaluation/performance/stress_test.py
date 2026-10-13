"""Concurrency-level stress testing for a supplied callable."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
from time import perf_counter
from typing import Any, Callable

from ai.evaluation.performance.performance import (
    measure_operation,
    summarize_measurements,
)


def run_stress_test(
    operation: Callable[[], Any],
    concurrency_levels: list[int] | None = None,
    iterations_per_worker: int = 2,
) -> dict[str, Any]:
    """Run bounded concurrent workloads at each requested worker level."""
    if not callable(operation):
        raise ValueError("operation must be callable")
    if concurrency_levels is None:
        concurrency_levels = [1, 2, 4]

    if not isinstance(concurrency_levels, list) or not concurrency_levels:
        raise ValueError("concurrency_levels must be a non-empty list")
    if any(
        isinstance(level, bool) or not isinstance(level, int) or level < 1
        for level in concurrency_levels
    ):
        raise ValueError("each concurrency level must be a positive integer")
    if len(set(concurrency_levels)) != len(concurrency_levels):
        raise ValueError("concurrency_levels must not contain duplicates")
    if (
        isinstance(iterations_per_worker, bool)
        or not isinstance(iterations_per_worker, int)
        or iterations_per_worker < 1
    ):
        raise ValueError("iterations_per_worker must be a positive integer")

    levels = []
    for workers in concurrency_levels:
        latencies = []
        errors = []
        total_operations = workers * iterations_per_worker
        start = perf_counter()

        with ThreadPoolExecutor(max_workers=workers) as executor:
            futures = [
                executor.submit(measure_operation, operation)
                for _ in range(total_operations)
            ]
            for index, future in enumerate(as_completed(futures), start=1):
                try:
                    latency_ms, _, error = future.result()
                    if error is None:
                        latencies.append(latency_ms)
                    else:
                        errors.append({
                            "operation": index,
                            "error_type": type(error).__name__,
                            "message": str(error),
                        })
                except Exception as exc:
                    errors.append({
                        "operation": index,
                        "error_type": type(exc).__name__,
                        "message": str(exc),
                    })

        duration = perf_counter() - start
        measurement = summarize_measurements(
            latencies,
            error_count=len(errors),
            duration_seconds=duration,
        )
        levels.append({
            "concurrency": workers,
            "requested_operations": total_operations,
            "measurement": measurement.__dict__,
            "errors": errors,
        })

    return {
        "test_type": "stress",
        "status": "completed",
        "levels": levels,
        "limitations": [
            "Thread-based concurrency may not represent production traffic.",
            "Each worker invokes the supplied callable independently.",
            "Results are affected by machine load, network conditions, and callable behavior.",
        ],
    }
