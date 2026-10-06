from __future__ import annotations

from enum import Enum


class PrefetchStrategy(str, Enum):
    DISABLED = "disabled"
    ALWAYS = "always"
    CONFIDENCE = "confidence"
    FREQUENCY = "frequency"
    RECENCY = "recency"


DEFAULT_STRATEGY = PrefetchStrategy.CONFIDENCE


def should_prefetch(
    strategy: PrefetchStrategy,
    *,
    confidence: float = 0.0,
    frequency: int = 0,
    recency_score: float = 0.0,
    min_confidence: float = 0.7,
    min_frequency: int = 2,
    min_recency_score: float = 0.7,
) -> bool:
    if not isinstance(strategy, PrefetchStrategy):
        strategy = PrefetchStrategy(strategy)

    if strategy is PrefetchStrategy.DISABLED:
        return False

    if strategy is PrefetchStrategy.ALWAYS:
        return True

    if strategy is PrefetchStrategy.CONFIDENCE:
        return confidence >= min_confidence

    if strategy is PrefetchStrategy.FREQUENCY:
        return frequency >= min_frequency

    if strategy is PrefetchStrategy.RECENCY:
        return recency_score >= min_recency_score

    return False
