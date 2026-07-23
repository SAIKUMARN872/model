"""
Main API router.

Aggregates all application route modules into a single API router.
"""

from __future__ import annotations

from fastapi import APIRouter

from .agents import router as agents_router
from .auth import router as auth_router
from .billing import router as billing_router
from .chat import router as chat_router
from .files import router as files_router
from .health import router as health_router
from .models import router as models_router
from .organizations import router as organizations_router
from .playground import router as playground_router

api_router = APIRouter()

# Health
api_router.include_router(
    health_router,
    prefix="",
)

# Authentication
api_router.include_router(
    auth_router,
    prefix="",
)

# Chat
api_router.include_router(
    chat_router,
    prefix="",
)

# AI Models
api_router.include_router(
    models_router,
    prefix="",
)

# AI Agents
api_router.include_router(
    agents_router,
    prefix="",
)

# File Management
api_router.include_router(
    files_router,
    prefix="",
)

# Organizations
api_router.include_router(
    organizations_router,
    prefix="",
)

# Billing
api_router.include_router(
    billing_router,
    prefix="",
)

# AI Playground
api_router.include_router(
    playground_router,
    prefix="",
) 