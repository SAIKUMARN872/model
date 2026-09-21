from __future__ import annotations

from ..models import ModelRecord


def search_models(
    models: list[ModelRecord],
    query: str,
) -> list[ModelRecord]:
    value = query.strip().lower()

    if not value:
        return list(models)

    results: list[ModelRecord] = []

    for model in models:
        candidates = (
            model.provider,
            model.model_id,
            model.display_name,
            *model.aliases,
        )

        if any(
            value in candidate.lower()
            for candidate in candidates
        ):
            results.append(model)

    return results


def exact_match(
    models: list[ModelRecord],
    query: str,
) -> ModelRecord | None:
    value = query.strip().lower()

    for model in models:
        if model.matches(value):
            return model

    return None


__all__ = [
    "search_models",
    "exact_match",
]
