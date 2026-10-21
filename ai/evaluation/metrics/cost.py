"""Cost measurement helpers for ModelNow."""
import math


def _nonnegative_number(value, name):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be a number")
    if not math.isfinite(value) or value < 0:
        raise ValueError(f"{name} must be finite and nonnegative")
    return float(value)


def _nonnegative_integer(value, name):
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ValueError(f"{name} must be a nonnegative integer")
    return value


def calculate_token_cost(
    input_tokens: int,
    output_tokens: int,
    input_cost_per_1k_tokens: float,
    output_cost_per_1k_tokens: float,
) -> float:
    """Estimate cost using provider rates expressed per 1,000 tokens."""
    input_tokens = _nonnegative_integer(input_tokens, "input_tokens")
    output_tokens = _nonnegative_integer(output_tokens, "output_tokens")
    input_rate = _nonnegative_number(
        input_cost_per_1k_tokens, "input_cost_per_1k_tokens"
    )
    output_rate = _nonnegative_number(
        output_cost_per_1k_tokens, "output_cost_per_1k_tokens"
    )
    return (
        input_tokens * input_rate + output_tokens * output_rate
    ) / 1000.0


def total_cost(costs):
    """Sum a sequence of measured request costs."""
    if isinstance(costs, (str, bytes)):
        raise ValueError("costs must be a sequence of numbers")
    values = [_nonnegative_number(value, "cost") for value in costs]
    return sum(values)


def cost_savings_percentage(baseline_cost: float, new_cost: float) -> float:
    """Return percentage savings; negative values indicate increased cost."""
    baseline = _nonnegative_number(baseline_cost, "baseline_cost")
    current = _nonnegative_number(new_cost, "new_cost")
    if baseline == 0:
        raise ValueError("baseline_cost must be greater than zero")
    return ((baseline - current) / baseline) * 100.0
