from __future__ import annotations

import hashlib
import json
import re
from decimal import Decimal, InvalidOperation
from typing import Any, Mapping


_WHITESPACE_PATTERN = re.compile(r"\s+")


def to_decimal(
    value: Decimal | int | float | str,
) -> Decimal:
    if isinstance(value, Decimal):
        return value

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(
            f"Invalid decimal value: {value!r}"
        ) from exc


def normalize_text(text: str) -> str:
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    return _WHITESPACE_PATTERN.sub(
        " ",
        text.strip(),
    )


def validate_key(key: str) -> str:
    if not isinstance(key, str):
        raise TypeError("cache key must be a string")

    normalized = key.strip()

    if not normalized:
        raise ValueError("cache key cannot be empty")

    return normalized


def validate_ttl(ttl_seconds: int | float | Decimal) -> Decimal:
    ttl = to_decimal(ttl_seconds)

    if ttl < Decimal("0"):
        raise ValueError(
            "ttl_seconds cannot be negative"
        )

    return ttl


def is_expired(
    created_at: float,
    ttl_seconds: int | float | Decimal,
    now: float,
) -> bool:
    ttl = validate_ttl(ttl_seconds)

    if ttl == Decimal("0"):
        return False

    age = Decimal(str(max(0.0, now - created_at)))

    return age >= ttl


def stable_serialize(value: Any) -> str:
    try:
        return json.dumps(
            value,
            sort_keys=True,
            separators=(",", ":"),
            default=str,
        )
    except (TypeError, ValueError) as exc:
        raise ValueError(
            "value cannot be serialized deterministically"
        ) from exc


def make_cache_key(
    value: Any,
    namespace: str = "modelnow",
) -> str:
    namespace = validate_key(namespace)

    payload = stable_serialize(value)

    digest = hashlib.sha256(
        payload.encode("utf-8")
    ).hexdigest()

    return f"{namespace}:{digest}"


def make_text_cache_key(
    text: str,
    namespace: str = "modelnow",
) -> str:
    normalized = normalize_text(text)

    return make_cache_key(
        normalized,
        namespace=namespace,
    )


def calculate_hit_rate(
    hits: int,
    misses: int,
) -> Decimal:
    if hits < 0 or misses < 0:
        raise ValueError(
            "hits and misses cannot be negative"
        )

    total = hits + misses

    if total == 0:
        return Decimal("0")

    return (
        Decimal(hits)
        / Decimal(total)
    )


def calculate_savings(
    hits: int,
    average_request_cost: Decimal | int | float | str,
) -> Decimal:
    if hits < 0:
        raise ValueError("hits cannot be negative")

    cost = to_decimal(average_request_cost)

    if cost < Decimal("0"):
        raise ValueError(
            "average_request_cost cannot be negative"
        )

    return Decimal(hits) * cost


def clamp_decimal(
    value: Decimal | int | float | str,
    minimum: Decimal | int | float | str,
    maximum: Decimal | int | float | str,
) -> Decimal:
    current = to_decimal(value)
    lower = to_decimal(minimum)
    upper = to_decimal(maximum)

    if lower > upper:
        raise ValueError(
            "minimum cannot exceed maximum"
        )

    return max(
        lower,
        min(current, upper),
    )


def cacheable_response(
    value: Any,
) -> bool:
    if value is None:
        return False

    if isinstance(value, str):
        return bool(value.strip())

    if isinstance(value, Mapping):
        return bool(value)

    if isinstance(value, (list, tuple)):
        return bool(value)

    return True


__all__ = [
    "to_decimal",
    "normalize_text",
    "validate_key",
    "validate_ttl",
    "is_expired",
    "stable_serialize",
    "make_cache_key",
    "make_text_cache_key",
    "calculate_hit_rate",
    "calculate_savings",
    "clamp_decimal",
    "cacheable_response",
]
