"""
Structured logging for browser automation.

Provides an application-level logger that can be used by
crawler, navigation, planner, executor and agent modules.
"""

from __future__ import annotations

import json
import logging
import sys
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class LogRecord:
    """Structured automation log record."""

    level: str
    message: str

    timestamp: datetime = field(
        default_factory=utc_now
    )

    component: str = "browser_automation"

    task_id: str | None = None
    workflow_id: str | None = None
    request_id: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)

        data["timestamp"] = (
            self.timestamp.isoformat()
        )

        return data

    def to_json(self) -> str:
        return json.dumps(
            self.to_dict(),
            default=str,
            ensure_ascii=False,
        )


class AutomationLogger:
    """Structured logger for automation services."""

    def __init__(
        self,
        name: str = "browser_automation",
        level: int = logging.INFO,
        logger: logging.Logger | None = None,
    ) -> None:

        self.logger = (
            logger
            or logging.getLogger(name)
        )

        self.logger.setLevel(level)

        self._configure_default_handler()

    def _configure_default_handler(
        self,
    ) -> None:

        if self.logger.handlers:
            return

        handler = logging.StreamHandler(
            sys.stdout
        )

        formatter = logging.Formatter(
            "%(asctime)s | "
            "%(levelname)s | "
            "%(name)s | "
            "%(message)s"
        )

        handler.setFormatter(
            formatter
        )

        self.logger.addHandler(
            handler
        )

        self.logger.propagate = False

    def log(
        self,
        level: str,
        message: str,
        *,
        component: str = "browser_automation",
        task_id: str | None = None,
        workflow_id: str | None = None,
        request_id: str | None = None,
        **metadata: Any,
    ) -> LogRecord:

        record = LogRecord(
            level=level.upper(),
            message=message,
            component=component,
            task_id=task_id,
            workflow_id=workflow_id,
            request_id=request_id,
            metadata=metadata,
        )

        log_method = getattr(
            self.logger,
            level.lower(),
            self.logger.info,
        )

        log_method(
            record.to_json()
        )

        return record

    def debug(
        self,
        message: str,
        **kwargs: Any,
    ) -> LogRecord:

        return self.log(
            "DEBUG",
            message,
            **kwargs,
        )

    def info(
        self,
        message: str,
        **kwargs: Any,
    ) -> LogRecord:

        return self.log(
            "INFO",
            message,
            **kwargs,
        )

    def warning(
        self,
        message: str,
        **kwargs: Any,
    ) -> LogRecord:

        return self.log(
            "WARNING",
            message,
            **kwargs,
        )

    def error(
        self,
        message: str,
        **kwargs: Any,
    ) -> LogRecord:

        return self.log(
            "ERROR",
            message,
            **kwargs,
        )

    def exception(
        self,
        message: str,
        **kwargs: Any,
    ) -> LogRecord:

        record = self.log(
            "ERROR",
            message,
            **kwargs,
        )

        self.logger.exception(
            message
        )

        return record


logger = AutomationLogger()