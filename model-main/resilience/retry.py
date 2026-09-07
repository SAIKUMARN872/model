"""
Retry policy implementation.

Provides automatic retry mechanisms for
temporary failures.

Used for:
- External API calls
- AI providers
- Database operations
- Network requests
"""

from __future__ import annotations

import asyncio

from typing import (
    Any,
    Callable,
    Awaitable,
)

from app.core.logging import logger



class RetryPolicy:
    """
    Async retry manager.

    Supports:
    - Maximum attempts
    - Exponential backoff
    - Retry callbacks
    """

    def __init__(
        self,
        retries: int = 3,
        delay: float = 1.0,
        backoff_factor: float = 2.0,
        max_delay: float = 30.0,
    ) -> None:

        self.retries = retries

        self.delay = delay

        self.backoff_factor = (
            backoff_factor
        )

        self.max_delay = max_delay



    async def execute(
        self,
        function: Callable[..., Awaitable[Any]],
        *args,
        **kwargs,
    ) -> Any:
        """
        Execute function with retries.
        """

        last_exception = None

        current_delay = self.delay


        for attempt in range(
            1,
            self.retries + 1,
        ):

            try:

                return await function(
                    *args,
                    **kwargs,
                )


            except Exception as exc:

                last_exception = exc


                logger.warning(
                    "Retry attempt %s/%s failed",
                    attempt,
                    self.retries,
                )


                if attempt == self.retries:

                    break


                await asyncio.sleep(
                    current_delay,
                )


                current_delay = min(
                    current_delay
                    * self.backoff_factor,
                    self.max_delay,
                )



        logger.exception(
            "All retry attempts failed",
            exc_info=last_exception,
        )


        raise last_exception



    async def execute_with_callback(
        self,
        function: Callable[..., Awaitable[Any]],
        on_retry: Callable | None = None,
        *args,
        **kwargs,
    ) -> Any:
        """
        Execute with retry callback.
        """

        last_exception = None


        for attempt in range(
            1,
            self.retries + 1,
        ):

            try:

                return await function(
                    *args,
                    **kwargs,
                )


            except Exception as exc:

                last_exception = exc


                if on_retry:

                    await on_retry(
                        attempt,
                        exc,
                    )


                await asyncio.sleep(
                    self.delay * attempt,
                )


        raise last_exception



    def decorator(
        self,
    ):
        """
        Retry decorator.
        """

        def wrapper(
            function,
        ):

            async def inner(
                *args,
                **kwargs,
            ):

                return await self.execute(
                    function,
                    *args,
                    **kwargs,
                )


            return inner


        return wrapper



# Default retry policy

default_retry = RetryPolicy()