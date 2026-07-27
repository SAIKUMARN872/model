"""
Middleware registration.

Central place for registering all FastAPI middleware:
- CORS
- Authentication
- Request ID
- Logging
- Rate limiting
- Exception handling
"""

from __future__ import annotations

from fastapi import FastAPI

from app.middleware.auth import AuthMiddleware
from app.middleware.cors import setup_cors
from app.middleware.exception import ExceptionMiddleware
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIDMiddleware

from app.core.logging import logger



def register_middlewares(
    app: FastAPI,
) -> None:
    """
    Register application middlewares.
    """

    logger.info(
        "Registering middlewares..."
    )


    # -------------------------
    # CORS Middleware
    # -------------------------

    setup_cors(app)


    # -------------------------
    # Request ID Middleware
    # -------------------------

    app.add_middleware(
        RequestIDMiddleware,
    )


    # -------------------------
    # Logging Middleware
    # -------------------------

    app.add_middleware(
        LoggingMiddleware,
    )


    # -------------------------
    # Authentication Middleware
    # -------------------------

    app.add_middleware(
        AuthMiddleware,
    )


    # -------------------------
    # Rate Limiting Middleware
    # -------------------------

    app.add_middleware(
        RateLimitMiddleware,
    )


    # -------------------------
    # Exception Middleware
    # -------------------------

    app.add_middleware(
        ExceptionMiddleware,
    )


    logger.info(
        "Middlewares registered successfully."
    )