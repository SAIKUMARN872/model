from decimal import Decimal

from .benchmark import Benchmark, BenchmarkCase, BenchmarkMetrics
from .metrics import (
    BenchmarkMetricSummary,
    calculate_error_rate_from_metrics,
    calculate_success_rate_from_metrics,
    metrics_from_mappings,
    summarize_metrics,
)
from .reports import BenchmarkReporter, compare_reports, create_report
from .utils import (
    calculate_average,
    calculate_cost_per_success,
    calculate_error_rate,
    calculate_failure_rate,
    calculate_pass_rate,
    calculate_percentage,
    calculate_success_rate,
    calculate_throughput,
    make_benchmark_id,
    make_case_id,
    merge_metadata,
    normalize_text,
    stable_serialize,
    validate_name,
    validate_non_negative,
    validate_positive,
)


def test_utils() -> None:
    assert normalize_text("  hello   world  ") == "hello world"
    assert validate_name("benchmark") == "benchmark"
    assert validate_positive(1) == Decimal("1")
    assert validate_non_negative(0) == Decimal("0")

    benchmark_id = make_benchmark_id("test")
    case_id = make_case_id("benchmark-test", "case-1")

    assert isinstance(benchmark_id, str)
    assert len(benchmark_id) > 0
    assert isinstance(case_id, str)
    assert len(case_id) > 0

    assert make_benchmark_id("test") == benchmark_id
    assert make_case_id("benchmark-test", "case-1") == case_id

    assert calculate_average([1, 2, 3]) == Decimal("2")
    assert calculate_success_rate(8, 10) == Decimal("0.8")
    assert calculate_error_rate(2, 10) == Decimal("0.2")
    assert calculate_pass_rate(9, 10) == Decimal("0.9")
    assert calculate_failure_rate(1, 10) == Decimal("0.1")
    assert calculate_percentage(25, 100) == Decimal("25")
    assert calculate_throughput(1000, 500) == Decimal("2000")
    assert calculate_cost_per_success(Decimal("1"), 2) == Decimal("0.5")
    assert merge_metadata({"a": 1}, {"b": 2}) == {"a": 1, "b": 2}
    assert stable_serialize({"b": 2, "a": 1})


def test_metrics() -> None:
    metrics = BenchmarkMetrics(
        latency_ms=500,
        input_tokens=1000,
        output_tokens=500,
        cost=Decimal("0.002"),
        quality=Decimal("0.92"),
        success=True,
    )

    assert metrics.total_tokens == 1500
    assert metrics.throughput_tokens_per_second == Decimal("3000")
    assert metrics.success is True
    assert metrics.failed is False

    metrics_list = [
        metrics,
        BenchmarkMetrics(
            latency_ms=700,
            input_tokens=1000,
            output_tokens=1000,
            cost=Decimal("0.004"),
            quality=Decimal("0.88"),
            success=True,
        ),
        BenchmarkMetrics(
            latency_ms=300,
            input_tokens=500,
            output_tokens=500,
            cost=Decimal("0.001"),
            quality=Decimal("0.80"),
            success=False,
            error_type="TestError",
        ),
    ]

    summary = summarize_metrics(metrics_list)

    assert isinstance(summary, BenchmarkMetricSummary)
    assert summary.sample_count == 3
    assert summary.successful_count == 2
    assert summary.failed_count == 1
    assert summary.total_tokens == 4500
    assert summary.average_latency_ms == Decimal("500")
    assert summary.success_rate == Decimal(
        "0.6666666666666666666666666667"
    )

    assert (
        calculate_success_rate_from_metrics(metrics_list)
        == summary.success_rate
    )

    assert calculate_error_rate_from_metrics(metrics_list) == Decimal(
        "0.3333333333333333333333333333"
    )

    mappings = metrics_from_mappings(
        [
            {
                "latency_ms": 100,
                "input_tokens": 100,
                "output_tokens": 100,
                "success": True,
            }
        ]
    )

    assert len(mappings) == 1
    assert mappings[0].total_tokens == 200


def test_benchmark() -> None:
    cases = [
        BenchmarkCase("case-1", "hello"),
        BenchmarkCase("case-2", "world"),
        BenchmarkCase("case-3", "test"),
    ]

    def executor(case):
        return {
            "latency_ms": 500,
            "input_tokens": 500,
            "output_tokens": 500,
            "quality": Decimal("0.92"),
            "cost": Decimal("0.002"),
            "success": True,
            "output": f"result-{case.name}",
        }

    benchmark = Benchmark(
        "model-routing-benchmark",
        cases,
        executor,
    )

    assert benchmark.name == "model-routing-benchmark"
    assert len(benchmark.cases) == 3

    result = benchmark.run()

    assert result.total_cases == 3
    assert result.successful_cases == 3
    assert result.failed_cases == 0
    assert result.success_rate == Decimal("1")
    assert result.average_latency_ms == Decimal("500")
    assert result.average_cost == Decimal("0.002")
    assert result.average_quality == Decimal("0.92")


def test_benchmark_failure() -> None:
    case = BenchmarkCase("failure", "test")

    def failing_executor(case):
        raise RuntimeError("intentional failure")

    result = Benchmark(
        "failure-test",
        [case],
        failing_executor,
    ).run()

    assert result.total_cases == 1
    assert result.successful_cases == 0
    assert result.failed_cases == 1
    assert result.success_rate == Decimal("0")
    assert result.error_rate == Decimal("1")


def test_reports() -> None:
    cases = [
        BenchmarkCase("case-1", "hello"),
        BenchmarkCase("case-2", "world"),
    ]

    def executor(case):
        return {
            "latency_ms": 400,
            "input_tokens": 500,
            "output_tokens": 500,
            "quality": Decimal("0.95"),
            "cost": Decimal("0.001"),
            "success": True,
            "output": "ok",
        }

    result = Benchmark(
        "report-test",
        cases,
        executor,
    ).run()

    reporter = BenchmarkReporter(
        metadata={"source": "test"},
    )

    report = reporter.create_report(
        result,
        metadata={"environment": "unit-test"},
    )

    assert report.name == "report-test"
    assert report.total_cases == 2
    assert report.successful_cases == 2
    assert report.failed_cases == 0
    assert report.success_rate == Decimal("1")
    assert report.average_latency_ms == Decimal("400")
    assert report.average_cost == Decimal("0.001")
    assert report.average_quality == Decimal("0.95")
    assert report.total_tokens == 2000
    assert report.metadata["source"] == "test"
    assert report.metadata["environment"] == "unit-test"
    assert report.healthy is True

    report2 = create_report(result)

    comparison = compare_reports(
        [report, report2]
    )

    assert comparison["best_quality"] == "report-test"
    assert comparison["best_latency"] == "report-test"
    assert comparison["best_cost"] == "report-test"
    assert comparison["best_reliability"] == "report-test"


def test_empty_comparison() -> None:
    comparison = compare_reports([])

    assert comparison["reports"] == []
    assert comparison["best_quality"] is None
    assert comparison["best_latency"] is None
    assert comparison["best_cost"] is None
    assert comparison["best_reliability"] is None


def run_tests() -> None:
    tests = [
        test_utils,
        test_metrics,
        test_benchmark,
        test_benchmark_failure,
        test_reports,
        test_empty_comparison,
    ]

    for test in tests:
        test()

    print("BENCHMARK OPTIMIZER TESTS: PASS")
    print("TEST GROUPS:", len(tests))
    print("UTILS: PASS")
    print("METRICS: PASS")
    print("BENCHMARK: PASS")
    print("FAILURE HANDLING: PASS")
    print("REPORTS: PASS")
    print("COMPARISON: PASS")


if __name__ == "__main__":
    run_tests()
