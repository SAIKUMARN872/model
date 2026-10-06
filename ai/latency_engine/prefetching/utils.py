from __future__ import annotations

import hashlib
import time
from collections.abc import Iterable


def normalize_key(value: str) -> str:
    if not isinstance(value, str):
        raise TypeError("value must be a string")

    normalized = " ".join(value.strip().lower().split())

    if not normalized:
        raise ValueError("value must not be empty")

    return normalized


def build_prefetch_key(
    request: str,
    *,
    namespace: str = "modelnow:prefetch",
) -> str:
    normalized = normalize_key(request)

    if not namespace or not namespace.strip():
        raise ValueError("namespace must not be empty")

    digest = hashlib.sha256(
        normalized.encode("utf-8")
    ).hexdigest()

    return f"{namespace.strip()}:{digest}"


def clamp_confidence(value: float) -> float:
    value = float(value)

    if value < 0.0:
        return 0.0

    if value > 1.0:
        return 1.0

    return value


def calculate_frequency(
    values: Iterable[str],
    target: str,
) -> int:
    normalized_target = normalize_key(target)

    return sum(
        1
        for value in values
        if normalize_key(value) == normalized_target
    )


def recency_score(
    *,
    age_seconds: float,
    half_life_seconds: float = 60.0,
) -> float:
    age_seconds = float(age_seconds)
    half_life_seconds = float(half_life_seconds)

    if age_seconds < 0.0:
        raise ValueError("age_seconds must be nonnegative")

    if half_life_seconds <= 0.0:
        raise ValueError(
            "half_life_seconds must be positive"
        )

    score = 0.5 ** (
        age_seconds / half_life_seconds
    )

    return clamp_confidence(score)


def now_seconds() -> float:
    return time.time()


def weighted_score(
    *,
    confidence: float,
    frequency: float,
    recency: float,
    confidence_weight: float = 0.5,
    frequency_weight: float = 0.3,
    recency_weight: float = 0.2,
) -> float:
    weights = (
        confidence_weight,
        frequency_weight,
        recency_weight,
    )

    if any(weight < 0.0 for weight in weights):
        raise ValueError(
            "weights must be nonnegative"
        )

    total_weight = sum(weights)

    if total_weight <= 0.0:
        raise ValueError(
            "at least one weight must be positive"
        )

    score = (
        clamp_confidence(confidence)
        * confidence_weight
        + clamp_confidence(frequency)
        * frequency_weight
        + clamp_confidence(recency)
        * recency_weight
    )

    return score / total_weight
