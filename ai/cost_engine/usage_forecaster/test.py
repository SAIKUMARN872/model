from datetime import datetime, timezone
from decimal import Decimal
import unittest

from .estimator import UsageEstimator
from .forecaster import UsageForecaster
from .models import UsageForecastRequest, UsagePoint
from .trends import UsageTrendAnalyzer
from .utils import (
    average_cost,
    average_requests,
    average_tokens,
    calculate_confidence,
    calculate_growth_rate,
    total_cost,
    total_requests,
    total_tokens,
    validate_cost,
    validate_requests,
    validate_tokens,
)


class UsageForecasterTest(unittest.TestCase):

    def setUp(self) -> None:
        self.history = [
            UsagePoint(
                timestamp=datetime(
                    2026, 1, 1, tzinfo=timezone.utc
                ),
                tokens=1000,
                requests=10,
                cost=Decimal("0.0100"),
                model="test-llm",
                provider="test-provider",
            ),
            UsagePoint(
                timestamp=datetime(
                    2026, 1, 2, tzinfo=timezone.utc
                ),
                tokens=1200,
                requests=12,
                cost=Decimal("0.0120"),
                model="test-llm",
                provider="test-provider",
            ),
            UsagePoint(
                timestamp=datetime(
                    2026, 1, 3, tzinfo=timezone.utc
                ),
                tokens=1400,
                requests=14,
                cost=Decimal("0.0140"),
                model="test-llm",
                provider="test-provider",
            ),
        ]

    def test_usage_trend(self) -> None:
        analyzer = UsageTrendAnalyzer()

        trend = analyzer.analyze(self.history)

        self.assertEqual(trend.period_count, 3)
        self.assertEqual(trend.total_tokens, 3600)
        self.assertEqual(trend.total_requests, 36)
        self.assertEqual(
            trend.total_cost,
            Decimal("0.0360"),
        )
        self.assertEqual(
            trend.average_tokens,
            Decimal("1200"),
        )
        self.assertEqual(
            trend.average_requests,
            Decimal("12"),
        )
        self.assertEqual(
            trend.average_cost,
            Decimal("0.0120"),
        )
        self.assertEqual(
            trend.growth_rate,
            Decimal("40.0"),
        )

    def test_usage_estimator(self) -> None:
        estimator = UsageEstimator()

        request = UsageForecastRequest(
            history=self.history,
            periods_ahead=1,
        )

        forecast = estimator.estimate(request)

        self.assertGreater(
            forecast.predicted_tokens,
            Decimal("0"),
        )

        self.assertGreater(
            forecast.predicted_requests,
            Decimal("0"),
        )

        self.assertGreater(
            forecast.predicted_cost,
            Decimal("0"),
        )

        self.assertEqual(
            forecast.confidence,
            Decimal("55"),
        )

    def test_model_filtering(self) -> None:
        history = self.history + [
            UsagePoint(
                timestamp=datetime(
                    2026, 1, 4, tzinfo=timezone.utc
                ),
                tokens=5000,
                requests=50,
                cost=Decimal("0.0500"),
                model="test-slm",
                provider="test-provider",
            )
        ]

        estimator = UsageEstimator()

        request = UsageForecastRequest(
            history=history,
            periods_ahead=1,
            model="test-llm",
        )

        forecast = estimator.estimate(request)

        self.assertEqual(
            forecast.predicted_tokens,
            Decimal("1680.000"),
        )

    def test_forecaster(self) -> None:
        forecaster = UsageForecaster()

        forecast = forecaster.forecast_from_history(
            self.history,
            periods_ahead=1,
        )

        self.assertGreater(
            forecast.predicted_tokens,
            Decimal("0"),
        )

        summary = forecaster.summarize(
            UsageForecastRequest(
                history=self.history,
                periods_ahead=1,
            )
        )

        self.assertEqual(summary.historical_periods, 3)
        self.assertEqual(summary.historical_tokens, 3600)
        self.assertEqual(summary.historical_requests, 36)
        self.assertEqual(
            summary.historical_cost,
            Decimal("0.0360"),
        )
        self.assertGreater(
            summary.forecast_cost,
            Decimal("0"),
        )

    def test_empty_history(self) -> None:
        estimator = UsageEstimator()

        request = UsageForecastRequest(
            history=[],
            periods_ahead=1,
        )

        forecast = estimator.estimate(request)

        self.assertEqual(
            forecast.predicted_tokens,
            Decimal("0"),
        )
        self.assertEqual(
            forecast.predicted_requests,
            Decimal("0"),
        )
        self.assertEqual(
            forecast.predicted_cost,
            Decimal("0"),
        )
        self.assertEqual(
            forecast.confidence,
            Decimal("0"),
        )

    def test_invalid_periods(self) -> None:
        estimator = UsageEstimator()

        with self.assertRaises(ValueError):
            estimator.estimate(
                UsageForecastRequest(
                    history=self.history,
                    periods_ahead=0,
                )
            )

    def test_utils_totals(self) -> None:
        self.assertEqual(
            total_tokens(self.history),
            3600,
        )

        self.assertEqual(
            total_requests(self.history),
            36,
        )

        self.assertEqual(
            total_cost(self.history),
            Decimal("0.0360"),
        )

    def test_utils_averages(self) -> None:
        self.assertEqual(
            average_tokens(self.history),
            Decimal("1200"),
        )

        self.assertEqual(
            average_requests(self.history),
            Decimal("12"),
        )

        self.assertEqual(
            average_cost(self.history),
            Decimal("0.0120"),
        )

    def test_utils_growth_and_confidence(self) -> None:
        self.assertEqual(
            calculate_growth_rate(
                Decimal("100"),
                Decimal("140"),
            ),
            Decimal("40.0"),
        )

        self.assertEqual(
            calculate_confidence(0),
            Decimal("0"),
        )

        self.assertEqual(
            calculate_confidence(5),
            Decimal("80"),
        )

        self.assertEqual(
            calculate_confidence(10),
            Decimal("85"),
        )

    def test_utils_validation(self) -> None:
        self.assertEqual(
            validate_tokens(100),
            100,
        )

        self.assertEqual(
            validate_requests(10),
            10,
        )

        self.assertEqual(
            validate_cost("0.025"),
            Decimal("0.025"),
        )

        with self.assertRaises(ValueError):
            validate_tokens(-1)

        with self.assertRaises(ValueError):
            validate_requests(-1)

        with self.assertRaises(ValueError):
            validate_cost("-0.01")


if __name__ == "__main__":
    unittest.main()
