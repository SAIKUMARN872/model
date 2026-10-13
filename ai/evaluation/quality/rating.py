"""Validated quality ratings and score thresholds."""

from dataclasses import dataclass


@dataclass(frozen=True)
class QualityRating:
    score: float
    label: str
    passed: bool
    threshold: float


def rate_quality(score: float, threshold: float = 0.7) -> QualityRating:
    """Convert a normalized score into a readable rating."""
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise TypeError("score must be a number")
    if isinstance(threshold, bool) or not isinstance(threshold, (int, float)):
        raise TypeError("threshold must be a number")
    if not 0.0 <= score <= 1.0:
        raise ValueError("score must be between 0 and 1")
    if not 0.0 <= threshold <= 1.0:
        raise ValueError("threshold must be between 0 and 1")

    if score >= 0.85:
        label = "excellent"
    elif score >= 0.70:
        label = "good"
    elif score >= 0.50:
        label = "fair"
    else:
        label = "poor"

    return QualityRating(
        score=round(float(score), 4),
        label=label,
        passed=score >= threshold,
        threshold=float(threshold),
    )
