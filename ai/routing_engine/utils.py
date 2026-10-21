from __future__ import annotations

from .models import RoutingRequest


def normalize_model_name(model: str | None) -> str | None:
    if model is None:
        return None

    value = model.strip().lower()
    return value or None


def normalize_tier(tier: str | None) -> str | None:
    if tier is None:
        return None

    value = tier.strip().lower()
    return value or None


def message_count(request: RoutingRequest) -> int:
    return len(request.messages)


def has_messages(request: RoutingRequest) -> bool:
    return bool(request.messages)


__all__ = [
    "normalize_model_name",
    "normalize_tier",
    "message_count",
    "has_messages",
]
