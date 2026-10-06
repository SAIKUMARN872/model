from __future__ import annotations

import unittest
from decimal import Decimal

from .benchmark import (
    Benchmark,
    BenchmarkCase,
    BenchmarkResult,
    BenchmarkRun,
)
from .metrics import (
    BenchmarkMetricSummary,
    BenchmarkMetrics,
    calculate_error_rate,
    calculate_success_rate,
    calculate_throughput,
)
from .reports import (
    BenchmarkReport,
    BenchmarkReporter,
    compare_reports,
)


class BenchmarkMetricsTests(unittest.TestCase):
    def test_metrics_derive_total_tokens(self) -> None:
        metrics = BenchmarkMetrics(
            latency_ms=500,
            cost=Decimal("0.002"),
            quality_score=Decimal("0.92"),
            input_tokens=1000,
            output_tokens=500,
        )

        self.assertEqual(metrics.total_tokens, 1500)

    def test_metrics_derive_throughput(self) -> None:
        metrics = BenchmarkMetrics(
            latency_ms=500,
            input_tokens=1000,
            output_tokens=500,
        )

        self.assertEqual(
            metrics.throughput_tokens_per_second,
            Decimal("3000"),
        )

    def test_metrics_success_state(self) -> None:
        metrics = BenchmarkMetrics(
            latency_ms=100,
            cost=Decimal("0.001"),
            quality_score=Decimal("0.9"),
            success_rate=Decimal("1"),
        )

        self.assertTrue(metrics.is_successful)

    def test_metrics_failure_state(self) -> None:
        metrics = BenchmarkMetrics(
            latency_ms=100,
            success_rate=Decimal("0"),
            error_rate=Decimal("1"),
        )

        self.assertFalse(metrics.is_successful)

    def test_metrics_to_dict(self) -> None:
        metrics = BenchmarkMetrics(
            latency_ms=100,
            cost=Decimal("0.001"),
            quality_score=Decimal("0.9"),
        )

        data = metrics.as_dict()

        self.assertEqual(data["latency_ms"], "100")
        self.assertEqual(data["cost"], "0.001")
        self.assertEqual(data["quality_score"], "0.9")

    def test_summary_from_values(self) -> None:
        summary = BenchmarkMetricSummary.from_values(
            [
                Decimal("10"),
                Decimal("20"),
                Decimal("30"),
            ]
        )

        self.assertEqual(summary.count, 3)
        self.assertEqual(summary.minimum, Decimal("10"))
        self.assertEqual(summary.maximum, Decimal("30"))
        self.assertEqual(summary.average, Decimal("20"))

    def test_empty_summary(self) -> None:
        summary = BenchmarkMetricSummary.from_values([])

        self.assertEqual(summary.count, 0)
        self.assertEqual(summary.minimum, Decimal("0"))
        self.assertEqual(summary.maximum, Decimal("0"))
        self.assertEqual(summary.average, Decimal("0"))

    def test_throughput_calculation(self) -> None:
        self.assertEqual(
            calculate_throughput(1500, 500),
            Decimal("3000"),
        )

    def test_success_rate_calculation(self) -> None:
        self.assertEqual(
            calculate_success_rate(9, 10),
            Decimal("0.9"),
        )

    def test_error_rate_calculation(self) -> None:
        self.assertEqual(
            calculate_error_rate(1, 10),
            Decimal("0.1"),
        )


class BenchmarkCaseTests(unittest.TestCase):
    def test_case_creation(self) -> None:
        case = BenchmarkCase(
            case_id="case-1",
            prompt="Explain RAG",
        )

        self.assertEqual(case.case_id, "case-1")
        self.assertEqual(case.prompt, "Explain RAG")

    def test_empty_case_id_rejected(self) -> None:
        with self.assertRaises(ValueError):
            BenchmarkCase(
                case_id="",
                prompt="test",
            )

    def test_empty_prompt_rejected(self) -> None:
        with self.assertRaises(ValueError):
            BenchmarkCase(
                case_id="case-1",
                prompt="   ",
            )


class BenchmarkRunTests(unittest.TestCase):
    def test_successful_run(self) -> None:
        run = BenchmarkRun(
            case_id="case-1",
            metrics=BenchmarkMetrics(
                latency_ms=100,
                success_rate=Decimal("1"),
            ),
        )

        self.assertTrue(run.is_successful)

    def test_failed_run(self) -> None:
        run = BenchmarkRun(
            case_id="case-1",
            metrics=BenchmarkMetrics(
                latency_ms=100,
            ),
            error="execution failed",
        )

        self.assertFalse(run.is_successful)


class BenchmarkTests(unittest.TestCase):
    def setUp(self) -> None:
        self.benchmark = Benchmark(
            "test-benchmark",
            [
                BenchmarkCase("case-1", "Prompt one"),
                BenchmarkCase("case-2", "Prompt two"),
                BenchmarkCase("case-3", "Prompt three"),
            ],
        )

    def _metrics(self) -> BenchmarkMetrics:
        return BenchmarkMetrics(
            latency_ms=Decimal("500"),
            cost=Decimal("0.002"),
            quality_score=Decimal("0.92"),
            input_tokens=1000,
            output_tokens=500,
        )

    def test_case_count(self) -> None:
        self.assertEqual(len(self.benchmark.cases), 3)

    def test_add_case(self) -> None:
        self.benchmark.add_case(
            BenchmarkCase("case-4", "Prompt four")
        )

        self.assertEqual(len(self.benchmark.cases), 4)

    def test_run_with_metrics(self) -> None:
        result = self.benchmark.run(
            lambda case: self._metrics()
        )

        self.assertIsInstance(result, BenchmarkResult)
        self.assertEqual(result.total_cases, 3)
        self.assertEqual(result.successful_cases, 3)
        self.assertEqual(result.failed_cases, 0)

    def test_run_with_benchmark_run(self) -> None:
        def executor(case: BenchmarkCase) -> BenchmarkRun:
            return BenchmarkRun(
                case_id=case.case_id,
                metrics=self._metrics(),
                output="ok",
            )

        result = self.benchmark.run(executor)

        self.assertEqual(result.total_cases, 3)
        self.assertEqual(result.successful_cases, 3)

    def test_run_with_mapping(self) -> None:
        def executor(case: BenchmarkCase):
            return {
                "metrics": self._metrics(),
                "output": "ok",
                "metadata": {"source": "test"},
            }

        result = self.benchmark.run(executor)

        self.assertEqual(result.successful_cases, 3)
        self.assertEqual(
            result.average_quality_score,
            Decimal("0.92"),
        )

    def test_executor_failure_is_captured(self) -> None:
        def executor(case: BenchmarkCase):
            if case.case_id == "case-2":
                raise RuntimeError("simulated failure")

            return self._metrics()

        result = self.benchmark.run(executor)

        self.assertEqual(result.total_cases, 3)
        self.assertEqual(result.successful_cases, 2)
        self.assertEqual(result.failed_cases, 1)

    def test_aggregate_runs(self) -> None:
        runs = [
            BenchmarkRun(
                case_id="case-1",
                metrics=self._metrics(),
            ),
            BenchmarkRun(
                case_id="case-2",
                metrics=self._metrics(),
            ),
        ]

        result = self.benchmark.aggregate(runs)

        self.assertEqual(result.total_cases, 2)
        self.assertEqual(result.successful_cases, 2)

    def test_average_metrics(self) -> None:
        result = self.benchmark.run(
            lambda case: self._metrics()
        )

        self.assertEqual(
            result.average_latency_ms,
            Decimal("500"),
        )
        self.assertEqual(
            result.average_cost,
            Decimal("0.002"),
        )
        self.assertEqual(
            result.average_quality_score,
            Decimal("0.92"),
        )

    def test_empty_benchmark(self) -> None:
        benchmark = Benchmark("empty")

        result = benchmark.run(lambda case: self._metrics())

        self.assertEqual(result.total_cases, 0)
        self.assertEqual(result.successful_cases, 0)
        self.assertEqual(result.failed_cases, 0)
        self.assertEqual(result.success_rate, Decimal("0"))


class BenchmarkReportTests(unittest.TestCase):
    def setUp(self) -> None:
        benchmark = Benchmark(
            "report-benchmark",
            [
                BenchmarkCase("case-1", "Prompt"),
                BenchmarkCase("case-2", "Prompt"),
            ],
        )

        def executor(case: BenchmarkCase) -> BenchmarkMetrics:
            return BenchmarkMetrics(
                latency_ms=Decimal("400"),
                cost=Decimal("0.001"),
                quality_score=Decimal("0.95"),
                input_tokens=500,
                output_tokens=500,
            )

        self.result = benchmark.run(executor)

    def test_create_report(self) -> None:
        reporter = BenchmarkReporter()
        report = reporter.create_report(self.result)

        self.assertIsInstance(report, BenchmarkReport)
        self.assertEqual(report.benchmark_name, "report-benchmark")
        self.assertEqual(report.total_cases, 2)
        self.assertEqual(report.successful_cases, 2)
        self.assertEqual(report.failed_cases, 0)

    def test_report_metrics(self) -> None:
        report = BenchmarkReporter().create_report(self.result)

        self.assertEqual(report.success_rate, Decimal("1"))
        self.assertEqual(
            report.average_latency_ms,
            Decimal("400"),
        )
        self.assertEqual(
            report.average_cost,
            Decimal("0.001"),
        )
        self.assertEqual(
            report.average_quality_score,
            Decimal("0.95"),
        )

    def test_report_to_dict(self) -> None:
        report = BenchmarkReporter().create_report(self.result)
        data = report.to_dict()

        self.assertEqual(
            data["benchmark_name"],
            "report-benchmark",
        )
        self.assertEqual(data["total_cases"], 2)
        self.assertEqual(data["success_rate"], "1")

    def test_report_to_text(self) -> None:
        report = BenchmarkReporter().create_report(self.result)
        text = report.to_text()

        self.assertIn(
            "Benchmark: report-benchmark",
            text,
        )
        self.assertIn(
            "Total cases: 2",
            text,
        )

    def test_reporter_convenience_methods(self) -> None:
        reporter = BenchmarkReporter()

        data = reporter.to_dict(self.result)
        text = reporter.to_text(self.result)

        self.assertEqual(data["total_cases"], 2)
        self.assertIn("Success rate: 1", text)

    def test_compare_reports(self) -> None:
        reporter = BenchmarkReporter()
        baseline = reporter.create_report(self.result)

        candidate_result = Benchmark(
            "candidate",
            [
                BenchmarkCase("case-1", "Prompt"),
            ],
        ).run(
            lambda case: BenchmarkMetrics(
                latency_ms=Decimal("300"),
                cost=Decimal("0.0005"),
                quality_score=Decimal("0.97"),
                success_rate=Decimal("1"),
            )
        )

        candidate = reporter.create_report(candidate_result)

        comparison = compare_reports(
            baseline,
            candidate,
        )

        self.assertEqual(
            comparison["success_rate_delta"],
            Decimal("0"),
        )
        self.assertEqual(
            comparison["latency_delta_ms"],
            Decimal("-100"),
        )
        self.assertEqual(
            comparison["cost_delta"],
            Decimal("-0.0005"),
        )
        self.assertEqual(
            comparison["quality_delta"],
            Decimal("0.02"),
        )


if __name__ == "__main__":
    unittest.main()
