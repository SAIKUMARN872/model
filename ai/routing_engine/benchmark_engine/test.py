from __future__ import annotations

from ai.routing_engine.benchmark_engine.benchmark import (
    BenchmarkCase,
    BenchmarkResult,
    BenchmarkRunner,
    BenchmarkSuite,
)
from ai.routing_engine.benchmark_engine.performance import (
    PerformanceAnalyzer,
)
from ai.routing_engine.benchmark_engine.reports import (
    ReportGenerator,
)
from ai.routing_engine.benchmark_engine.utils import (
    average_cost,
    average_latency,
    average_quality,
    failed_results,
    filter_by_model,
    filter_by_task,
    group_by_model,
    group_by_task,
    model_cost_map,
    model_latency_map,
    model_quality_map,
    model_success_map,
    success_rate,
    successful_results,
)


def test_benchmark() -> None:
    cases = [
        BenchmarkCase(
            case_id="case-1",
            task_type="reasoning",
            prompt="Explain quantum computing.",
        ),
        BenchmarkCase(
            case_id="case-2",
            task_type="coding",
            prompt="Write a Python function.",
        ),
        BenchmarkCase(
            case_id="case-3",
            task_type="reasoning",
            prompt="Explain neural networks.",
        ),
    ]

    suite = BenchmarkSuite(cases)

    assert suite.count() == 3
    assert suite.get("case-1") is not None
    assert suite.get("case-1").task_type == "reasoning"

    results = [
        BenchmarkResult(
            case_id="case-1",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            quality_score=0.94,
            latency_ms=210,
            cost=0.012,
            metadata={"task_type": "reasoning"},
        ),
        BenchmarkResult(
            case_id="case-2",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            quality_score=0.90,
            latency_ms=190,
            cost=0.010,
            metadata={"task_type": "coding"},
        ),
        BenchmarkResult(
            case_id="case-3",
            model_id="qwen:qwen3",
            provider="qwen",
            tier="mlm",
            quality_score=0.86,
            latency_ms=90,
            cost=0.002,
            success=False,
            metadata={"task_type": "reasoning"},
        ),
    ]

    runner = BenchmarkRunner(suite)

    assert runner.record(results[0]) == results[0]
    assert runner.record_many(results[1:]) == 2

    print("BENCHMARK: PASS")


def test_performance() -> None:
    results = [
        BenchmarkResult(
            case_id="case-1",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            quality_score=0.94,
            latency_ms=210,
            cost=0.012,
        ),
        BenchmarkResult(
            case_id="case-2",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            quality_score=0.90,
            latency_ms=190,
            cost=0.010,
        ),
        BenchmarkResult(
            case_id="case-3",
            model_id="qwen:qwen3",
            provider="qwen",
            tier="mlm",
            quality_score=0.86,
            latency_ms=90,
            cost=0.002,
        ),
    ]

    analyzer = PerformanceAnalyzer()
    performance = analyzer.analyze(results)

    assert len(performance) == 2

    openai = next(
        item
        for item in performance
        if item.model_id == "openai:gpt-5"
    )

    assert openai.samples == 2
    assert round(openai.average_quality, 2) == 0.92
    assert round(openai.average_latency_ms, 1) == 200.0

    assert analyzer.best_by_quality(results).model_id == "openai:gpt-5"
    assert analyzer.best_by_latency(results).model_id == "qwen:qwen3"
    assert analyzer.best_by_cost(results).model_id == "qwen:qwen3"

    print("PERFORMANCE: PASS")


def test_reports() -> None:
    results = [
        BenchmarkResult(
            case_id="case-1",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            quality_score=0.94,
            latency_ms=210,
            cost=0.012,
        ),
        BenchmarkResult(
            case_id="case-2",
            model_id="qwen:qwen3",
            provider="qwen",
            tier="mlm",
            quality_score=0.86,
            latency_ms=90,
            cost=0.002,
            success=False,
        ),
    ]

    report = ReportGenerator().generate(results)

    assert report.total_results == 2
    assert report.successful_results == 1
    assert report.failed_results == 1
    assert report.models_evaluated == 2
    assert round(report.average_quality, 2) == 0.90
    assert report.best_quality_model == "openai:gpt-5"
    assert report.best_latency_model == "qwen:qwen3"
    assert report.best_cost_model == "qwen:qwen3"

    empty = ReportGenerator().generate([])

    assert empty.total_results == 0
    assert empty.models_evaluated == 0

    print("REPORTS: PASS")


def test_utils() -> None:
    results = [
        BenchmarkResult(
            case_id="case-1",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            quality_score=0.94,
            latency_ms=210,
            cost=0.012,
            metadata={"task_type": "reasoning"},
        ),
        BenchmarkResult(
            case_id="case-2",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            quality_score=0.90,
            latency_ms=190,
            cost=0.010,
            metadata={"task_type": "reasoning"},
        ),
        BenchmarkResult(
            case_id="case-3",
            model_id="qwen:qwen3",
            provider="qwen",
            tier="mlm",
            quality_score=0.86,
            latency_ms=90,
            cost=0.002,
            success=False,
            metadata={"task_type": "coding"},
        ),
    ]

    assert len(successful_results(results)) == 2
    assert len(failed_results(results)) == 1

    assert round(average_quality(results), 3) == 0.900
    assert round(average_latency(results), 1) == 163.3
    assert round(average_cost(results), 3) == 0.008
    assert round(success_rate(results), 3) == 0.667

    assert len(filter_by_model(results, "openai:gpt-5")) == 2
    assert len(filter_by_task(results, "reasoning")) == 2

    assert len(group_by_model(results)) == 2
    assert len(group_by_task(results)) == 2

    quality = model_quality_map(results)
    latency = model_latency_map(results)
    cost = model_cost_map(results)
    success = model_success_map(results)

    assert round(quality["openai:gpt-5"], 2) == 0.92
    assert round(latency["qwen:qwen3"], 1) == 90.0
    assert round(cost["qwen:qwen3"], 3) == 0.002
    assert success["qwen:qwen3"] == 0.0

    print("UTILS: PASS")


def test_validation() -> None:
    try:
        BenchmarkCase(
            case_id="",
            task_type="reasoning",
            prompt="test",
        )
        raise AssertionError("empty case_id should fail")
    except ValueError:
        pass

    try:
        BenchmarkResult(
            case_id="case-1",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            quality_score=1.5,
            latency_ms=100,
            cost=0.01,
        )
        raise AssertionError("invalid quality should fail")
    except ValueError:
        pass

    suite = BenchmarkSuite()

    try:
        BenchmarkRunner(suite).record(
            BenchmarkResult(
                case_id="unknown",
                model_id="openai:gpt-5",
                provider="openai",
                tier="llm",
                quality_score=0.9,
                latency_ms=100,
                cost=0.01,
            )
        )
        raise AssertionError("unknown case should fail")
    except ValueError:
        pass

    print("VALIDATION: PASS")


def main() -> None:
    test_benchmark()
    test_performance()
    test_reports()
    test_utils()
    test_validation()

    print("MODELNOW BENCHMARK ENGINE TEST: PASS")


if __name__ == "__main__":
    main()
