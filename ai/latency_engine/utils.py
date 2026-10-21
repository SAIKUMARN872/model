from __future__ import annotations

from statistics import mean
from typing import Iterable


def validate_latency(value: float, name: str = "latency_ms") -> float:
    """Validate and normalize a latency value."""
    normalized = float(value)

    if normalized < 0.0:
        raise ValueError(f"{name} cannot be negative")

    return normalized


def validate_positive(value: float, name: str) -> float:
    """Validate that a numeric value is strictly positive."""
    normalized = float(value)

    if normalized <= 0.0:
        raise ValueError(f"{name} must be greater than zero")

    return normalized


def percentile(
    values: Iterable[float],
    percentile_value: float,
) -> float:
    """Calculate a percentile using linear interpolation."""
    samples = sorted(float(value) for value in values)

    if not samples:
        raise ValueError("values cannot be empty")

    if not 0.0 <= percentile_value <= 100.0:
        raise ValueError(
            "percentile_value must be between 0 and 100"
        )

    if len(samples) == 1:
        return samples[0]

    position = (len(samples) - 1) * (percentile_value / 100.0)
    lower = int(position)
    upper = min(lower + 1, len(samples) - 1)
    fraction = position - lower

    return (
        samples[lower]
        + (samples[upper] - samples[lower]) * fraction
    )


def average(values: Iterable[float]) -> float:
    """Calculate the arithmetic mean of numeric values."""
    samples = [float(value) for value in values]

    if not samples:
        raise ValueError("values cannot be empty")

    return float(mean(samples))


def percentage_change(
    baseline: float,
    current: float,
) -> float:
    """Calculate percentage change from baseline to current."""
    baseline_value = validate_positive(
        baseline,
        "baseline",
    )
    current_value = validate_latency(
        current,
        "current",
    )

    return ((current_value - baseline_value) / baseline_value) * 100.0


def clamp(
    value: float,
    minimum: float = 0.0,
    maximum: float = 1.0,
) -> float:
    """Clamp a numeric value to a specified range."""
    if minimum > maximum:
        raise ValueError(
            "minimum cannot be greater than maximum"
        )

    return max(minimum, min(float(value), maximum))


def latency_values(
    observations: Iterable[object],
    attribute: str = "total_latency_ms",
) -> list[float]:
    """Extract and validate latency values from observations."""
    values: list[float] = []

    for observation in observations:
        if not hasattr(observation, attribute):
            raise AttributeError(
                f"observation has no attribute '{attribute}'"
            )

        value = getattr(observation, attribute)

        if value is None:
            continue

        values.append(validate_latency(value, attribute))

    return values


__all__ = [
    "validate_latency",
    "validate_positive",
    "percentile",
    "average",
    "percentage_change",
    "clamp",
    "latency_values",
]
