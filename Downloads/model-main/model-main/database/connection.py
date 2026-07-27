"""
Database Connection Management

Responsible for:
- Creating database connection
- Checking database availability
- Closing database connection
"""

import logging

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from .config import engine


logger = logging.getLogger(__name__)


# -------------------------------------------------
# Connect Database
# -------------------------------------------------

async def connect_database() -> None:
    """
    Initialize database connection.

    Called during application startup.
    """

    try:

        async with engine.begin() as connection:

            await connection.execute(
                text("SELECT 1")
            )

        logger.info(
            "Database connection established successfully"
        )

    except SQLAlchemyError as exc:

        logger.exception(
            "Database connection failed",
            exc_info=exc,
        )

        raise


# -------------------------------------------------
# Disconnect Database
# -------------------------------------------------

async def disconnect_database() -> None:
    """
    Close database connection.

    Called during application shutdown.
    """

    try:

        await engine.dispose()

        logger.info(
            "Database connection closed successfully"
        )

    except SQLAlchemyError as exc:

        logger.exception(
            "Database disconnection failed",
            exc_info=exc,
        )

        raise


# -------------------------------------------------
# Health Check
# -------------------------------------------------

async def check_database_connection() -> bool:
    """
    Check database health status.
    """

    try:

        async with engine.connect() as connection:

            await connection.execute(
                text("SELECT 1")
            )

        return True


    except SQLAlchemyError:

        return False