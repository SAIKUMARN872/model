from __future__ import annotations

from .evaluator import EvaluationInput, QualityEvaluator
from .metrics import QualityMetrics, QualityWeights
from .scorer import QualityScorer
from .utils import (
    completeness_score,
    cost_efficiency_score,
    latency_score,
    response_coverage,
    token_overlap,
)


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def test_metrics() -> None:
    metrics = QualityMetrics(
        relevance=0.9,
        correctness=0.8,
        completeness=0.85,
        coherence=0.9,
        latency=0.8,
        cost_efficiency=0.95,
    )

    check(0.0 <= metrics.average <= 1.0, "average out of range")
    print("METRICS: PASS")


def test_weights() -> None:
    weights = QualityWeights()

    check(weights.total > 0.0, "weights must be positive")
    check(weights.relevance == 0.25, "unexpected relevance weight")

    print("WEIGHTS: PASS")


def test_scorer() -> None:
    metrics = QualityMetrics(
        relevance=0.9,
        correctness=0.9,
        completeness=0.8,
        coherence=0.8,
        latency=0.9,
        cost_efficiency=0.9,
    )

    scorer = QualityScorer()
    result = scorer.score(metrics)

    check(result.score >= 0.70, "quality score should pass")
    check(result.passed, "quality result should pass")
    check(result.grade == "good" or result.grade == "excellent", "unexpected grade")

    print("SCORER: PASS")


def test_utils() -> None:
    check(
        token_overlap(
            "AI execution platform",
            "ModelNow AI execution platform",
        ) == 1.0,
        "token overlap failed",
    )

    check(
        response_coverage(
            ["AI", "platform"],
            "ModelNow is an AI platform",
        ) == 1.0,
        "response coverage failed",
    )

    check(
        completeness_score(
            ["AI", "platform"],
            "ModelNow is an AI platform",
        ) == 1.0,
        "completeness failed",
    )

    check(
        latency_score(100, 200) == 1.0,
        "latency score failed",
    )

    check(
        cost_efficiency_score(0.02, 0.01) == 0.5,
        "cost efficiency failed",
    )

    print("UTILS: PASS")


def test_evaluator() -> None:
    evaluator = QualityEvaluator()

    data = EvaluationInput(
        response="ModelNow is an AI execution platform.",
        required_terms=("ModelNow", "AI", "platform"),
        latency_ms=100,
        target_latency_ms=200,
        cost=0.005,
        target_cost=0.01,
    )

    result = evaluator.evaluate(data)

    check(result.score >= 0.70, "evaluation score should pass")
    check(result.passed, "evaluation should pass")
    check(result.metrics.relevance == 1.0, "relevance should be 1.0")
    check(result.metrics.latency == 1.0, "latency should be 1.0")
    check(result.metrics.cost_efficiency == 1.0, "cost efficiency should be 1.0")

    print("EVALUATOR: PASS")


def test_custom_threshold() -> None:
    evaluator = QualityEvaluator(pass_threshold=0.90)

    data = EvaluationInput(
        response="ModelNow AI platform.",
        required_terms=("ModelNow", "AI", "platform"),
    )

    result = evaluator.evaluate(data)

    check(result.score < 0.90, "test score should remain below custom threshold")
    check(not result.passed, "custom threshold should reject result")

    print("CUSTOM THRESHOLD: PASS")


def test_empty_response() -> None:
    evaluator = QualityEvaluator()

    result = evaluator.evaluate(
        EvaluationInput(
            response="",
            required_terms=("AI", "platform"),
        )
    )

    check(result.score < 0.70, "empty response should have low quality")
    check(not result.passed, "empty response should fail")

    print("EMPTY RESPONSE: PASS")


def test_invalid_metrics() -> None:
    try:
        QualityMetrics(relevance=1.5)
    except ValueError:
        print("INVALID METRICS: PASS")
        return

    raise AssertionError("invalid metric should raise ValueError")


def main() -> None:
    test_metrics()
    test_weights()
    test_scorer()
    test_utils()
    test_evaluator()
    test_custom_threshold()
    test_empty_response()
    test_invalid_metrics()

    print("=" * 62)
    print("MODELNOW QUALITY EVALUATOR TEST: PASS")
    print("=" * 62)


if __name__ == "__main__":
    main()
