"""
Utility functions for usage forecasting.
"""

from __future__ import annotations

from decimal import Decimal
from statistics import mean, pstdev
from typing import Iterable, Sequence

from .exceptions import InvalidUsageDataError


def decimal_values(
    values: Iterable[int | float | Decimal | str],
) -> list[Decimal]:

    result: list[Decimal] = []

    for value in values:

        try:
            converted = Decimal(
                str(value)
            )
        except Exception as exc:

            raise InvalidUsageDataError(
                f"Invalid numeric value: {value}"
            ) from exc

        if converted < 0:
            raise InvalidUsageDataError(
                "Usage values cannot be negative"
            )

        result.append(converted)

    return result


def moving_average(
    values: Sequence[Decimal],
    window: int,
) -> Decimal:

    if not values:
        return Decimal("0")

    if window <= 0:
        raise ValueError(
            "window must be positive"
        )

    selected = values[-window:]

    return sum(
        selected,
        Decimal("0"),
    ) / Decimal(len(selected))


def weighted_moving_average(
    values: Sequence[Decimal],
    window: int,
) -> Decimal:

    if not values:
        return Decimal("0")

    if window <= 0:
        raise ValueError(
            "window must be positive"
        )

    selected = list(
        values[-window:]
    )

    weights = list(
        range(1, len(selected) + 1)
    )

    weighted_sum = sum(
        (
            value * Decimal(weight)
            for value, weight
            in zip(
                selected,
                weights,
            )
        ),
        Decimal("0"),
    )

    total_weight = sum(weights)

    return (
        weighted_sum
        / Decimal(total_weight)
    )


def exponential_smoothing(
    values: Sequence[Decimal],
    alpha: float,
) -> Decimal:

    if not values:
        return Decimal("0")

    if not 0 < alpha <= 1:
        raise ValueError(
            "alpha must be between 0 and 1"
        )

    result = values[0]

    alpha_decimal = Decimal(
        str(alpha)
    )

    for value in values[1:]:

        result = (
            alpha_decimal * value
            + (
                Decimal("1")
                - alpha_decimal
            )
            * result
        )

    return result


def linear_trend(
    values: Sequence[Decimal],
) -> tuple[Decimal, Decimal]:

    if len(values) < 2:
        if values:
            return (
                Decimal("0"),
                values[0],
            )

        return (
            Decimal("0"),
            Decimal("0"),
        )

    n = Decimal(len(values))

    x_values = [
        Decimal(index)
        for index in range(len(values))
    ]

    x_mean = (
        sum(x_values)
        / n
    )

    y_mean = (
        sum(values)
        / n
    )

    numerator = sum(
        (
            (x - x_mean)
            * (y - y_mean)
            for x, y
            in zip(x_values, values)
        ),
        Decimal("0"),
    )

    denominator = sum(
        (
            (x - x_mean) ** 2
            for x in x_values
        ),
        Decimal("0"),
    )

    if denominator == 0:
        slope = Decimal("0")
    else:
        slope = (
            numerator
            / denominator
        )

    intercept = (
        y_mean
        - slope * x_mean
    )

    return slope, intercept


def forecast_linear(
    values: Sequence[Decimal],
    horizon: int,
) -> list[Decimal]:

    if horizon <= 0:
        raise ValueError(
            "horizon must be positive"
        )

    slope, intercept = linear_trend(
        values
    )

    start = len(values)

    predictions: list[Decimal] = []

    for index in range(
        start,
        start + horizon,
    ):

        prediction = (
            slope * Decimal(index)
            + intercept
        )

        predictions.append(
            max(
                Decimal("0"),
                prediction,
            )
        )

    return predictions


def standard_deviation(
    values: Sequence[Decimal],
) -> Decimal:

    if len(values) <= 1:
        return Decimal("0")

    numeric_values = [
        float(value)
        for value in values
    ]

    return Decimal(
        str(pstdev(numeric_values))
    )


def confidence_bounds(
    predictions: Sequence[Decimal],
    history: Sequence[Decimal],
    confidence_level: float = 0.95,
) -> list[
    tuple[Decimal, Decimal]
]:

    if not 0 < confidence_level < 1:
        raise ValueError(
            "confidence_level must be between 0 and 1"
        )

    deviation = standard_deviation(
        history
    )

    # Approximation using approximately
    # 1.96 standard deviations for 95%.
    if confidence_level >= 0.99:
        multiplier = Decimal("2.576")
    elif confidence_level >= 0.95:
        multiplier = Decimal("1.96")
    elif confidence_level >= 0.90:
        multiplier = Decimal("1.645")
    else:
        multiplier = Decimal("1.0")

    margin = (
        deviation * multiplier
    )

    result = []

    for prediction in predictions:

        lower = max(
            Decimal("0"),
            prediction - margin,
        )

        upper = (
            prediction + margin
        )

        result.append(
            (lower, upper)
        )

    return result


def growth_rate(
    values: Sequence[Decimal],
) -> Decimal:

    if len(values) < 2:
        return Decimal("0")

    first = values[0]
    last = values[-1]

    if first <= 0:
        return Decimal("0")

    return (
        (last - first)
        / first
        * Decimal("100")
    )


def total(
    values: Iterable[Decimal],
) -> Decimal:

    return sum(
        values,
        Decimal("0"),
    )


def clamp(
    value: Decimal,
    minimum: Decimal,
    maximum: Decimal,
) -> Decimal:

    return max(
        minimum,
        min(value, maximum),
    )