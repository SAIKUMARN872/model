"""
Application Lifecycle

Handles startup and shutdown events for the application.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from cache.redis import redis_manager
from config.logging import log
from database.connection import database
from telemetry.tracing import initialize_tracing
from telemetry.logging import initialize_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    """

    # ==========================================================
    # STARTUP
    # ==========================================================

    log.info("=" * 60)
    log.info("Starting ModelNow AI Platform...")
    log.info("=" * 60)

    try:
        # Initialize logging
        initialize_logging()

        # Initialize tracing
        initialize_tracing()

        # Connect Database
        await database.connect()
        log.info("Database connected.")

        # Connect Redis
        redis_ok = await redis_manager.health()

        if redis_ok:
            log.info("Redis connected.")
        else:
            log.warning("Redis unavailable.")

        log.info("Startup completed successfully.")

    except Exception as exc:
        log.exception(
            "Startup failed.",
            error=str(exc),
        )
        raise

    yield

    # ==========================================================
    # SHUTDOWN
    # ==========================================================

    log.info("=" * 60)
    log.info("Shutting down ModelNow AI Platform...")
    log.info("=" * 60)

    try:
        await database.disconnect()
        log.info("Database disconnected.")

        await redis_manager.close()
        log.info("Redis disconnected.")

        log.info("Shutdown completed successfully.")

    except Exception as exc:
        log.exception(
            "Shutdown failed.",
            error=str(exc),
        ) 