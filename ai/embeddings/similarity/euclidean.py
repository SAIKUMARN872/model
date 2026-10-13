from __future__ import annotations

import math
from collections.abc import Sequence

from .utils import validate_pair


def euclidean_distance(a: Sequence[float], b: Sequence[float]) -> float:
    left, right = validate_pair(a, b)
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(left, right)))
