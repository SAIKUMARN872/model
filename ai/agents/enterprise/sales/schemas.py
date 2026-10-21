from dataclasses import dataclass
from enum import StrEnum
from typing import Any


class SalesStatus(StrEnum):
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    ORDERED = "ordered"


def require_text(payload: dict[str, Any], key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"'{key}' is required and must be non-empty text")
    return value.strip()


def require_number(
    payload: dict[str, Any],
    key: str,
    *,
    minimum: float = 0,
    maximum: float | None = None,
) -> float:
    value = payload.get(key)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"'{key}' must be a number")
    if value < minimum or (maximum is not None and value > maximum):
        if maximum is None:
            raise ValueError(f"'{key}' must be at least {minimum}")
        raise ValueError(f"'{key}' must be between {minimum} and {maximum}")
    return float(value)


@dataclass(frozen=True)
class SalesConfig:
    domain: str = "sales"
    maximum_discount_percent: float = 25.0
    minimum_margin_percent: float = 10.0
    external_ordering_enabled: bool = False


DEFAULT_SALES_CONFIG = SalesConfig()
