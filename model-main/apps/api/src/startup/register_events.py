"""
Application event registration.

Registers startup and shutdown handlers,
background tasks, and application events.
"""

from __future__ import annotations

from fastapi import FastAPI

from app.core.logging import logger


def register_events(
    app: FastAPI,
) -> None:
    """
    Register application events.

    Used for attaching startup/shutdown hooks
    and background processes.
    """

    register_startup_events(app)

    register_shutdown_events(app)



def register_startup_events(
    app: FastAPI,
) -> None:
    """
    Register startup events.
    """

    @app.on_event("startup")
    async def startup_event() -> None:

        logger.info(
            "Running startup events..."
        )

        # Add startup tasks here:
        #
        # - warm AI models
        # - validate environment
        # - initialize queues
        # - create indexes
        # - load configurations

        logger.info(
            "Startup events completed."
        )



def register_shutdown_events(
    app: FastAPI,
) -> None:
    """
    Register shutdown events.
    """

    @app.on_event("shutdown")
    async def shutdown_event() -> None:

        logger.info(
            "Running shutdown events..."
        )

        # Add shutdown tasks here:
        #
        # - close workers
        # - flush queues
        # - release resources
        # - cleanup connections

        logger.info(
            "Shutdown events completed."
        )