"""
Application telemetry logging.

Provides centralized structured logging configuration
for production environments.
"""

from __future__ import annotations

import logging
import sys
from datetime import datetime, timezone
from typing import Any

from app.core.config import settings


class ContextFilter(logging.Filter):
    """
    Adds contextual information to logs.
    """

    def filter(
        self,
        record: logging.LogRecord,
    ) -> bool:

        if not hasattr(record, "request_id"):
            record.request_id = "-"

        if not hasattr(record, "user_id"):
            record.user_id = "-"

        if not hasattr(record, "service"):
            record.service = "api"

        return True



class JsonFormatter(logging.Formatter):
    """
    JSON structured log formatter.

    Suitable for:
    - ELK
    - Datadog
    - Grafana Loki
    - CloudWatch
    """

    def format(
        self,
        record: logging.LogRecord,
    ) -> str:

        log_record: dict[str, Any] = {
            "timestamp": datetime.now(
                timezone.utc,
            ).isoformat(),

            "level": record.levelname,

            "message": record.getMessage(),

            "service": getattr(
                record,
                "service",
                "api",
            ),

            "request_id": getattr(
                record,
                "request_id",
                None,
            ),

            "user_id": getattr(
                record,
                "user_id",
                None,
            ),

            "module": record.module,

            "function": record.funcName,

            "line": record.lineno,
        }


        if record.exc_info:

            log_record["exception"] = self.formatException(
                record.exc_info,
            )


        import json

        return json.dumps(
            log_record,
            ensure_ascii=False,
        )



def configure_logging() -> None:
    """
    Configure application logging.
    """

    log_level = getattr(
        logging,
        settings.LOG_LEVEL.upper(),
        logging.INFO,
    )


    handler = logging.StreamHandler(
        sys.stdout,
    )


    if settings.ENVIRONMENT == "production":

        handler.setFormatter(
            JsonFormatter(),
        )

    else:

        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s | "
                "%(levelname)s | "
                "%(name)s | "
                "%(message)s"
            )
        )


    handler.addFilter(
        ContextFilter(),
    )


    root_logger = logging.getLogger()

    root_logger.setLevel(
        log_level,
    )


    root_logger.handlers.clear()

    root_logger.addHandler(
        handler,
    )


    logging.getLogger(
        "uvicorn",
    ).handlers.clear()


    logging.getLogger(
        "uvicorn",
    ).addHandler(
        handler,
    )



def get_logger(
    name: str,
) -> logging.Logger:
    """
    Get application logger instance.
    """

    return logging.getLogger(
        name,
    )


# Default application logger

logger = get_logger(
    "app",
)