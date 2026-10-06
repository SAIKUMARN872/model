from __future__ import annotations

from typing import Any


DEFAULT_TARGET_TTFT_MS = 500.0
DEFAULT_MIN_SPEEDUP_PERCENT = 5.0
DEFAULT_MAX_BUFFER_SIZE = 64 * 1024


def validate_latency_ms(
    value: float,
) -> float:
    if isinstance(value, bool) or not isinstance(
        value,
        (int, float),
    ):
        raise TypeError(
            "latency must be numeric"
        )

    value = float(value)

    if value < 0:
        raise ValueError(
            "latency must not be negative"
        )

    return value


def validate_percentage(
    value: float,
) -> float:
    if isinstance(value, bool) or not isinstance(
        value,
        (int, float),
    ):
        raise TypeError(
            "percentage must be numeric"
        )

    value = float(value)

    if value < 0:
        raise ValueError(
            "percentage must not be negative"
        )

    return value


def validate_buffer_size(
    value: int,
) -> int:
    if not isinstance(value, int) or isinstance(
        value,
        bool,
    ):
        raise TypeError(
            "buffer size must be an integer"
        )

    if value <= 0:
        raise ValueError(
            "buffer size must be greater than zero"
        )

    return value


def estimate_tokens(
    value: Any,
) -> int:
    if value is None:
        return 0

    if isinstance(value, str):
        if not value:
            return 0

        return max(
            1,
            (len(value) + 3) // 4,
        )

    if isinstance(value, dict):
        return sum(
            estimate_tokens(key)
            + estimate_tokens(item)
            for key, item in value.items()
        )

    if isinstance(value, (list, tuple, set)):
        return sum(
            estimate_tokens(item)
            for item in value
        )

    return estimate_tokens(str(value))


def calculate_speedup_percent(
    baseline_ms: float,
    optimized_ms: float,
) -> float:
    baseline_ms = validate_latency_ms(
        baseline_ms
    )
    optimized_ms = validate_latency_ms(
        optimized_ms
    )

    if baseline_ms == 0:
        return 0.0

    return max(
        0.0,
        (
            (baseline_ms - optimized_ms)
            / baseline_ms
        ) * 100.0,
    )


def calculate_latency_reduction_ms(
    baseline_ms: float,
    optimized_ms: float,
) -> float:
    baseline_ms = validate_latency_ms(
        baseline_ms
    )
    optimized_ms = validate_latency_ms(
        optimized_ms
    )

    return max(
        0.0,
        baseline_ms - optimized_ms,
    )


def should_accelerate(
    latency_ms: float,
    *,
    target_latency_ms: float = DEFAULT_TARGET_TTFT_MS,
    min_speedup_percent: float = DEFAULT_MIN_SPEEDUP_PERCENT,
) -> bool:
    latency_ms = validate_latency_ms(
        latency_ms
    )
    target_latency_ms = validate_latency_ms(
        target_latency_ms
    )
    min_speedup_percent = validate_percentage(
        min_speedup_percent
    )

    if latency_ms <= target_latency_ms:
        return False

    return min_speedup_percent > 0.0


def normalize_response(
    value: Any,
) -> str:
    if value is None:
        return ""

    return str(value).strip()


def response_size_bytes(
    value: Any,
) -> int:
    return len(
        normalize_response(value).encode(
            "utf-8"
        )
    )


__all__ = [
    "DEFAULT_MAX_BUFFER_SIZE",
    "DEFAULT_MIN_SPEEDUP_PERCENT",
    "DEFAULT_TARGET_TTFT_MS",
    "calculate_latency_reduction_ms",
    "calculate_speedup_percent",
    "estimate_tokens",
    "normalize_response",
    "response_size_bytes",
    "should_accelerate",
    "validate_buffer_size",
    "validate_latency_ms",
    "validate_percentage",
]
