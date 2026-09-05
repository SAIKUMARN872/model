"""
Exceptions for the usage forecasting engine.
"""

from __future__ import annotations


class UsageForecastError(Exception):
    """Base exception for usage forecasting."""


class InvalidForecastRequestError(
    UsageForecastError
):
    """Raised when a forecast request is invalid."""


class InsufficientHistoryError(
    UsageForecastError
):
    """Raised when insufficient historical data exists."""


class UnsupportedForecastMethodError(
    UsageForecastError
):
    """Raised when an unsupported forecasting method is requested."""


class ForecastCalculationError(
    UsageForecastError
):
    """Raised when forecast calculation fails."""


class InvalidUsageDataError(
    UsageForecastError
):
    """Raised when usage history contains invalid data."""


class ForecastConfigurationError(
    UsageForecastError
):
    """Raised when forecast configuration is invalid."""