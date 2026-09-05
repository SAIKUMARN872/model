"""
Main usage forecasting engine.
"""

from __future__ import annotations

from datetime import timedelta
from decimal import Decimal
from typing import Sequence

from .constants import (
    ForecastMethod,
)
from .exceptions import (
    ForecastCalculationError,
    InsufficientHistoryError,
    UnsupportedForecastMethodError,
)
from .interfaces import UsageForecaster
from .models import (
    ForecastValue,
    UsageForecast,
    UsagePoint,
)
from .utils import (
    confidence_bounds,
    exponential_smoothing,
    forecast_linear,
    moving_average,
    weighted_moving_average,
)


class UsageForecastEngine(UsageForecaster):
    """
    Main usage forecasting engine.

    Supports:

    - moving average
    - weighted moving average
    - exponential smoothing
    - linear trend
    """

    def __init__(
        self,
        minimum_history_points: int = 2,
        window_size: int = 7,
        confidence_level: float = 0.95,
        decay_factor: float = 0.5,
    ) -> None:

        if minimum_history_points <= 0:
            raise ValueError(
                "minimum_history_points must be positive"
            )

        if window_size <= 0:
            raise ValueError(
                "window_size must be positive"
            )

        if not 0 < confidence_level < 1:
            raise ValueError(
                "confidence_level must be between 0 and 1"
            )

        if not 0 < decay_factor <= 1:
            raise ValueError(
                "decay_factor must be between 0 and 1"
            )

        self.minimum_history_points = (
            minimum_history_points
        )

        self.window_size = window_size

        self.confidence_level = (
            confidence_level
        )

        self.decay_factor = decay_factor

    def forecast(
        self,
        history: Sequence[UsagePoint],
        metrics: Sequence[str],
        horizon: int,
        method: str,
        scope_id: str | None = None,
        period: str = "day",
    ) -> UsageForecast:

        if len(history) < (
            self.minimum_history_points
        ):
            raise InsufficientHistoryError(
                "At least "
                f"{self.minimum_history_points} "
                "historical points are required"
            )

        if horizon <= 0:
            raise ValueError(
                "horizon must be positive"
            )

        if not metrics:
            raise ValueError(
                "At least one metric is required"
            )

        sorted_history = sorted(
            history,
            key=lambda item: item.timestamp,
        )

        forecast_values: list[
            ForecastValue
        ] = []

        for metric in metrics:

            values = self._extract_metric(
                sorted_history,
                metric,
            )

            predictions = self._predict(
                values=values,
                horizon=horizon,
                method=method,
            )

            bounds = confidence_bounds(
                predictions=predictions,
                history=values,
                confidence_level=(
                    self.confidence_level
                ),
            )

            for index, prediction in enumerate(
                predictions
            ):

                timestamp = (
                    self._future_timestamp(
                        sorted_history,
                        index + 1,
                        period,
                    )
                )

                lower, upper = bounds[index]

                forecast_values.append(
                    ForecastValue(
                        metric=metric,
                        predicted_value=prediction,
                        lower_bound=lower,
                        upper_bound=upper,
                        confidence=(
                            self.confidence_level
                        ),
                        timestamp=timestamp,
                    )
                )

        return UsageForecast(
            scope_id=scope_id,
            method=method,
            period=period,
            horizon=horizon,
            forecasts=forecast_values,
            metadata={
                "history_points": len(
                    sorted_history
                ),
                "window_size": self.window_size,
                "confidence_level": (
                    self.confidence_level
                ),
            },
        )

    def _predict(
        self,
        values: Sequence[Decimal],
        horizon: int,
        method: str,
    ) -> list[Decimal]:

        if len(values) < (
            self.minimum_history_points
        ):
            raise InsufficientHistoryError(
                "Not enough historical values"
            )

        try:

            if (
                method
                == ForecastMethod.MOVING_AVERAGE.value
            ):

                prediction = moving_average(
                    values,
                    self.window_size,
                )

                return [
                    max(
                        Decimal("0"),
                        prediction,
                    )
                    for _ in range(horizon)
                ]

            if (
                method
                == ForecastMethod.WEIGHTED_MOVING_AVERAGE.value
            ):

                prediction = (
                    weighted_moving_average(
                        values,
                        self.window_size,
                    )
                )

                return [
                    max(
                        Decimal("0"),
                        prediction,
                    )
                    for _ in range(horizon)
                ]

            if (
                method
                == ForecastMethod.EXPONENTIAL_SMOOTHING.value
            ):

                prediction = (
                    exponential_smoothing(
                        values,
                        self.decay_factor,
                    )
                )

                return [
                    max(
                        Decimal("0"),
                        prediction,
                    )
                    for _ in range(horizon)
                ]

            if (
                method
                == ForecastMethod.LINEAR_TREND.value
            ):

                return forecast_linear(
                    values,
                    horizon,
                )

        except Exception as exc:

            if isinstance(
                exc,
                (
                    ValueError,
                    InsufficientHistoryError,
                ),
            ):
                raise

            raise ForecastCalculationError(
                f"Forecast calculation failed: {exc}"
            ) from exc

        raise UnsupportedForecastMethodError(
            f"Unsupported forecast method: {method}"
        )

    @staticmethod
    def _extract_metric(
        history: Sequence[UsagePoint],
        metric: str,
    ) -> list[Decimal]:

        if metric == "requests":
            return [
                Decimal(point.requests)
                for point in history
            ]

        if metric == "tokens":
            return [
                Decimal(point.tokens)
                for point in history
            ]

        if metric == "input_tokens":
            return [
                Decimal(point.input_tokens)
                for point in history
            ]

        if metric == "output_tokens":
            return [
                Decimal(point.output_tokens)
                for point in history
            ]

        if metric == "cost":
            return [
                Decimal(point.cost)
                for point in history
            ]

        raise ValueError(
            f"Unsupported metric: {metric}"
        )

    @staticmethod
    def _future_timestamp(
        history: Sequence[UsagePoint],
        step: int,
        period: str,
    ):

        last_timestamp = (
            history[-1].timestamp
        )

        if len(history) >= 2:

            interval = (
                history[-1].timestamp
                - history[-2].timestamp
            )

            if interval.total_seconds() > 0:
                return (
                    last_timestamp
                    + interval * step
                )

        period_delta = {
            "hour": timedelta(hours=step),
            "day": timedelta(days=step),
            "week": timedelta(weeks=step),
            "month": timedelta(days=30 * step),
        }

        return (
            last_timestamp
            + period_delta.get(
                period,
                timedelta(days=step),
            )
        )

    def forecast_requests(
        self,
        history: Sequence[UsagePoint],
        horizon: int = 7,
        method: str = (
            ForecastMethod.WEIGHTED_MOVING_AVERAGE.value
        ),
        scope_id: str | None = None,
        period: str = "day",
    ) -> UsageForecast:

        return self.forecast(
            history=history,
            metrics=("requests",),
            horizon=horizon,
            method=method,
            scope_id=scope_id,
            period=period,
        )

    def forecast_tokens(
        self,
        history: Sequence[UsagePoint],
        horizon: int = 7,
        method: str = (
            ForecastMethod.WEIGHTED_MOVING_AVERAGE.value
        ),
        scope_id: str | None = None,
        period: str = "day",
    ) -> UsageForecast:

        return self.forecast(
            history=history,
            metrics=("tokens",),
            horizon=horizon,
            method=method,
            scope_id=scope_id,
            period=period,
        )

    def forecast_cost(
        self,
        history: Sequence[UsagePoint],
        horizon: int = 7,
        method: str = (
            ForecastMethod.WEIGHTED_MOVING_AVERAGE.value
        ),
        scope_id: str | None = None,
        period: str = "day",
    ) -> UsageForecast:

        return self.forecast(
            history=history,
            metrics=("cost",),
            horizon=horizon,
            method=method,
            scope_id=scope_id,
            period=period,
        )

    def forecast_all(
        self,
        history: Sequence[UsagePoint],
        horizon: int = 7,
        method: str = (
            ForecastMethod.WEIGHTED_MOVING_AVERAGE.value
        ),
        scope_id: str | None = None,
        period: str = "day",
    ) -> UsageForecast:

        return self.forecast(
            history=history,
            metrics=(
                "requests",
                "tokens",
                "input_tokens",
                "output_tokens",
                "cost",
            ),
            horizon=horizon,
            method=method,
            scope_id=scope_id,
            period=period,
        )