"""
Application Logger Setup

Provides:
- Logger creation
- Logging initialization
- Console and file handlers
"""

import logging

from .config import logging_settings
from .formatter import CustomFormatter
from .handlers import (
    create_console_handler,
    create_file_handler,
)


_initialized = False


def setup_logging() -> None:
    """
    Configure application logging.
    """

    global _initialized


    if _initialized:
        return


    logger = logging.getLogger()

    logger.setLevel(
        logging_settings.LOG_LEVEL
    )


    formatter = CustomFormatter(
        logging_settings.LOG_FORMAT
    )


    # Console Handler

    if logging_settings.ENABLE_CONSOLE_LOGGING:

        console_handler = create_console_handler()

        console_handler.setFormatter(
            formatter
        )

        logger.addHandler(
            console_handler
        )


    # File Handler

    if logging_settings.ENABLE_FILE_LOGGING:

        file_handler = create_file_handler()

        file_handler.setFormatter(
            formatter
        )

        logger.addHandler(
            file_handler
        )


    _initialized = True



def get_logger(
    name: str
) -> logging.Logger:
    """
    Get application logger.

    Example:
        logger = get_logger(__name__)
    """

    if not _initialized:
        setup_logging()


    return logging.getLogger(name)