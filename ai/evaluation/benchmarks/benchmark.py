"""Core benchmark aggregation for ModelNow."""
from collections import defaultdict
from collections.abc import Sequence
from ai.evaluation.metrics.accuracy import exact_match_score, token_f1_score
from ai.evaluation.metrics.latency import mean_latency, percentile_latency
from ai.evaluation.models import EvaluationCase
from ai.evaluation.schemas import validate_case


def benchmark_cases(cases: Sequence[EvaluationCase], duration_seconds=None) -> dict:
    """Aggregate available quality, latency, cost, and token measurements."""
    if isinstance(cases, (str, bytes)) or not isinstance(cases, Sequence):
        raise ValueError("cases must be a sequence of EvaluationCase objects")
    if not cases:
        raise ValueError("at least one benchmark case is required")

    for case in cases:
        validate_case(case)

    if duration_seconds is not None:
        if isinstance(duration_seconds, bool) or not isinstance(duration_seconds, (int, float)):
            raise ValueError("duration_seconds must be a positive finite number")
        import math
        if not math.isfinite(duration_seconds) or duration_seconds <= 0:
            raise ValueError("duration_seconds must be a positive finite number")

    def summarize(items):
        references = [item for item in items if item.reference_answer is not None]
        latencies = [item.latency_ms for item in items if item.latency_ms is not None]
        costs = [item.cost_usd for item in items if item.cost_usd is not None]
        input_tokens = [item.input_tokens for item in items if item.input_tokens is not None]
        output_tokens = [item.output_tokens for item in items if item.output_tokens is not None]

        metrics = {
            "case_count": len(items),
            "quality_case_count": len(references),
            "exact_match_rate": (
                sum(exact_match_score(c.answer, c.reference_answer) for c in references)
                / len(references) if references else None
            ),
            "mean_token_f1": (
                sum(token_f1_score(c.answer, c.reference_answer) for c in references)
                / len(references) if references else None
            ),
            "mean_latency_ms": mean_latency(latencies) if latencies else None,
            "p50_latency_ms": percentile_latency(latencies, 50) if latencies else None,
            "p95_latency_ms": percentile_latency(latencies, 95) if latencies else None,
            "measured_cost_case_count": len(costs),
            "total_cost_usd": sum(costs) if costs else None,
            "mean_cost_usd": sum(costs) / len(costs) if costs else None,
            "input_tokens": sum(input_tokens) if input_tokens else None,
            "output_tokens": sum(output_tokens) if output_tokens else None,
        }
        if duration_seconds is not None:
            metrics["throughput_requests_per_second"] = len(items) / duration_seconds
        return metrics

    grouped = defaultdict(list)
    for case in cases:
        grouped[case.model_name].append(case)

    return {
        "benchmark": "modelnow_evaluation",
        "case_count": len(cases),
        "model_count": len(grouped),
        "metrics": summarize(list(cases)),
        "models": {
            name: summarize(items) for name, items in sorted(grouped.items())
        },
    }


class BenchmarkRunner:
    """Reusable runner for aggregating already-collected evaluation cases."""

    def run(self, cases, duration_seconds=None):
        return benchmark_cases(cases, duration_seconds=duration_seconds)
