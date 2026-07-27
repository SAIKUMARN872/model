"""
Application entry module.

Creates and configures the FastAPI application.
"""

from __future__ import annotations

from fastapi import FastAPI

from app.core.app_config import settings

from app.startup.lifespan import lifespan

from app.startup.register_router import (
    register_routers,
)

from app.startup.register_middle import (
    register_middlewares,
)

from app.startup.register_event import (
    register_events,
)

from app.telemetry.logging import (
    configure_logging,
)

from app.telemetry.tracing import (
    configure_tracing,
)

from app.core.logging import logger



def create_application() -> FastAPI:
    """
    Application factory.

    Creates and configures FastAPI instance.
    """


    # Initialize logging

    configure_logging()


    # Initialize tracing

    configure_tracing()



    application = FastAPI(

        title=settings.APP_NAME,

        version=settings.VERSION,

        description=(
            "Enterprise AI Platform API "
            "with agents, RAG, and LLM services."
        ),

        debug=settings.DEBUG,

        lifespan=lifespan,

    )


    # Register middleware

    register_middlewares(
        application,
    )


    # Register API routes

    register_routers(
        application,
    )


    # Register application events

    register_events(
        application,
    )


    logger.info(
        "Application initialized successfully.",
    )


    return application



# FastAPI application instance

app = create_application()