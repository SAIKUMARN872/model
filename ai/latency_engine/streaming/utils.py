from __future__ import annotations

from typing import Any


DEFAULT_CHUNK_SIZE = 1
DEFAULT_MAX_BUFFER_SIZE = 64 * 1024
DEFAULT_MAX_CHUNKS = 4096


def validate_chunk_size(value: int) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise TypeError("chunk size must be an integer")

    if value <= 0:
        raise ValueError("chunk size must be greater than zero")

    return value


def validate_buffer_size(value: int) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise TypeError("buffer size must be an integer")

    if value <= 0:
        raise ValueError("buffer size must be greater than zero")

    return value


def validate_max_chunks(value: int) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise TypeError("max chunks must be an integer")

    if value <= 0:
        raise ValueError("max chunks must be greater than zero")

    return value


def normalize_chunk(chunk: Any) -> str:
    if chunk is None:
        return ""

    return str(chunk)


def chunk_size_bytes(chunk: Any) -> int:
    return len(
        normalize_chunk(chunk).encode("utf-8")
    )


def estimate_tokens(value: Any) -> int:
    if value is None:
        return 0

    if isinstance(value, str):
        if not value:
            return 0

        return max(1, (len(value) + 3) // 4)

    if isinstance(value, dict):
        return sum(
            estimate_tokens(key)
            + estimate_tokens(item)
            for key, item in value.items()
        )

    if isinstance(value, (list, tuple)):
        return sum(
            estimate_tokens(item)
            for item in value
        )

    return estimate_tokens(str(value))


def split_text(
    text: str,
    chunk_size: int,
) -> tuple[str, ...]:
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    chunk_size = validate_chunk_size(chunk_size)

    if not text:
        return ()

    return tuple(
        text[index:index + chunk_size]
        for index in range(0, len(text), chunk_size)
    )


def calculate_duration_ms(
    started_at: float,
    ended_at: float,
) -> float:
    duration = (ended_at - started_at) * 1000.0

    if duration < 0:
        raise ValueError(
            "ended_at must not be earlier than started_at"
        )

    return duration


def calculate_tokens_per_second(
    tokens: int,
    duration_ms: float,
) -> float:
    if tokens < 0:
        raise ValueError("tokens must not be negative")

    if duration_ms < 0:
        raise ValueError(
            "duration must not be negative"
        )

    if duration_ms == 0:
        return 0.0

    return tokens / (duration_ms / 1000.0)


__all__ = [
    "DEFAULT_CHUNK_SIZE",
    "DEFAULT_MAX_BUFFER_SIZE",
    "DEFAULT_MAX_CHUNKS",
    "calculate_duration_ms",
    "calculate_tokens_per_second",
    "chunk_size_bytes",
    "estimate_tokens",
    "normalize_chunk",
    "split_text",
    "validate_buffer_size",
    "validate_chunk_size",
    "validate_max_chunks",
]
