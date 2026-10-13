from decimal import Decimal
import unittest

from ai.optimization_engine.performance.analyzer import (
    PerformanceAnalysis,
    PerformanceAnalyzer,
    PerformanceThresholds,
    create_analyzer,
)
from ai.optimization_engine.performance.monitor import PerformanceMonitor
from ai.optimization_engine.performance.profiler import PerformanceProfiler


class PerformanceAnalyzerTest(unittest.TestCase):

    def setUp(self):
        self.profiler = PerformanceProfiler()
        self.monitor = PerformanceMonitor()

        self.monitor.record(
            self.profiler.profile(
                request_id="req-001",
                model="model-a",
                provider="provider-a",
                latency_ms=400,
                input_tokens=1000,
                output_tokens=1000,
            )
        )

        self.monitor.record(
            self.profiler.profile(
                request_id="req-002",
                model="model-a",
                provider="provider-a",
                latency_ms=600,
                input_tokens=500,
                output_tokens=500,
            )
        )

        self.monitor.record(
            self.profiler.profile(
                request_id="req-003",
                model="model-b",
                provider="provider-b",
                latency_ms=2500,
                input_tokens=500,
                output_tokens=500,
                success=False,
                error_type="timeout",
            )
        )

        self.analyzer = PerformanceAnalyzer()

    def test_analysis_type(self):
        result = self.analyzer.analyze_monitor(self.monitor)

        self.assertIsInstance(result, PerformanceAnalysis)

    def test_sample_count(self):
        result = self.analyzer.analyze_monitor(self.monitor)

        self.assertEqual(result.sample_count, 3)

    def test_total_tokens(self):
        result = self.analyzer.analyze_monitor(self.monitor)

        self.assertEqual(result.total_tokens, 4000)

    def test_average_latency(self):
        result = self.analyzer.analyze_monitor(self.monitor)

        self.assertEqual(
            result.average_latency_ms,
            Decimal("1166.666666666666666666666667"),
        )

    def test_latency_status(self):
        result = self.analyzer.analyze_monitor(self.monitor)

        self.assertEqual(result.latency_status, "warning")

    def test_throughput_status(self):
        result = self.analyzer.analyze_monitor(self.monitor)

        self.assertEqual(result.throughput_status, "healthy")

    def test_reliability_status(self):
        result = self.analyzer.analyze_monitor(self.monitor)

        self.assertEqual(result.reliability_status, "critical")

    def test_bottleneck(self):
        result = self.analyzer.analyze_monitor(self.monitor)

        self.assertEqual(result.bottleneck, "reliability")

    def test_recommendation(self):
        result = self.analyzer.analyze_monitor(self.monitor)

        self.assertTrue(result.recommendation)

    def test_unhealthy_analysis(self):
        result = self.analyzer.analyze_monitor(self.monitor)

        self.assertFalse(result.healthy)

    def test_analysis_serialization(self):
        result = self.analyzer.analyze_monitor(self.monitor)
        data = result.as_dict()

        self.assertEqual(data["sample_count"], 3)
        self.assertEqual(data["total_tokens"], 4000)
        self.assertEqual(data["latency_status"], "warning")
        self.assertEqual(data["reliability_status"], "critical")
        self.assertFalse(data["healthy"])

    def test_model_comparison(self):
        results = self.analyzer.compare_models(self.monitor)

        self.assertEqual(
            set(results.keys()),
            {"model-a", "model-b"},
        )

        self.assertEqual(
            results["model-a"].latency_status,
            "healthy",
        )

        self.assertEqual(
            results["model-b"].latency_status,
            "critical",
        )

    def test_model_bottleneck(self):
        results = self.analyzer.compare_models(self.monitor)

        self.assertEqual(
            results["model-b"].bottleneck,
            "latency",
        )

    def test_provider_comparison(self):
        results = self.analyzer.compare_providers(self.monitor)

        self.assertEqual(
            set(results.keys()),
            {"provider-a", "provider-b"},
        )

        self.assertEqual(
            results["provider-a"].latency_status,
            "healthy",
        )

        self.assertEqual(
            results["provider-b"].latency_status,
            "critical",
        )

    def test_provider_bottleneck(self):
        results = self.analyzer.compare_providers(self.monitor)

        self.assertEqual(
            results["provider-b"].bottleneck,
            "latency",
        )

    def test_default_thresholds(self):
        thresholds = PerformanceThresholds()

        self.assertEqual(
            thresholds.max_latency_ms,
            Decimal("1000"),
        )

        self.assertEqual(
            thresholds.min_throughput_tokens_per_second,
            Decimal("10"),
        )

        self.assertEqual(
            thresholds.min_success_rate,
            Decimal("0.95"),
        )

    def test_custom_thresholds(self):
        thresholds = PerformanceThresholds(
            max_latency_ms=Decimal("500"),
            min_throughput_tokens_per_second=Decimal("5"),
            min_success_rate=Decimal("0.90"),
        )

        analyzer = PerformanceAnalyzer(
            thresholds=thresholds,
        )

        self.assertEqual(
            analyzer.thresholds.max_latency_ms,
            Decimal("500"),
        )

        self.assertEqual(
            analyzer.thresholds.min_throughput_tokens_per_second,
            Decimal("5"),
        )

        self.assertEqual(
            analyzer.thresholds.min_success_rate,
            Decimal("0.90"),
        )

    def test_analyze_profiles(self):
        profiles = self.monitor.profiles()

        result = self.analyzer.analyze_profiles(profiles)

        self.assertEqual(result.sample_count, 3)
        self.assertEqual(result.total_tokens, 4000)

    def test_analyze_snapshot(self):
        snapshot = self.monitor.snapshot()

        result = self.analyzer.analyze_snapshot(snapshot)

        self.assertEqual(result.sample_count, 3)
        self.assertEqual(result.total_tokens, 4000)

    def test_empty_monitor(self):
        monitor = PerformanceMonitor()

        result = self.analyzer.analyze_monitor(monitor)

        self.assertEqual(result.sample_count, 0)
        self.assertEqual(result.total_tokens, 0)
        self.assertFalse(result.healthy)

    def test_factory(self):
        analyzer = create_analyzer()

        self.assertIsInstance(
            analyzer,
            PerformanceAnalyzer,
        )

    def test_healthy_performance(self):
        monitor = PerformanceMonitor()

        monitor.record(
            self.profiler.profile(
                request_id="healthy-001",
                model="fast-model",
                provider="fast-provider",
                latency_ms=100,
                input_tokens=1000,
                output_tokens=1000,
                success=True,
            )
        )

        monitor.record(
            self.profiler.profile(
                request_id="healthy-002",
                model="fast-model",
                provider="fast-provider",
                latency_ms=120,
                input_tokens=1000,
                output_tokens=1000,
                success=True,
            )
        )

        result = self.analyzer.analyze_monitor(monitor)

        self.assertEqual(result.latency_status, "healthy")
        self.assertEqual(result.reliability_status, "healthy")
        self.assertTrue(result.healthy)

    def test_latency_critical(self):
        monitor = PerformanceMonitor()

        monitor.record(
            self.profiler.profile(
                request_id="slow-001",
                model="slow-model",
                provider="slow-provider",
                latency_ms=3000,
                input_tokens=100,
                output_tokens=100,
                success=True,
            )
        )

        result = self.analyzer.analyze_monitor(monitor)

        self.assertEqual(result.latency_status, "critical")
        self.assertEqual(result.bottleneck, "latency")
        self.assertFalse(result.healthy)

    def test_reliability_critical(self):
        monitor = PerformanceMonitor()

        for index in range(10):
            monitor.record(
                self.profiler.profile(
                    request_id=f"failure-{index}",
                    model="unstable-model",
                    provider="unstable-provider",
                    latency_ms=100,
                    input_tokens=100,
                    output_tokens=100,
                    success=index == 0,
                    error_type=None if index == 0 else "timeout",
                )
            )

        result = self.analyzer.analyze_monitor(monitor)

        self.assertEqual(
            result.reliability_status,
            "critical",
        )

        self.assertFalse(result.healthy)


if __name__ == "__main__":
    unittest.main()
