"""
Rate Limit Middleware

Responsibilities:
- Limit excessive API requests
- Protect APIs from abuse
- Prevent service overload
- Support Redis-based distributed limits

Suitable for:
- Production APIs
- Microservices
- AI Agent endpoints
"""

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from src.core.redis import redis_client
from src.core.config import settings


class RateLimitMiddleware(
    BaseHTTPMiddleware
):
    """
    Redis based API rate limiter.
    """

    def __init__(
        self,
        app,
        requests_limit: int = 100,
        window_seconds: int = 60,
    ):
        super().__init__(app)

        self.requests_limit = requests_limit
        self.window_seconds = window_seconds


    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:

        client_ip = (
            request.client.host
            if request.client
            else "unknown"
        )


        # Unique key per client
        rate_limit_key = (
            f"rate_limit:{client_ip}"
        )


        try:
            current_requests = await redis_client.get(
                rate_limit_key
            )


            if current_requests:

                current_requests = int(
                    current_requests
                )

                if current_requests >= self.requests_limit:

                    return JSONResponse(
                        status_code=429,
                        content={
                            "success": False,
                            "error": {
                                "code": (
                                    "RATE_LIMIT_EXCEEDED"
                                ),
                                "message": (
                                    "Too many requests. "
                                    "Please try again later."
                                ),
                            },
                        },
                    )


                await redis_client.incr(
                    rate_limit_key
                )


            else:

                await redis_client.set(
                    rate_limit_key,
                    1,
                    expire=self.window_seconds,
                )


        except Exception:
            # Fail open if Redis is unavailable
            pass


        response = await call_next(
            request
        )

        return response 