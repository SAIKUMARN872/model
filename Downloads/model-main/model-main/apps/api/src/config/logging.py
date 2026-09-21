"""
Enterprise Logging Configuration

Features
--------
- JSON Logging
- Console Logging
- File Logging
- Rotation
- Retention
- Request ID
- Correlation ID
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path
from contextvars import ContextVar

from loguru import logger

from .settings import settings

# Context Variables
request_id_ctx: ContextVar[str] = ContextVar(
    "request_id",
    default="-",
)

correlation_id_ctx: ContextVar[str] = ContextVar(
    "correlation_id",
    default="-",
)


class InterceptHandler(logging.Handler):
    """
    Redirect standard logging to Loguru.
    """

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except Exception:
            level = record.levelno

        logger.opt(
            depth=6,
            exception=record.exc_info,
        ).log(
            level,
            record.getMessage(),
        )


def _patch(record: dict) -> None:
    """
    Inject context values into every log.
    """

    record["extra"]["request_id"] = request_id_ctx.get()

    record["extra"]["correlation_id"] = (
        correlation_id_ctx.get()
    )


def configure_logging() -> None:
    """
    Configure application logging.
    """

    logger.remove()

    Path("logs").mkdir(
        exist_ok=True,
    )

    logger.configure(
        patcher=_patch,
    )

    logger.add(
        sys.stdout,
        level=settings.LOG_LEVEL,
        enqueue=True,
        backtrace=False,
        diagnose=False,
        serialize=settings.LOG_JSON,
    )

    logger.add(
        settings.LOG_FILE,
        rotation="100 MB",
        retention="30 days",
        compression="zip",
        level=settings.LOG_LEVEL,
        enqueue=True,
        serialize=True,
    )

    logging.basicConfig(
        handlers=[
            InterceptHandler(),
        ],
        level=0,
        force=True,
    )

    for name in logging.root.manager.loggerDict:
        logging.getLogger(name).handlers = [
            InterceptHandler(),
        ]


class AppLogger:
    """
    Enterprise Logger Wrapper
    """

    @staticmethod
    def debug(message: str, **kwargs):
        logger.bind(**kwargs).debug(message)

    @staticmethod
    def info(message: str, **kwargs):
        logger.bind(**kwargs).info(message)

    @staticmethod
    def warning(message: str, **kwargs):
        logger.bind(**kwargs).warning(message)

    @staticmethod
    def error(message: str, **kwargs):
        logger.bind(**kwargs).error(message)

    @staticmethod
    def exception(message: str, **kwargs):
        logger.bind(**kwargs).exception(message)


log = AppLogger() 