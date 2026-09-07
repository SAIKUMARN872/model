"""
Router registration.

Central place for registering all API routes.
"""

from __future__ import annotations

from fastapi import FastAPI

from app.routes.router import api_router

from app.core.config import settings
from app.core.logging import logger



def register_routers(
    app: FastAPI,
) -> None:
    """
    Register application API routers.
    """

    logger.info(
        "Registering API routers..."
    )


    app.include_router(
        api_router,
        prefix=settings.API_PREFIX,
    )


    logger.info(
        "API routers registered successfully."
    )