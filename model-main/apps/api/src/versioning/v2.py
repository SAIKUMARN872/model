"""
API Version 2 configuration.

Defines version 2 routing configuration.
Used for introducing new API features while
maintaining backward compatibility with v1.
"""

from __future__ import annotations

from fastapi import APIRouter


# API Version Information

VERSION = "v2"

VERSION_PREFIX = "/v2"

VERSION_TITLE = "AI Platform API v2"

VERSION_DESCRIPTION = (
    "Version 2 API endpoints with improved "
    "AI capabilities, enhanced responses, "
    "and new platform features."
)



def create_v2_router() -> APIRouter:
    """
    Create API v2 router.

    All v2 routes are registered here.
    """

    router = APIRouter(
        prefix=VERSION_PREFIX,
        tags=[
            VERSION,
        ],
    )


    return router



# Default v2 router

v2_router = create_v2_router()



__all__ = [
    "VERSION",
    "VERSION_PREFIX",
    "VERSION_TITLE",
    "VERSION_DESCRIPTION",
    "v2_router",
    "create_v2_router",
]