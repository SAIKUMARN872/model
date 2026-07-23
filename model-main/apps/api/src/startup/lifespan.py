"""
Application lifespan management.

Handles startup and shutdown events:
- Database connection initialization
- Cache initialization
- AI provider loading
- Background workers
- Resource cleanup
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.core.container import container
from app.core.logging import logger


@asynccontextmanager
async def lifespan(
    app: FastAPI,
) -> AsyncIterator[None]:
    """
    FastAPI application lifespan.

    Executes startup logic before application starts
    and shutdown logic before application stops.
    """

    # -------------------------
    # Application Startup
    # -------------------------

    logger.info(
        "Starting application..."
    )

    try:
        # Initialize dependency container
        await container.initialize()

        logger.info(
            "Dependency container initialized."
        )


        # Initialize database
        if hasattr(container, "database"):
            await container.database.connect()

            logger.info(
                "Database connection established."
            )


        # Initialize cache / Redis
        if hasattr(container, "cache"):
            await container.cache.connect()

            logger.info(
                "Cache connection established."
            )


        # Initialize AI providers
        if hasattr(container, "ai"):
            await container.ai.initialize()

            logger.info(
                "AI providers initialized."
            )


        # Store application state
        app.state.container = container


        logger.info(
            "Application startup completed."
        )


    except Exception as exc:

        logger.exception(
            "Application startup failed",
            exc_info=exc,
        )

        raise exc


    yield


    # -------------------------
    # Application Shutdown
    # -------------------------

    logger.info(
        "Stopping application..."
    )

    try:

        # Close AI providers
        if hasattr(container, "ai"):
            await container.ai.shutdown()

            logger.info(
                "AI providers closed."
            )


        # Close cache
        if hasattr(container, "cache"):
            await container.cache.disconnect()

            logger.info(
                "Cache connection closed."
            )


        # Close database
        if hasattr(container, "database"):
            await container.database.disconnect()

            logger.info(
                "Database connection closed."
            )


        # Destroy container
        await container.shutdown()


        logger.info(
            "Application shutdown completed."
        )


    except Exception as exc:

        logger.exception(
            "Application shutdown failed",
            exc_info=exc,
        )