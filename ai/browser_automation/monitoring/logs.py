"""Structured logging utilities for browser automation."""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from typing import Any

_SENSITIVE_KEY = re.compile(
    r"(password|passwd|secret|token|api[_-]?key|authorization|cookie|"
    r"credential|access[_-]?key|refresh[_-]?token)",
    re.IGNORECASE,
)


def _sanitize(value: Any, key: str = "") -> Any:
    """Redact sensitive fields and bound logged values."""
    if _SENSITIVE_KEY.search(key):
        return "[REDACTED]"

    if isinstance(value, dict):
        return {
            str(k): _sanitize(v, str(k))
            for k, v in list(value.items())[:100]
        }

    if isinstance(value, (list, tuple)):
        return [_sanitize(item) for item in value[:100]]

    if isinstance(value, str):
        return value[:2000]

    if value is None or isinstance(value, (bool, int, float)):
        return value

    return str(value)[:500]


class BrowserAutomationLogger:
    """Emit structured JSON log records through Python logging."""

    def __init__(
        self,
        name: str = "modelnow.browser_automation",
        logger: logging.Logger | None = None,
    ) -> None:
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Logger name must be a non-empty string.")
        self.logger = logger or logging.getLogger(name)

    def log(
        self,
        event: str,
        *,
        level: int = logging.INFO,
        task_id: str | None = None,
        trace_id: str | None = None,
        fields: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if not isinstance(event, str) or not event.strip():
            raise ValueError("Event must be a non-empty string.")
        if fields is not None and not isinstance(fields, dict):
            raise TypeError("fields must be a dictionary.")

        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": event[:200],
            "task_id": task_id[:200] if isinstance(task_id, str) else None,
            "trace_id": trace_id[:200] if isinstance(trace_id, str) else None,
            "fields": _sanitize(fields or {}),
        }
        self.logger.log(level, json.dumps(record, ensure_ascii=False))
        return record

    def info(self, event: str, **kwargs: Any) -> dict[str, Any]:
        return self.log(event, level=logging.INFO, **kwargs)

    def warning(self, event: str, **kwargs: Any) -> dict[str, Any]:
        return self.log(event, level=logging.WARNING, **kwargs)

    def error(self, event: str, **kwargs: Any) -> dict[str, Any]:
        return self.log(event, level=logging.ERROR, **kwargs)


def get_logger(name: str = "modelnow.browser_automation") -> BrowserAutomationLogger:
    return BrowserAutomationLogger(name=name)
