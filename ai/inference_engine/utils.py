from __future__ import annotations

from typing import Any

from .models import InferenceRequest


def normalize_model_name(
    model: str,
) -> str:
    """Normalize a model identifier for lookup."""

    return model.strip().lower()


def request_metadata(
    request: InferenceRequest,
) -> dict[str, Any]:
    """Return a copy of request metadata."""

    return dict(request.metadata)


def has_messages(
    request: InferenceRequest,
) -> bool:
    """Return whether a request contains messages."""

    return bool(request.messages)


__all__ = [
    "normalize_model_name",
    "request_metadata",
    "has_messages",
]
