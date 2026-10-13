"""Unified metric collection helpers for ModelNow."""
from ai.evaluation.metrics.accuracy import exact_match_score, token_f1_score
from ai.evaluation.metrics.cost import _nonnegative_number
from ai.evaluation.metrics.latency import _validate_latency


def collect_metrics(
    answer: str,
    reference_answer: str | None = None,
    latency_ms: float | None = None,
    cost_usd: float | None = None,
    input_tokens: int | None = None,
    output_tokens: int | None = None,
) -> dict:
    """Collect available quality, cost, latency, and token measurements."""
    if not isinstance(answer, str):
        raise ValueError("answer must be a string")

    result = {}
    if reference_answer is not None:
        if not isinstance(reference_answer, str):
            raise ValueError("reference_answer must be a string")
        result["exact_match"] = bool(exact_match_score(answer, reference_answer))
        result["token_f1"] = token_f1_score(answer, reference_answer)

    if latency_ms is not None:
        result["latency_ms"] = _validate_latency(latency_ms)

    if cost_usd is not None:
        result["cost_usd"] = _nonnegative_number(cost_usd, "cost_usd")

    for name, value in (
        ("input_tokens", input_tokens),
        ("output_tokens", output_tokens),
    ):
        if value is not None:
            if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                raise ValueError(f"{name} must be a nonnegative integer")
            result[name] = value

    if input_tokens is not None and output_tokens is not None:
        result["total_tokens"] = input_tokens + output_tokens

    return result
