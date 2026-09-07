"""
Application route package.

Exports all API routers and the root API router.
"""

from .agents import router as agents_router
from .auth import router as auth_router
from .billing import router as billing_router
from .chat import router as chat_router
from .files import router as files_router
from .health import router as health_router
from .models import router as models_router
from .organizations import router as organizations_router
from .playground import router as playground_router
from .router import api_router

__all__ = [
    "api_router",
    "agents_router",
    "auth_router",
    "billing_router",
    "chat_router",
    "files_router",
    "health_router",
    "models_router",
    "organizations_router",
    "playground_router",
] 