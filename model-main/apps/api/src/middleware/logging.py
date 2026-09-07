"""
Logging Middleware

Responsibilities:
- Log incoming requests
- Log response status
- Track request duration
- Capture request metadata
"""

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import (
    BaseHTTPMiddleware,
)

from src.core.logging import logger


class LoggingMiddleware(
    BaseHTTPMiddleware
):
    """
    Request/Response Logging Middleware.
    """


    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:

        start_time = time.perf_counter()


        # Request logging
        logger.info(
            "Incoming request",
            extra={
                "method": request.method,
                "path": request.url.path,
                "client": (
                    request.client.host
                    if request.client
                    else None
                ),
                "request_id": (
                    request.headers.get(
                        "X-Request-ID"
                    )
                ),
            },
        )


        try:

            response = await call_next(
                request
            )


        except Exception:

            logger.exception(
                "Request failed",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                },
            )

            raise


        finally:

            duration = (
                time.perf_counter()
                - start_time
            )


        # Response logging
        logger.info(
            "Request completed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": (
                    response.status_code
                    if 'response' in locals()
                    else 500
                ),
                "duration_ms": round(
                    duration * 1000,
                    2,
                ),
                "request_id": (
                    request.headers.get(
                        "X-Request-ID"
                    )
                ),
            },
        )


        return response 