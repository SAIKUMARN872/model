from __future__ import annotations

from ..models import ModelRecord


def sort_by_quality(
    models: list[ModelRecord],
) -> list[ModelRecord]:
    return sorted(
        models,
        key=lambda model: (
            model.quality_score
            if model.quality_score is not None
            else -1.0
        ),
        reverse=True,
    )


def sort_by_latency(
    models: list[ModelRecord],
) -> list[ModelRecord]:
    return sorted(
        models,
        key=lambda model: (
            model.latency_ms
            if model.latency_ms is not None
            else float("inf")
        ),
    )


def sort_by_input_cost(
    models: list[ModelRecord],
) -> list[ModelRecord]:
    return sorted(
        models,
        key=lambda model: model.pricing.input_per_1m_tokens,
    )


def sort_by_output_cost(
    models: list[ModelRecord],
) -> list[ModelRecord]:
    return sorted(
        models,
        key=lambda model: model.pricing.output_per_1m_tokens,
    )


def unique_models(
    models: list[ModelRecord],
) -> list[ModelRecord]:
    seen: set[str] = set()
    result: list[ModelRecord] = []

    for model in models:
        key = model.qualified_id.lower()

        if key in seen:
            continue

        seen.add(key)
        result.append(model)

    return result


__all__ = [
    "sort_by_quality",
    "sort_by_latency",
    "sort_by_input_cost",
    "sort_by_output_cost",
    "unique_models",
]
