"""
CORS Middleware Configuration

Handles cross-origin requests.

Supports:
- React frontend
- Next.js frontend
- Mobile applications
- Production domains
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings



def setup_cors(
    app: FastAPI,
) -> None:
    """
    Configure CORS middleware.

    Args:
        app:
            FastAPI application instance
    """

    app.add_middleware(
        CORSMiddleware,

        # Allowed frontend origins
        allow_origins=settings.CORS_ORIGINS,

        # Allow cookies and authentication headers
        allow_credentials=True,

        # Allowed HTTP methods
        allow_methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        # Allowed request headers
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Request-ID",
        ],

        # Headers exposed to frontend
        expose_headers=[
            "X-Request-ID",
        ],

        # Cache preflight response
        max_age=600,
    ) 