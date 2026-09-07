"""
Timeout management.

Provides timeout controls for async
operations and external service calls.

Used for:
- AI providers
- Database queries
- HTTP requests
- Background tasks
"""

from __future__ import annotations

import asyncio

from typing import (
    Any,
    Callable,
    Awaitable,
)

from app.core.logging import logger



class TimeoutManager:
    """
    Async timeout handler.

    Protects services from hanging
    operations.
    """

    def __init__(
        self,
        timeout_seconds: float = 30.0,
    ) -> None:

        self.timeout_seconds = (
            timeout_seconds
        )



    async def execute(
        self,
        function: Callable[..., Awaitable[Any]],
        *args,
        **kwargs,
    ) -> Any:
        """
        Execute function with timeout.
        """

        try:

            return await asyncio.wait_for(
                function(
                    *args,
                    **kwargs,
                ),
                timeout=self.timeout_seconds,
            )


        except asyncio.TimeoutError as exc:

            logger.error(
                "Operation timed out after %s seconds",
                self.timeout_seconds,
            )


            raise TimeoutError(
                (
                    "Operation exceeded timeout "
                    f"limit of {self.timeout_seconds}s"
                )
            ) from exc



    async def execute_with_timeout(
        self,
        coroutine: Awaitable[Any],
        timeout: float | None = None,
    ) -> Any:
        """
        Execute existing coroutine with timeout.
        """

        limit = (
            timeout
            if timeout
            else self.timeout_seconds
        )


        try:

            return await asyncio.wait_for(
                coroutine,
                timeout=limit,
            )


        except asyncio.TimeoutError as exc:

            logger.error(
                "Coroutine timeout after %s seconds",
                limit,
            )


            raise TimeoutError(
                "Request timeout exceeded."
            ) from exc



    def update_timeout(
        self,
        seconds: float,
    ) -> None:
        """
        Update timeout value.
        """

        self.timeout_seconds = seconds



    def get_timeout(
        self,
    ) -> float:
        """
        Return current timeout.
        """

        return self.timeout_seconds



# Default timeout manager

timeout_manager = TimeoutManager()