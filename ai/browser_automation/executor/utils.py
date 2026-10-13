"""Shared utilities for browser task execution."""

import inspect
import re
from typing import Any


def validate_timeout(timeout: float) -> float:
    """Validate and return a positive execution timeout."""
    if isinstance(timeout, bool) or not isinstance(timeout, (int, float)):
        raise ValueError("timeout must be a positive number.")

    if timeout <= 0:
        raise ValueError("timeout must be greater than zero.")

    return float(timeout)


def normalize_task_id(task_id: Any) -> str:
    """Validate and normalize a task identifier."""
    if not isinstance(task_id, str):
        raise ValueError("task_id must be a string.")

    normalized = task_id.strip()

    if not normalized:
        raise ValueError("task_id cannot be empty.")

    if len(normalized) > 200:
        raise ValueError("task_id cannot exceed 200 characters.")

    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._:-]*", normalized):
        raise ValueError("task_id contains unsupported characters.")

    return normalized


def is_awaitable(value: Any) -> bool:
    """Return whether a value can be awaited."""
    return inspect.isawaitable(value)
