from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable

from .memory import MemoryRecord


def normalize_model_id(model_id: str) -> str:
    value = str(model_id).strip()

    if not value:
        raise ValueError("model_id cannot be empty")

    return value


def normalize_request_id(request_id: str) -> str:
    value = str(request_id).strip()

    if not value:
        raise ValueError("request_id cannot be empty")

    return value


def filter_by_model(
    records: Iterable[MemoryRecord],
    model_id: str,
) -> list[MemoryRecord]:
    model_id = normalize_model_id(model_id)

    return [
        record
        for record in records
        if record.model_id == model_id
    ]


def filter_by_task(
    records: Iterable[MemoryRecord],
    task_type: str,
) -> list[MemoryRecord]:
    task = str(task_type).strip().lower()

    if not task:
        raise ValueError("task_type cannot be empty")

    return [
        record
        for record in records
        if record.task_type
        and record.task_type.strip().lower() == task
    ]


def successful_records(
    records: Iterable[MemoryRecord],
) -> list[MemoryRecord]:
    return [
        record
        for record in records
        if record.success
    ]


def failed_records(
    records: Iterable[MemoryRecord],
) -> list[MemoryRecord]:
    return [
        record
        for record in records
        if not record.success
    ]


def average_quality(
    records: Iterable[MemoryRecord],
) -> float:
    values = list(records)

    if not values:
        return 0.0

    return sum(
        record.quality_score
        for record in values
    ) / len(values)


def average_latency(
    records: Iterable[MemoryRecord],
) -> float:
    values = list(records)

    if not values:
        return 0.0

    return sum(
        record.latency_ms
        for record in values
    ) / len(values)


def average_cost(
    records: Iterable[MemoryRecord],
) -> float:
    values = list(records)

    if not values:
        return 0.0

    return sum(
        record.cost
        for record in values
    ) / len(values)


def success_rate(
    records: Iterable[MemoryRecord],
) -> float:
    values = list(records)

    if not values:
        return 0.0

    return sum(
        1 for record in values if record.success
    ) / len(values)


def group_by_model(
    records: Iterable[MemoryRecord],
) -> dict[str, list[MemoryRecord]]:
    grouped: dict[str, list[MemoryRecord]] = defaultdict(list)

    for record in records:
        grouped[record.model_id].append(record)

    return dict(grouped)


def group_by_task(
    records: Iterable[MemoryRecord],
) -> dict[str, list[MemoryRecord]]:
    grouped: dict[str, list[MemoryRecord]] = defaultdict(list)

    for record in records:
        task = record.task_type or "unknown"
        grouped[task].append(record)

    return dict(grouped)


def model_quality_map(
    records: Iterable[MemoryRecord],
) -> dict[str, float]:
    grouped = group_by_model(records)

    return {
        model_id: average_quality(model_records)
        for model_id, model_records in grouped.items()
    }


__all__ = [
    "average_cost",
    "average_latency",
    "average_quality",
    "failed_records",
    "filter_by_model",
    "filter_by_task",
    "group_by_model",
    "group_by_task",
    "model_quality_map",
    "normalize_model_id",
    "normalize_request_id",
    "success_rate",
    "successful_records",
]
