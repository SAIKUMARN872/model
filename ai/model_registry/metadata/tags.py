from __future__ import annotations

from collections.abc import Iterable


def normalize_tags(
    tags: Iterable[str],
) -> tuple[str, ...]:
    """
    Normalize model tags by trimming whitespace,
    converting to lowercase, and removing duplicates.
    """

    result: list[str] = []
    seen: set[str] = set()

    for tag in tags:
        if not isinstance(tag, str):
            raise TypeError("tags must contain only strings")

        value = tag.strip().lower()

        if not value or value in seen:
            continue

        seen.add(value)
        result.append(value)

    return tuple(result)


def merge_tags(
    *tag_sets: Iterable[str],
) -> tuple[str, ...]:
    """
    Merge multiple tag collections deterministically.
    """

    merged: list[str] = []

    for tags in tag_sets:
        merged.extend(tags)

    return normalize_tags(merged)


__all__ = [
    "normalize_tags",
    "merge_tags",
]
