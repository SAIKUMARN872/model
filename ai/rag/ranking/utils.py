from __future__ import annotations

from math import isfinite


def validate_top_n(top_n: int | None, available_count: int) -> None:
    """Validate a requested result limit against available results."""
    if isinstance(available_count, bool) or not isinstance(available_count, int):
        raise ValueError("available_count must be an integer.")

    if available_count < 0:
        raise ValueError("available_count cannot be negative.")

    if top_n is None:
        return

    if isinstance(top_n, bool) or not isinstance(top_n, int):
        raise ValueError("top_n must be an integer or None.")

    if top_n < 0:
        raise ValueError("top_n cannot be negative.")


def validate_score(score: float) -> float:
    """Return a finite relevance score or raise ValueError."""
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise ValueError("Ranking score must be numeric.")

    if not isfinite(score):
        raise ValueError("Ranking score must be finite.")

    return float(score)


__all__ = ["validate_top_n", "validate_score"]
