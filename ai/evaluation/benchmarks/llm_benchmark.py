"""LLM benchmark entry points for ModelNow."""
from ai.evaluation.benchmarks.benchmark import benchmark_cases
from ai.evaluation.models import EvaluationCase


def benchmark_llm(cases, duration_seconds=None):
    """Aggregate LLM results; cases must contain already-collected model outputs."""
    if isinstance(cases, (str, bytes)) or not isinstance(cases, (list, tuple)):
        raise ValueError("cases must be a list or tuple of EvaluationCase objects")
    if any(not isinstance(case, EvaluationCase) for case in cases):
        raise ValueError("all cases must be EvaluationCase objects")
    result = benchmark_cases(cases, duration_seconds=duration_seconds)
    result["benchmark"] = "llm"
    return result
