from __future__ import annotations

from collections.abc import Iterable

from ..models import ModelRecord


def normalize_sync_models(
    models: Iterable[ModelRecord],
) -> list[ModelRecord]:
    """
    Normalize provider output for synchronization.

    Duplicate qualified model IDs are removed while preserving
    the original order.
    """

    result: list[ModelRecord] = []
    seen: set[str] = set()

    for model in models:
        if not isinstance(model, ModelRecord):
            raise TypeError(
                "sync input must contain only ModelRecord objects"
            )

        key = model.qualified_id.lower()

        if key in seen:
            continue

        seen.add(key)
        result.append(model)

    return result


def changed_models(
    existing: Iterable[ModelRecord],
    incoming: Iterable[ModelRecord],
) -> list[ModelRecord]:
    """
    Return incoming models whose canonical representation differs
    from the existing model with the same qualified ID.
    """

    existing_map = {
        model.qualified_id.lower(): model
        for model in existing
    }

    changed: list[ModelRecord] = []

    for model in normalize_sync_models(incoming):
        current = existing_map.get(
            model.qualified_id.lower()
        )

        if current != model:
            changed.append(model)

    return changed


def provider_models(
    models: Iterable[ModelRecord],
    provider: str,
) -> list[ModelRecord]:
    """
    Return models belonging to one provider.
    """

    value = provider.strip().lower()

    return [
        model
        for model in models
        if model.provider.strip().lower() == value
    ]


__all__ = [
    "normalize_sync_models",
    "changed_models",
    "provider_models",
]
