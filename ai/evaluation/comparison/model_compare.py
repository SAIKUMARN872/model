"""Compare per-model evaluation cases."""
from collections import defaultdict
from ai.evaluation.benchmarks.benchmark import benchmark_cases
from ai.evaluation.comparison.compare import compare_models
from ai.evaluation.models import EvaluationCase


def compare_evaluation_cases(cases, weights=None):
    """Aggregate evaluation cases, then rank models on available metrics."""
    if isinstance(cases, (str, bytes)) or not isinstance(cases, (list, tuple)):
        raise ValueError("cases must be a list or tuple of EvaluationCase objects")
    if not cases:
        raise ValueError("at least one evaluation case is required")
    if any(not isinstance(case, EvaluationCase) for case in cases):
        raise ValueError("all cases must be EvaluationCase objects")

    summary = benchmark_cases(cases)
    comparison = compare_models(summary, weights=weights)
    return {
        "case_count": len(cases),
        "model_count": comparison["model_count"],
        "models": summary["models"],
        "ranking": comparison["ranking"],
    }
