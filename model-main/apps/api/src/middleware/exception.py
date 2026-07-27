"""
Exception Middleware

Handles:
- Unhandled application exceptions
- Error logging
- Standard API error responses
- Prevents application crashes
"""

import traceback
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import (
    BaseHTTPMiddleware,
)
from starlette.responses import JSONResponse

from src.core.logging import logger


class ExceptionMiddleware(
    BaseHTTPMiddleware
):
    """
    Global Exception Handling Middleware.
    """


    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:

        try:
            response = await call_next(
                request
            )

            return response


        except Exception as exc:

            # Log unexpected errors
            logger.exception(
                "Unhandled exception occurred",
                extra={
                    "path": request.url.path,
                    "method": request.method,
                    "error": str(exc),
                },
            )


            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": (
                            "An unexpected error "
                            "occurred"
                        ),
                    },
                },
            ) 