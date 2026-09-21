from __future__ import annotations

from collections.abc import Iterable

from ..models import ModelRecord


def normalize_models(
    models: Iterable[ModelRecord],
) -> list[ModelRecord]:
    """
    Normalize discovery output into a deterministic list.

    Discovery does not mutate ModelRecord objects.
    """
    result: list[ModelRecord] = []
    seen: set[str] = set()

    for model in models:
        if not isinstance(model, ModelRecord):
            raise TypeError(
                "discovery source returned a non-ModelRecord"
            )

        key = model.qualified_id.lower()

        if key in seen:
            continue

        seen.add(key)
        result.append(model)

    return result


def group_by_provider(
    models: Iterable[ModelRecord],
) -> dict[str, list[ModelRecord]]:
    grouped: dict[str, list[ModelRecord]] = {}

    for model in models:
        grouped.setdefault(
            model.provider,
            [],
        ).append(model)

    return grouped


def provider_names(
    models: Iterable[ModelRecord],
) -> set[str]:
    return {
        model.provider
        for model in models
    }


__all__ = [
    "normalize_models",
    "group_by_provider",
    "provider_names",
]
