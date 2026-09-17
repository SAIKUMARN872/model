"""
Benchmark calculation utilities.
"""

from __future__ import annotations


def safe_divide(
    numerator: float,
    denominator: float,
) -> float:

    if denominator == 0:
        return 0.0

    return numerator / denominator


def average(
    values: list[float],
) -> float:

    if not values:
        return 0.0

    return sum(
        values
    ) / len(values)


def percentile(
    values: list[float],
    percentile_value: float,
) -> float:

    if not values:
        return 0.0

    if not 0 <= percentile_value <= 100:

        raise ValueError(
            "percentile must be between 0 and 100."
        )

    ordered = sorted(
        float(value)
        for value in values
    )

    if len(ordered) == 1:
        return ordered[0]

    position = (
        percentile_value
        / 100
        * (
            len(ordered) - 1
        )
    )

    lower = int(
        position
    )

    upper = min(
        lower + 1,
        len(ordered) - 1,
    )

    weight = (
        position - lower
    )

    return (
        ordered[lower]
        + (
            ordered[upper]
            - ordered[lower]
        )
        * weight
    )