"""
Request ID Middleware

Responsibilities:
- Generate unique request ID
- Track requests across services
- Add correlation ID to responses
- Support distributed tracing

Used with:
- Logging
- Metrics
- OpenTelemetry
- Microservices
"""

import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


REQUEST_ID_HEADER = "X-Request-ID"


class RequestIDMiddleware(
    BaseHTTPMiddleware
):
    """
    Middleware for request correlation IDs.
    """


    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:

        # Use existing request ID
        # or generate a new one
        request_id = request.headers.get(
            REQUEST_ID_HEADER
        )

        if not request_id:
            request_id = str(
                uuid.uuid4()
            )


        # Attach request id to request context
        request.state.request_id = request_id


        response = await call_next(
            request
        )


        # Add request id to response headers
        response.headers[
            REQUEST_ID_HEADER
        ] = request_id


        return response 