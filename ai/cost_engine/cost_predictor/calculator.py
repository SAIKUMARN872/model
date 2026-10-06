from typing import Optional

def calculate_token_cost(
    input_tokens: int,
    output_tokens: int,
    input_cost_per_1m: float,
    output_cost_per_1m: float,
) -> float:
    if min(input_tokens, output_tokens, input_cost_per_1m, output_cost_per_1m) < 0:
        raise ValueError("Token counts and pricing cannot be negative.")
    return (input_tokens / 1_000_000) * input_cost_per_1m + (output_tokens / 1_000_000) * output_cost_per_1m
