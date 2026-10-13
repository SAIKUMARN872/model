from __future__ import annotations

from collections.abc import Iterable


def validate_k(k: int | None) -> int | None:
    if k is None:
        return None
    if isinstance(k, bool) or not isinstance(k, int):
        raise TypeError("k must be an integer or None")
    if k < 1:
        raise ValueError("k must be greater than or equal to 1")
    return k


def unique_ids(values: Iterable[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()

    for value in values:
        if not isinstance(value, str):
            raise TypeError("Document IDs must be strings")
        if not value.strip():
            raise ValueError("Document IDs must not be empty")
        if value not in seen:
            seen.add(value)
            result.append(value)

    return result


def normalize_relevant_ids(values: Iterable[str]) -> set[str]:
    return set(unique_ids(values))
