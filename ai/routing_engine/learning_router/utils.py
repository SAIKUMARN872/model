from __future__ import annotations

from collections import defaultdict

from .feedback import RoutingFeedback


def normalize_model_id(model_id: str) -> str:
    return str(model_id).strip().lower()


def normalize_task_type(task_type: str) -> str:
    return str(task_type).strip().lower()


def filter_by_model(
    feedback: list[RoutingFeedback],
    model_id: str,
) -> list[RoutingFeedback]:
    model_id = normalize_model_id(model_id)

    return [
        item
        for item in feedback
        if normalize_model_id(item.model_id) == model_id
    ]


def filter_by_task(
    feedback: list[RoutingFeedback],
    task_type: str,
) -> list[RoutingFeedback]:
    task_type = normalize_task_type(task_type)

    return [
        item
        for item in feedback
        if normalize_task_type(item.task_type) == task_type
    ]


def successful_feedback(
    feedback: list[RoutingFeedback],
) -> list[RoutingFeedback]:
    return [
        item
        for item in feedback
        if item.success
    ]


def failed_feedback(
    feedback: list[RoutingFeedback],
) -> list[RoutingFeedback]:
    return [
        item
        for item in feedback
        if not item.success
    ]


def average_quality(
    feedback: list[RoutingFeedback],
) -> float:
    if not feedback:
        return 0.0

    return sum(
        item.quality_score
        for item in feedback
    ) / len(feedback)


def average_latency(
    feedback: list[RoutingFeedback],
) -> float:
    if not feedback:
        return 0.0

    return sum(
        item.latency_ms
        for item in feedback
    ) / len(feedback)


def average_cost(
    feedback: list[RoutingFeedback],
) -> float:
    if not feedback:
        return 0.0

    return sum(
        item.cost
        for item in feedback
    ) / len(feedback)


def success_rate(
    feedback: list[RoutingFeedback],
) -> float:
    if not feedback:
        return 0.0

    return sum(
        1 for item in feedback
        if item.success
    ) / len(feedback)


def group_by_model(
    feedback: list[RoutingFeedback],
) -> dict[str, list[RoutingFeedback]]:
    groups: dict[str, list[RoutingFeedback]] = defaultdict(list)

    for item in feedback:
        groups[
            normalize_model_id(item.model_id)
        ].append(item)

    return dict(groups)


def group_by_task(
    feedback: list[RoutingFeedback],
) -> dict[str, list[RoutingFeedback]]:
    groups: dict[str, list[RoutingFeedback]] = defaultdict(list)

    for item in feedback:
        groups[
            normalize_task_type(item.task_type)
        ].append(item)

    return dict(groups)


def model_quality_map(
    feedback: list[RoutingFeedback],
) -> dict[str, float]:
    return {
        model_id: average_quality(records)
        for model_id, records
        in group_by_model(feedback).items()
    }


def model_success_map(
    feedback: list[RoutingFeedback],
) -> dict[str, float]:
    return {
        model_id: success_rate(records)
        for model_id, records
        in group_by_model(feedback).items()
    }


def model_latency_map(
    feedback: list[RoutingFeedback],
) -> dict[str, float]:
    return {
        model_id: average_latency(records)
        for model_id, records
        in group_by_model(feedback).items()
    }


def model_cost_map(
    feedback: list[RoutingFeedback],
) -> dict[str, float]:
    return {
        model_id: average_cost(records)
        for model_id, records
        in group_by_model(feedback).items()
    }


__all__ = [
    "average_cost",
    "average_latency",
    "average_quality",
    "failed_feedback",
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
    "successful_feedback",
    "success_rate",
]
