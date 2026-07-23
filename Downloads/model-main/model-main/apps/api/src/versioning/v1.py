"""
API Version 1 configuration.

Defines version metadata and routing
configuration for the first API release.
"""

from __future__ import annotations

from fastapi import APIRouter


# API Version Information

VERSION = "v1"

VERSION_PREFIX = "/v1"

VERSION_TITLE = "AI Platform API v1"

VERSION_DESCRIPTION = (
    "Version 1 API endpoints for "
    "authentication, agents, chat, models, "
    "files, and organizations."
)



def create_v1_router() -> APIRouter:
    """
    Create API v1 router.

    All v1 routes are registered here.
    """

    router = APIRouter(
        prefix=VERSION_PREFIX,
        tags=[
            VERSION,
        ],
    )


    return router



# Default v1 router

v1_router = create_v1_router()



__all__ = [
    "VERSION",
    "VERSION_PREFIX",
    "VERSION_TITLE",
    "VERSION_DESCRIPTION",
    "v1_router",
    "create_v1_router",
]