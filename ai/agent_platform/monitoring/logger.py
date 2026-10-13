"""Structured logging helpers for the agent platform."""

import json
import logging
from datetime import datetime, timezone


class StructuredLogger:
    """Writes structured JSON log records through Python logging."""

    def __init__(self, name="modelnow.agent_platform", logger=None):
        self.logger = logger or logging.getLogger(name)

    def log_event(self, level, event, **fields):
        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": str(event),
            **fields,
        }
        message = json.dumps(record, default=str, sort_keys=True)
        numeric_level = (
            level if isinstance(level, int)
            else logging.getLevelName(str(level).upper())
        )
        if not isinstance(numeric_level, int):
            raise ValueError(f"Unknown logging level: {level}")
        self.logger.log(numeric_level, message)
        return record

    def info(self, event, **fields):
        return self.log_event(logging.INFO, event, **fields)

    def warning(self, event, **fields):
        return self.log_event(logging.WARNING, event, **fields)

    def error(self, event, **fields):
        return self.log_event(logging.ERROR, event, **fields)
