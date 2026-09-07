"""
Application logger utility.

Provides centralized logging helpers for
services, repositories, workers, and API layers.
"""

from __future__ import annotations

import logging
import sys
from typing import Any

from app.core.config import settings



class LoggerFormatter(logging.Formatter):
    """
    Custom log formatter.
    """

    def format(
        self,
        record: logging.LogRecord,
    ) -> str:

        return (
            f"[{record.levelname}] "
            f"{record.name} - "
            f"{record.getMessage()}"
        )



def create_logger(
    name: str,
) -> logging.Logger:
    """
    Create application logger.
    """

    logger = logging.getLogger(
        name,
    )


    if logger.handlers:
        return logger


    level = getattr(
        logging,
        settings.LOG_LEVEL.upper(),
        logging.INFO,
    )


    logger.setLevel(
        level,
    )


    handler = logging.StreamHandler(
        sys.stdout,
    )


    handler.setFormatter(
        LoggerFormatter(),
    )


    logger.addHandler(
        handler,
    )


    logger.propagate = False


    return logger



def log_info(
    logger: logging.Logger,
    message: str,
    **context: Any,
) -> None:
    """
    Log info message with context.
    """

    logger.info(
        f"{message} | {context}"
        if context
        else message
    )



def log_error(
    logger: logging.Logger,
    message: str,
    error: Exception | None = None,
    **context: Any,
) -> None:
    """
    Log error message.
    """

    if error:

        logger.exception(
            f"{message} | {context}",
            exc_info=error,
        )

    else:

        logger.error(
            f"{message} | {context}"
            if context
            else message
        )



def log_warning(
    logger: logging.Logger,
    message: str,
    **context: Any,
) -> None:
    """
    Log warning message.
    """

    logger.warning(
        f"{message} | {context}"
        if context
        else message
    )



def log_debug(
    logger: logging.Logger,
    message: str,
    **context: Any,
) -> None:
    """
    Log debug message.
    """

    logger.debug(
        f"{message} | {context}"
        if context
        else message
    )



# Default application logger

logger = create_logger(
    "application",
)