from __future__ import annotations

import hashlib
import json
import re
from decimal import Decimal, InvalidOperation
from typing import Any, Mapping


_WHITESPACE_PATTERN = re.compile(r"\s+")


def to_decimal(
    value: Decimal | int | float | str,
    *,
    default: Decimal | None = None,
) -> Decimal:
    if isinstance(value, Decimal):
        return value

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        if default is not None:
            return default
        raise ValueError(
            f"Invalid decimal value: {value!r}"
        ) from None


def normalize_text(value: str) -> str:
    if not isinstance(value, str):
        raise TypeError("value must be a string")

    return _WHITESPACE_PATTERN.sub(
        " ",
        value.strip(),
    )


def validate_name(value: str) -> str:
    if not isinstance(value, str):
        raise TypeError("name must be a string")

    normalized = normalize_text(value)

    if not normalized:
        raise ValueError("name cannot be empty")

    return normalized


def validate_positive(
    value: Decimal | int | float | str,
    *,
    field_name: str = "value",
) -> Decimal:
    result = to_decimal(value)

    if result <= 0:
        raise ValueError(
            f"{field_name} must be greater than zero"
        )

    return result


def validate_non_negative(
    value: Decimal | int | float | str,
    *,
    field_name: str = "value",
) -> Decimal:
    result = to_decimal(value)

    if result < 0:
        raise ValueError(
            f"{field_name} cannot be negative"
        )

    return result


def stable_serialize(value: Any) -> str:
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
        ensure_ascii=False,
    )


def make_benchmark_id(
    name: str,
    *,
    version: str = "1",
) -> str:
    normalized_name = validate_name(name)
    normalized_version = validate_name(version)

    payload = (
        f"{normalized_name}:{normalized_version}"
    )

    digest = hashlib.sha256(
        payload.encode("utf-8")
    ).hexdigest()

    return digest[:16]


def make_case_id(
    benchmark_id: str,
    case_name: str,
) -> str:
    benchmark = validate_name(benchmark_id)
    case = validate_name(case_name)

    payload = f"{benchmark}:{case}"

    digest = hashlib.sha256(
        payload.encode("utf-8")
    ).hexdigest()

    return digest[:16]


def calculate_average(
    values: list[
        Decimal | int | float | str
    ],
) -> Decimal:
    if not values:
        return Decimal("0")

    decimals = [
        to_decimal(value)
        for value in values
    ]

    return sum(
        decimals,
        Decimal("0"),
    ) / Decimal(len(decimals))


def calculate_success_rate(
    successful: int,
    total: int,
) -> Decimal:
    if total < 0:
        raise ValueError(
            "total cannot be negative"
        )

    if successful < 0:
        raise ValueError(
            "successful cannot be negative"
        )

    if successful > total:
        raise ValueError(
            "successful cannot exceed total"
        )

    if total == 0:
        return Decimal("0")

    return (
        Decimal(successful)
        / Decimal(total)
    )


def calculate_error_rate(
    failed: int,
    total: int,
) -> Decimal:
    if total < 0:
        raise ValueError(
            "total cannot be negative"
        )

    if failed < 0:
        raise ValueError(
            "failed cannot be negative"
        )

    if failed > total:
        raise ValueError(
            "failed cannot exceed total"
        )

    if total == 0:
        return Decimal("0")

    return (
        Decimal(failed)
        / Decimal(total)
    )


def calculate_pass_rate(
    passed: int,
    total: int,
) -> Decimal:
    return calculate_success_rate(
        passed,
        total,
    )


def calculate_failure_rate(
    failed: int,
    total: int,
) -> Decimal:
    return calculate_error_rate(
        failed,
        total,
    )


def calculate_percentage(
    value: Decimal | int | float | str,
    total: Decimal | int | float | str,
) -> Decimal:
    value_decimal = to_decimal(value)
    total_decimal = to_decimal(total)

    if total_decimal == 0:
        return Decimal("0")

    return (
        value_decimal
        / total_decimal
        * Decimal("100")
    )


def calculate_throughput(
    total_tokens: Decimal | int | float | str,
    latency_ms: Decimal | int | float | str,
) -> Decimal:
    tokens = validate_non_negative(
        total_tokens,
        field_name="total_tokens",
    )

    latency = validate_non_negative(
        latency_ms,
        field_name="latency_ms",
    )

    if latency == 0:
        return Decimal("0")

    return (
        tokens
        / latency
        * Decimal("1000")
    )


def calculate_cost_per_success(
    total_cost: Decimal | int | float | str,
    successful: int,
) -> Decimal:
    cost = validate_non_negative(
        total_cost,
        field_name="total_cost",
    )

    if successful < 0:
        raise ValueError(
            "successful cannot be negative"
        )

    if successful == 0:
        return Decimal("0")

    return cost / Decimal(successful)


def merge_metadata(
    base: Mapping[str, Any] | None,
    extra: Mapping[str, Any] | None,
) -> dict[str, Any]:
    result: dict[str, Any] = {}

    if base:
        result.update(base)

    if extra:
        result.update(extra)

    return result


def clamp_decimal(
    value: Decimal | int | float | str,
    minimum: Decimal | int | float | str,
    maximum: Decimal | int | float | str,
) -> Decimal:
    result = to_decimal(value)
    lower = to_decimal(minimum)
    upper = to_decimal(maximum)

    if lower > upper:
        raise ValueError(
            "minimum cannot exceed maximum"
        )

    return max(
        lower,
        min(result, upper),
    )


__all__ = [
    "to_decimal",
    "normalize_text",
    "validate_name",
    "validate_positive",
    "validate_non_negative",
    "stable_serialize",
    "make_benchmark_id",
    "make_case_id",
    "calculate_average",
    "calculate_success_rate",
    "calculate_error_rate",
    "calculate_pass_rate",
    "calculate_failure_rate",
    "calculate_percentage",
    "calculate_throughput",
    "calculate_cost_per_success",
    "merge_metadata",
    "clamp_decimal",
]
