"""
Authentication Middleware

Responsibilities:
- Validate JWT access tokens
- Extract current user identity
- Attach user information to request state
- Protect secured API routes
"""

from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import (
    BaseHTTPMiddleware,
)

from src.core.auth.jwt import decode_token
from src.exceptions.auth import (
    AuthenticationException,
)


class AuthenticationMiddleware(
    BaseHTTPMiddleware
):
    """
    JWT Authentication Middleware.
    """


    PUBLIC_PATHS = {
        "/",
        "/health/live",
        "/health/ready",
        "/docs",
        "/openapi.json",
        "/redoc",
    }


    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:

        # Allow public routes
        if request.url.path in self.PUBLIC_PATHS:
            return await call_next(request)


        authorization = request.headers.get(
            "Authorization"
        )


        if not authorization:
            raise AuthenticationException(
                message="Authorization token missing"
            )


        try:
            scheme, token = authorization.split(
                " "
            )

            if scheme.lower() != "bearer":
                raise AuthenticationException(
                    message="Invalid authentication scheme"
                )


            payload = decode_token(
                token
            )


            # Attach user information
            request.state.user = payload


        except ValueError:
            raise AuthenticationException(
                message="Invalid authorization header"
            )


        except Exception:
            raise AuthenticationException(
                message="Invalid or expired token"
            )


        response = await call_next(
            request
        )

        return response 