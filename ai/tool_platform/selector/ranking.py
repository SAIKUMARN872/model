"""Deterministic ranking of scored tool candidates."""

from __future__ import annotations

from typing import Any, Iterable


def rank_candidates(
    candidates: Iterable[tuple[Any, float]],
) -> list[tuple[Any, float]]:
    """Sort by descending score, then stable tool name and version."""
    return sorted(
        candidates,
        key=lambda item: (
            -item[1],
            item[0].name.casefold(),
            tuple(int(part) for part in item[0].version.split(".")),
        ),
    )
