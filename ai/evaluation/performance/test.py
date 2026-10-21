"""Unit tests for ModelNow performance evaluation."""
import unittest

from ai.evaluation.performance import (
    PerformanceMeasurement,
    measure_operation,
    measurement_to_dict,
    percentile,
    run_load_test,
    run_stress_test,
    summarize_measurements,
)


class PerformanceMetricTests(unittest.TestCase):
    def test_summary_metrics(self):
        result = summarize_measurements(
            [10, 20, 30, 40], error_count=1, duration_seconds=2
        )
        self.assertEqual(result.operation_count, 5)
        self.assertEqual(result.success_count, 4)
        self.assertEqual(result.error_count, 1)
        self.assertEqual(result.mean_latency_ms, 25)
        self.assertEqual(result.median_latency_ms, 25)
        self.assertEqual(result.max_latency_ms, 40)
        self.assertEqual(result.throughput_ops_per_second, 2.5)
        self.assertEqual(result.error_rate, 0.2)

    def test_empty_summary(self):
        result = summarize_measurements([])
        self.assertIsNone(result.mean_latency_ms)
        self.assertIsNone(result.p95_latency_ms)
        self.assertEqual(result.operation_count, 0)
        self.assertEqual(result.error_rate, 0)

    def test_percentile(self):
        self.assertEqual(percentile([10, 20, 30], 50), 20)
        self.assertEqual(percentile([10, 20, 30], 0), 10)
        self.assertEqual(percentile([10, 20, 30], 100), 30)
        self.assertIsNone(percentile([], 95))

    def test_invalid_percentile(self):
        with self.assertRaises(ValueError):
            percentile([1, 2], 101)

    def test_invalid_measurements(self):
        for kwargs in (
            {"latencies_ms": [-1]},
            {"latencies_ms": [float("nan")]},
            {"latencies_ms": [True]},
            {"latencies_ms": [], "error_count": -1},
            {"latencies_ms": [], "duration_seconds": -1},
        ):
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                summarize_measurements(**kwargs)

    def test_measure_operation_success(self):
        latency, result, error = measure_operation(lambda: 42)
        self.assertGreaterEqual(latency, 0)
        self.assertEqual(result, 42)
        self.assertIsNone(error)

    def test_measure_operation_failure(self):
        def fail():
            raise RuntimeError("expected failure")

        latency, result, error = measure_operation(fail)
        self.assertGreaterEqual(latency, 0)
        self.assertIsNone(result)
        self.assertIsInstance(error, RuntimeError)

    def test_measurement_serialization(self):
        measurement = summarize_measurements([5, 10])
        data = measurement_to_dict(measurement)
        self.assertEqual(data["success_count"], 2)
        with self.assertRaises(ValueError):
            measurement_to_dict({"success_count": 2})


class LoadTestTests(unittest.TestCase):
    def test_load_test_success(self):
        calls = []
        result = run_load_test(lambda: calls.append(1), iterations=4)
        self.assertEqual(len(calls), 4)
        self.assertEqual(result["measurement"]["success_count"], 4)
        self.assertEqual(result["measurement"]["error_count"], 0)

    def test_load_test_captures_errors(self):
        calls = {"count": 0}

        def sometimes_fails():
            calls["count"] += 1
            if calls["count"] == 2:
                raise ValueError("test failure")
            return "ok"

        result = run_load_test(sometimes_fails, iterations=3)
        self.assertEqual(result["measurement"]["success_count"], 2)
        self.assertEqual(result["measurement"]["error_count"], 1)
        self.assertEqual(result["errors"][0]["error_type"], "ValueError")

    def test_load_test_invalid_iterations(self):
        for count in (0, -1, True, 1.5):
            with self.subTest(count=count), self.assertRaises(ValueError):
                run_load_test(lambda: None, iterations=count)


class StressTestTests(unittest.TestCase):
    def test_stress_test_levels(self):
        result = run_stress_test(
            lambda: "ok",
            concurrency_levels=[1, 2],
            iterations_per_worker=2,
        )
        self.assertEqual(len(result["levels"]), 2)
        self.assertEqual(
            result["levels"][0]["measurement"]["success_count"], 2
        )
        self.assertEqual(
            result["levels"][1]["measurement"]["success_count"], 4
        )

    def test_stress_test_captures_errors(self):
        def fail():
            raise RuntimeError("expected")

        result = run_stress_test(
            fail, concurrency_levels=[2], iterations_per_worker=2
        )
        measurement = result["levels"][0]["measurement"]
        self.assertEqual(measurement["success_count"], 0)
        self.assertEqual(measurement["error_count"], 4)

    def test_stress_test_invalid_arguments(self):
        invalid_cases = (
            {"concurrency_levels": []},
            {"concurrency_levels": [0]},
            {"concurrency_levels": [1, 1]},
            {"concurrency_levels": [True]},
            {"iterations_per_worker": 0},
        )
        for kwargs in invalid_cases:
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                run_stress_test(lambda: None, **kwargs)


if __name__ == "__main__":
    unittest.main(verbosity=2)
