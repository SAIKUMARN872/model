"""
Interfaces for usage forecasting implementations.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Sequence

from .models import (
    ForecastValue,
    UsagePoint,
)


class ForecastModel(ABC):
    """
    Base interface for forecasting algorithms.
    """

    @abstractmethod
    def forecast(
        self,
        values: Sequence[Decimal],
        horizon: int,
    ) -> list[Decimal]:
        """
        Generate future predictions.
        """
        raise NotImplementedError


class UsageForecaster(ABC):
    """
    High-level usage forecasting interface.
    """

    @abstractmethod
    def forecast(
        self,
        history: Sequence[UsagePoint],
        metrics: Sequence[str],
        horizon: int,
        method: str,
    ):
        """
        Generate a usage forecast.
        """
        raise NotImplementedError


class ForecastRepository(ABC):
    """
    Interface for retrieving historical usage.

    A database, Redis, data warehouse, or API implementation
    can implement this interface.
    """

    @abstractmethod
    def get_history(
        self,
        scope_id: str | None = None,
        limit: int | None = None,
    ) -> Sequence[UsagePoint]:
        """
        Return historical usage points.
        """
        raise NotImplementedError

    @abstractmethod
    def save_forecast(
        self,
        forecast,
    ) -> None:
        """
        Persist a forecast.
        """
        raise NotImplementedError