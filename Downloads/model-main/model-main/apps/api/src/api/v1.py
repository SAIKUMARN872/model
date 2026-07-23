"""
API Version 1

Responsibilities
----------------
- Register Version 1 API Routes
- Group Endpoints
- API Versioning
"""

from fastapi import APIRouter

from routes.health import router as health_router
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.models import router as models_router
from routes.files import router as files_router
from routes.organizations import router as organizations_router
from routes.billing import router as billing_router
from routes.agents import router as agents_router
from routes.playground import router as playground_router


class APIV1:
    """
    API Version 1 Router
    """

    def __init__(self) -> None:

        self.router = APIRouter(
            prefix="/api/v1",
            tags=["API v1"],
        )

        self._register_routes()

    # ======================================================
    # Register Routes
    # ======================================================

    def _register_routes(self) -> None:

        self.router.include_router(
            health_router,
            prefix="/health",
            tags=["Health"],
        )

        self.router.include_router(
            auth_router,
            prefix="/auth",
            tags=["Authentication"],
        )

        self.router.include_router(
            chat_router,
            prefix="/chat",
            tags=["Chat"],
        )

        self.router.include_router(
            models_router,
            prefix="/models",
            tags=["Models"],
        )

        self.router.include_router(
            files_router,
            prefix="/files",
            tags=["Files"],
        )

        self.router.include_router(
            organizations_router,
            prefix="/organizations",
            tags=["Organizations"],
        )

        self.router.include_router(
            billing_router,
            prefix="/billing",
            tags=["Billing"],
        )

        self.router.include_router(
            agents_router,
            prefix="/agents",
            tags=["Agents"],
        )

        self.router.include_router(
            playground_router,
            prefix="/playground",
            tags=["Playground"],
        )

    # ======================================================
    # Get Router
    # ======================================================

    def get_router(self) -> APIRouter:
        return self.router


# ==========================================================
# Singleton Router
# ==========================================================

api_v1 = APIV1()

router = api_v1.get_router() 