from __future__ import annotations

import math
from collections.abc import Sequence

from .utils import validate_pair


def cosine_similarity(a: Sequence[float], b: Sequence[float]) -> float:
    left, right = validate_pair(a, b)
    left_norm = math.sqrt(sum(x * x for x in left))
    right_norm = math.sqrt(sum(x * x for x in right))

    if left_norm == 0 or right_norm == 0:
        raise ValueError("cosine similarity is undefined for zero vectors")

    result = sum(x * y for x, y in zip(left, right)) / (left_norm * right_norm)
    return max(-1.0, min(1.0, result))
