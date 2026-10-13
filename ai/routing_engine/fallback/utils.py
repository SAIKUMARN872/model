"""Utilities for routing fallback operations."""

from __future__ import annotations

from typing import Any


def is_retryable_error(error: Exception) -> bool:
    """Return whether an error is generally safe to retry."""
    message = str(error).lower()
    non_retryable = ("invalid", "authentication", "permission", "forbidden")
    return not any(item in message for item in non_retryable)


def normalize_fallback_result(result: Any) -> Any:
    """Return a fallback result in a predictable form."""
    return result
