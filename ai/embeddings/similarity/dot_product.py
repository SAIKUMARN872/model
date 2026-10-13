from __future__ import annotations

from collections.abc import Sequence

from .utils import validate_pair


def dot_product(a: Sequence[float], b: Sequence[float]) -> float:
    left, right = validate_pair(a, b)
    return sum(x * y for x, y in zip(left, right))
