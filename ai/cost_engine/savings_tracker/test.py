from decimal import Decimal
import unittest

from .calculator import SavingsCalculator
from .history import SavingsHistory
from .tracker import SavingsTracker
from .utils import (
    calculate_reduction_ratio,
    calculate_savings,
    calculate_savings_percentage,
    round_savings,
)


class SavingsTrackerTest(unittest.TestCase):

    def setUp(self) -> None:
        self.calculator = SavingsCalculator()

        self.record = self.calculator.calculate(
            baseline_cost=Decimal("0.0100"),
            optimized_cost=Decimal("0.0040"),
            savings_id="saving-001",
            currency="USD",
            model="test-llm",
            optimized_model="test-slm",
            provider="test-provider",
            request_id="request-001",
        )

    def test_savings_calculator(self) -> None:
        self.assertEqual(
            self.record.savings_amount,
            Decimal("0.0060"),
        )

        self.assertEqual(
            self.record.savings_percentage,
            Decimal("60.0"),
        )

    def test_savings_tracking(self) -> None:
        tracker = SavingsTracker()
        tracker.record(self.record)

        self.assertEqual(tracker.count(), 1)
        self.assertEqual(
            tracker.total_baseline_cost(),
            Decimal("0.0100"),
        )
        self.assertEqual(
            tracker.total_optimized_cost(),
            Decimal("0.0040"),
        )
        self.assertEqual(
            tracker.total_savings(),
            Decimal("0.0060"),
        )

    def test_savings_summary(self) -> None:
        tracker = SavingsTracker()
        tracker.record(self.record)

        summary = tracker.summarize()

        self.assertEqual(summary.baseline_cost, Decimal("0.0100"))
        self.assertEqual(summary.optimized_cost, Decimal("0.0040"))
        self.assertEqual(summary.savings_amount, Decimal("0.0060"))
        self.assertEqual(summary.savings_percentage, Decimal("60.0"))
        self.assertEqual(summary.record_count, 1)

    def test_savings_history(self) -> None:
        history = SavingsHistory()
        history.add(self.record)

        self.assertEqual(history.count(), 1)
        self.assertEqual(
            history.get("saving-001"),
            self.record,
        )
        self.assertEqual(
            len(history.by_model("test-llm")),
            1,
        )
        self.assertEqual(
            len(history.by_optimized_model("test-slm")),
            1,
        )
        self.assertEqual(
            len(history.by_request("request-001")),
            1,
        )

    def test_savings_utilities(self) -> None:
        self.assertEqual(
            calculate_savings(
                Decimal("0.0100"),
                Decimal("0.0040"),
            ),
            Decimal("0.0060"),
        )

        self.assertEqual(
            calculate_savings_percentage(
                Decimal("0.0100"),
                Decimal("0.0040"),
            ),
            Decimal("60.0"),
        )

        self.assertEqual(
            calculate_reduction_ratio(
                Decimal("0.0100"),
                Decimal("0.0040"),
            ),
            Decimal("0.4"),
        )

        self.assertEqual(
            round_savings(
                Decimal("0.0060123456789"),
                8,
            ),
            Decimal("0.00601235"),
        )

    def test_zero_baseline(self) -> None:
        record = self.calculator.calculate(
            baseline_cost=Decimal("0"),
            optimized_cost=Decimal("0"),
            savings_id="saving-002",
        )

        self.assertEqual(record.savings_amount, Decimal("0"))
        self.assertEqual(record.savings_percentage, Decimal("0"))

    def test_no_savings(self) -> None:
        record = self.calculator.calculate(
            baseline_cost=Decimal("0.0040"),
            optimized_cost=Decimal("0.0060"),
            savings_id="saving-003",
        )

        self.assertEqual(record.savings_amount, Decimal("0"))
        self.assertEqual(record.savings_percentage, Decimal("0"))

    def test_invalid_cost(self) -> None:
        with self.assertRaises(ValueError):
            self.calculator.calculate(
                baseline_cost=Decimal("-0.001"),
                optimized_cost=Decimal("0.001"),
                savings_id="invalid",
            )


if __name__ == "__main__":
    unittest.main()
