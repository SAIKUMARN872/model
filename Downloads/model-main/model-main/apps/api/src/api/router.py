"""
API Router

Enterprise API Router

Responsibilities
----------------
- Register API Routes
- Versioning
- Route Prefixes
"""

from fastapi import APIRouter

from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.models import router as model_router
from routes.files import router as file_router
from routes.health import router as health_router
from routes.organizations import router as organization_router
from routes.billing import router as billing_router
from routes.agents import router as agent_router
from routes.playground import router as playground_router


class APIRouterFactory:
    """
    Enterprise API Router Factory.
    """

    def __init__(self) -> None:
        self.router = APIRouter(
            prefix="/api",
            tags=["API"],
        )

        self.register_routes()

    # ==========================================================
    # Register Routes
    # ==========================================================

    def register_routes(self) -> None:

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
            model_router,
            prefix="/models",
            tags=["Models"],
        )

        self.router.include_router(
            file_router,
            prefix="/files",
            tags=["Files"],
        )

        self.router.include_router(
            organization_router,
            prefix="/organizations",
            tags=["Organizations"],
        )

        self.router.include_router(
            billing_router,
            prefix="/billing",
            tags=["Billing"],
        )

        self.router.include_router(
            agent_router,
            prefix="/agents",
            tags=["Agents"],
        )

        self.router.include_router(
            playground_router,
            prefix="/playground",
            tags=["Playground"],
        )

    # ==========================================================
    # Return Router
    # ==========================================================

    def get_router(self) -> APIRouter:
        return self.router


# ==========================================================
# Singleton Router
# ==========================================================

router = APIRouterFactory().get_router() 