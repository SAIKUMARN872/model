"""
Utilities for the ModelNow evaluation framework.
"""

from __future__ import annotations

import json
import math
import statistics
import time
from dataclasses import asdict, is_dataclass
from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    """Return current UTC datetime."""

    return datetime.now(
        timezone.utc
    )


def timer_start() -> float:
    """Start a monotonic timer."""

    return time.perf_counter()


def elapsed_ms(
    started_at: float,
) -> float:
    """Return elapsed time in milliseconds."""

    return (
        time.perf_counter()
        - started_at
    ) * 1000.0


def safe_mean(
    values: list[float],
) -> float:
    """Calculate a safe mean."""

    if not values:
        return 0.0

    return (
        sum(values)
        / len(values)
    )


def safe_median(
    values: list[float],
) -> float:
    """Calculate a safe median."""

    if not values:
        return 0.0

    return statistics.median(
        values
    )


def safe_min(
    values: list[float],
) -> float:
    if not values:
        return 0.0

    return min(values)


def safe_max(
    values: list[float],
) -> float:
    if not values:
        return 0.0

    return max(values)


def safe_stddev(
    values: list[float],
) -> float:
    if len(values) < 2:
        return 0.0

    return statistics.stdev(
        values
    )


def percentile(
    values: list[float],
    percentile_value: float,
) -> float:
    """
    Calculate a percentile using linear interpolation.
    """

    if not values:
        return 0.0

    if not 0 <= percentile_value <= 100:

        raise ValueError(
            "percentile must be between 0 and 100"
        )

    ordered = sorted(values)

    if len(ordered) == 1:
        return ordered[0]

    position = (
        percentile_value
        / 100
    ) * (
        len(ordered) - 1
    )

    lower = math.floor(
        position
    )

    upper = math.ceil(
        position
    )

    if lower == upper:
        return ordered[lower]

    weight = (
        position - lower
    )

    return (
        ordered[lower]
        * (1 - weight)
        + ordered[upper]
        * weight
    )


def normalize_metric_name(
    name: str,
) -> str:

    if not isinstance(
        name,
        str,
    ):

        raise TypeError(
            "Metric name must be a string"
        )

    name = name.strip().lower()

    if not name:

        raise ValueError(
            "Metric name cannot be empty"
        )

    return name.replace(
        " ",
        "_",
    )


def to_serializable(
    value: Any,
) -> Any:
    """
    Convert common Python objects into JSON-safe values.
    """

    if value is None:
        return None

    if isinstance(
        value,
        (
            str,
            int,
            float,
            bool,
        ),
    ):

        return value

    if isinstance(
        value,
        datetime,
    ):

        return value.isoformat()

    if is_dataclass(value):

        return to_serializable(
            asdict(value)
        )

    if isinstance(
        value,
        dict,
    ):

        return {
            str(key): to_serializable(
                item
            )
            for key, item in value.items()
        }

    if isinstance(
        value,
        (list, tuple, set),
    ):

        return [
            to_serializable(item)
            for item in value
        ]

    if hasattr(
        value,
        "to_dict",
    ):

        return to_serializable(
            value.to_dict()
        )

    return str(value)


def to_json(
    value: Any,
    indent: int = 2,
) -> str:

    return json.dumps(
        to_serializable(value),
        indent=indent,
        ensure_ascii=False,
    )


def validate_equal_lengths(
    *collections: Any,
) -> None:

    lengths = [
        len(collection)
        for collection
        in collections
    ]

    if not lengths:
        return

    if len(set(lengths)) != 1:

        raise ValueError(
            "All collections must have "
            "the same length"
        )


def clamp(
    value: float,
    minimum: float = 0.0,
    maximum: float = 1.0,
) -> float:

    return max(
        minimum,
        min(
            maximum,
            value,
        ),
    )


def percentage(
    value: float,
) -> float:

    return clamp(
        value
    ) * 100.0