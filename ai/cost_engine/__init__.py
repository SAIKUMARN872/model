"""
Usage Forecaster package for the ModelNow Cost Engine.
"""

from .constants import (
    ForecastMetric,
    ForecastMethod,
    ForecastPeriod,
    DEFAULT_CONFIDENCE_LEVEL,
    DEFAULT_DECAY_FACTOR,
    DEFAULT_FORECAST_HORIZON,
    DEFAULT_WINDOW_SIZE,
)

from .engine import (
    UsageForecastEngine,
)

from .exceptions import (
    ForecastCalculationError,
    ForecastConfigurationError,
    InsufficientHistoryError,
    InvalidForecastRequestError,
    InvalidUsageDataError,
    UnsupportedForecastMethodError,
    UsageForecastError,
)

from .interfaces import (
    ForecastModel,
    ForecastRepository,
    UsageForecaster,
)

from .models import (
    ForecastConfiguration,
    ForecastValue,
    UsageForecast,
    UsagePoint,
)

from .schemas import (
    ForecastRequest,
    ForecastResponse,
    ForecastSummary,
)

from .utils import (
    confidence_bounds,
    exponential_smoothing,
    forecast_linear,
    growth_rate,
    linear_trend,
    moving_average,
    standard_deviation,
    weighted_moving_average,
)


__all__ = [
    # Constants
    "ForecastMetric",
    "ForecastMethod",
    "ForecastPeriod",
    "DEFAULT_CONFIDENCE_LEVEL",
    "DEFAULT_DECAY_FACTOR",
    "DEFAULT_FORECAST_HORIZON",
    "DEFAULT_WINDOW_SIZE",

    # Engine
    "UsageForecastEngine",

    # Exceptions
    "UsageForecastError",
    "ForecastCalculationError",
    "ForecastConfigurationError",
    "InsufficientHistoryError",
    "InvalidForecastRequestError",
    "InvalidUsageDataError",
    "UnsupportedForecastMethodError",

    # Interfaces
    "ForecastModel",
    "ForecastRepository",
    "UsageForecaster",

    # Models
    "ForecastConfiguration",
    "ForecastValue",
    "UsageForecast",
    "UsagePoint",

    # Schemas
    "ForecastRequest",
    "ForecastResponse",
    "ForecastSummary",

    # Utilities
    "moving_average",
    "weighted_moving_average",
    "exponential_smoothing",
    "linear_trend",
    "forecast_linear",
    "confidence_bounds",
    "standard_deviation",
    "growth_rate",
]


__version__ = "1.0.0"