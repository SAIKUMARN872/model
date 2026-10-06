from __future__ import annotations

from collections import defaultdict
from typing import Iterable

from .benchmark import BenchmarkResult


def normalize_model_id(model_id: str) -> str:
    value = str(model_id).strip()

    if not value:
        raise ValueError("model_id cannot be empty")

    return value


def normalize_task_type(task_type: str) -> str:
    value = str(task_type).strip().lower()

    if not value:
        raise ValueError("task_type cannot be empty")

    return value


def successful_results(
    results: Iterable[BenchmarkResult],
) -> list[BenchmarkResult]:
    return [
        result
        for result in results
        if _validate_result(result).success
    ]


def failed_results(
    results: Iterable[BenchmarkResult],
) -> list[BenchmarkResult]:
    return [
        result
        for result in results
        if not _validate_result(result).success
    ]


def filter_by_model(
    results: Iterable[BenchmarkResult],
    model_id: str,
) -> list[BenchmarkResult]:
    model_id = normalize_model_id(model_id)

    return [
        result
        for result in results
        if _validate_result(result).model_id == model_id
    ]


def filter_by_task(
    results: Iterable[BenchmarkResult],
    task_type: str,
) -> list[BenchmarkResult]:
    task_type = normalize_task_type(task_type)

    return [
        result
        for result in results
        if normalize_task_type(
            _validate_result(result).metadata.get(
                "task_type",
                "",
            )
        ) == task_type
    ]


def average_quality(
    results: Iterable[BenchmarkResult],
) -> float:
    values = list(results)

    if not values:
        return 0.0

    return sum(
        _validate_result(result).quality_score
        for result in values
    ) / len(values)


def average_latency(
    results: Iterable[BenchmarkResult],
) -> float:
    values = list(results)

    if not values:
        return 0.0

    return sum(
        _validate_result(result).latency_ms
        for result in values
    ) / len(values)


def average_cost(
    results: Iterable[BenchmarkResult],
) -> float:
    values = list(results)

    if not values:
        return 0.0

    return sum(
        _validate_result(result).cost
        for result in values
    ) / len(values)


def success_rate(
    results: Iterable[BenchmarkResult],
) -> float:
    values = list(results)

    if not values:
        return 0.0

    return sum(
        1
        for result in values
        if _validate_result(result).success
    ) / len(values)


def group_by_model(
    results: Iterable[BenchmarkResult],
) -> dict[str, list[BenchmarkResult]]:
    groups: dict[str, list[BenchmarkResult]] = defaultdict(list)

    for result in results:
        validated = _validate_result(result)
        groups[validated.model_id].append(validated)

    return dict(groups)


def group_by_task(
    results: Iterable[BenchmarkResult],
) -> dict[str, list[BenchmarkResult]]:
    groups: dict[str, list[BenchmarkResult]] = defaultdict(list)

    for result in results:
        validated = _validate_result(result)

        task_type = normalize_task_type(
            validated.metadata.get("task_type", "")
        )

        groups[task_type].append(validated)

    return dict(groups)


def model_quality_map(
    results: Iterable[BenchmarkResult],
) -> dict[str, float]:
    return {
        model_id: average_quality(model_results)
        for model_id, model_results in group_by_model(
            results
        ).items()
    }


def model_latency_map(
    results: Iterable[BenchmarkResult],
) -> dict[str, float]:
    return {
        model_id: average_latency(model_results)
        for model_id, model_results in group_by_model(
            results
        ).items()
    }


def model_cost_map(
    results: Iterable[BenchmarkResult],
) -> dict[str, float]:
    return {
        model_id: average_cost(model_results)
        for model_id, model_results in group_by_model(
            results
        ).items()
    }


def model_success_map(
    results: Iterable[BenchmarkResult],
) -> dict[str, float]:
    return {
        model_id: success_rate(model_results)
        for model_id, model_results in group_by_model(
            results
        ).items()
    }


def _validate_result(
    result: BenchmarkResult,
) -> BenchmarkResult:
    if not isinstance(result, BenchmarkResult):
        raise TypeError(
            "all results must be BenchmarkResult instances"
        )

    return result


__all__ = [
    "average_cost",
    "average_latency",
    "average_quality",
    "failed_results",
    "filter_by_model",
    "filter_by_task",
    "group_by_model",
    "group_by_task",
    "model_cost_map",
    "model_latency_map",
    "model_quality_map",
    "model_success_map",
    "normalize_model_id",
    "normalize_task_type",
    "success_rate",
    "successful_results",
]
