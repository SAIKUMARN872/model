"""
Constants used by the usage forecasting engine.
"""

from __future__ import annotations

from enum import Enum


class ForecastPeriod(str, Enum):
    """Supported forecast periods."""

    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"


class ForecastMetric(str, Enum):
    """Metrics that can be forecast."""

    REQUESTS = "requests"
    TOKENS = "tokens"
    INPUT_TOKENS = "input_tokens"
    OUTPUT_TOKENS = "output_tokens"
    COST = "cost"


class ForecastMethod(str, Enum):
    """Forecasting methods."""

    MOVING_AVERAGE = "moving_average"
    WEIGHTED_MOVING_AVERAGE = "weighted_moving_average"
    LINEAR_TREND = "linear_trend"
    EXPONENTIAL_SMOOTHING = "exponential_smoothing"


DEFAULT_WINDOW_SIZE = 7

DEFAULT_FORECAST_HORIZON = 7

DEFAULT_CONFIDENCE_LEVEL = 0.95

MIN_HISTORY_POINTS = 2

MAX_HISTORY_POINTS = 10_000

DEFAULT_DECAY_FACTOR = 0.5

DEFAULT_GROWTH_RATE = 0.0

SECONDS_PER_MINUTE = 60

SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE

SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR

SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY

SECONDS_PER_MONTH = 30 * SECONDS_PER_DAY