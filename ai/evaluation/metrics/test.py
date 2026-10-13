"""Tests for ModelNow evaluation metrics."""
import unittest

from ai.evaluation.metrics.accuracy import (
    accuracy_rate,
    exact_match_score,
    mean_token_f1,
    token_f1_score,
)
from ai.evaluation.metrics.cost import (
    calculate_token_cost,
    cost_savings_percentage,
    total_cost,
)
from ai.evaluation.metrics.latency import (
    mean_latency,
    percentile_latency,
    throughput_requests_per_second,
)
from ai.evaluation.metrics.metrics import collect_metrics


class TestAccuracyMetrics(unittest.TestCase):
    def test_exact_match(self):
        self.assertEqual(exact_match_score("Hello", "hello"), 1.0)

    def test_nonmatching_answer(self):
        self.assertEqual(exact_match_score("wrong", "right"), 0.0)

    def test_token_f1(self):
        self.assertAlmostEqual(token_f1_score("red blue", "red green"), 0.5)

    def test_accuracy_rate(self):
        self.assertEqual(accuracy_rate(["yes", "no"], ["yes", "yes"]), 0.5)

    def test_mean_token_f1(self):
        self.assertAlmostEqual(mean_token_f1(["red blue", "same"], ["red green", "same"]), 0.75)

    def test_mismatched_lengths_rejected(self):
        with self.assertRaises(ValueError):
            accuracy_rate(["yes"], ["yes", "no"])

    def test_empty_inputs_rejected(self):
        with self.assertRaises(ValueError):
            accuracy_rate([], [])

    def test_non_string_rejected(self):
        with self.assertRaises(ValueError):
            exact_match_score(123, "123")


class TestCostMetrics(unittest.TestCase):
    def test_token_cost(self):
        self.assertAlmostEqual(calculate_token_cost(1000, 500, 0.002, 0.004), 0.004)

    def test_total_cost(self):
        self.assertAlmostEqual(total_cost([0.1, 0.2, 0.05]), 0.35)

    def test_savings(self):
        self.assertAlmostEqual(cost_savings_percentage(100, 75), 25.0)

    def test_cost_increase(self):
        self.assertAlmostEqual(cost_savings_percentage(100, 125), -25.0)

    def test_zero_baseline_rejected(self):
        with self.assertRaises(ValueError):
            cost_savings_percentage(0, 1)

    def test_negative_cost_rejected(self):
        with self.assertRaises(ValueError):
            total_cost([0.1, -0.1])

    def test_boolean_rate_rejected(self):
        with self.assertRaises(ValueError):
            calculate_token_cost(1, 1, True, 0.1)


class TestLatencyMetrics(unittest.TestCase):
    def test_mean_latency(self):
        self.assertEqual(mean_latency([10, 20, 30]), 20.0)

    def test_median_percentile(self):
        self.assertEqual(percentile_latency([30, 10, 20], 50), 20.0)

    def test_p95_interpolation(self):
        self.assertAlmostEqual(percentile_latency([10, 20, 30, 40], 95), 38.5)

    def test_throughput(self):
        self.assertEqual(throughput_requests_per_second(100, 20), 5.0)

    def test_empty_latency_rejected(self):
        with self.assertRaises(ValueError):
            mean_latency([])

    def test_invalid_percentile_rejected(self):
        with self.assertRaises(ValueError):
            percentile_latency([1, 2], 101)

    def test_zero_duration_rejected(self):
        with self.assertRaises(ValueError):
            throughput_requests_per_second(10, 0)

    def test_non_finite_latency_rejected(self):
        with self.assertRaises(ValueError):
            mean_latency([float("inf")])


class TestUnifiedMetrics(unittest.TestCase):
    def test_collect_all_metrics(self):
        result = collect_metrics(
            answer="Correct answer",
            reference_answer="Correct answer",
            latency_ms=25,
            cost_usd=0.002,
            input_tokens=10,
            output_tokens=5,
        )
        self.assertTrue(result["exact_match"])
        self.assertEqual(result["token_f1"], 1.0)
        self.assertEqual(result["total_tokens"], 15)
        self.assertEqual(result["latency_ms"], 25.0)
        self.assertEqual(result["cost_usd"], 0.002)

    def test_collect_partial_metrics(self):
        self.assertEqual(collect_metrics("answer"), {})

    def test_negative_token_count_rejected(self):
        with self.assertRaises(ValueError):
            collect_metrics("answer", input_tokens=-1)


if __name__ == "__main__":
    unittest.main()
