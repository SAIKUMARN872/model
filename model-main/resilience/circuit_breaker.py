"""
Circuit breaker implementation.

Protects application services from repeated
failures by temporarily stopping requests
to unhealthy dependencies.

Used for:
- LLM providers
- External APIs
- Databases
- Third-party services
"""

from __future__ import annotations

import asyncio

from enum import Enum
from datetime import datetime, timezone
from typing import Any, Callable, Awaitable

from app.core.logging import logger



class CircuitState(str, Enum):
    """
    Circuit states.
    """

    CLOSED = "closed"

    OPEN = "open"

    HALF_OPEN = "half_open"



class CircuitBreaker:
    """
    Async circuit breaker.

    Flow:

    CLOSED:
        Requests allowed.

    OPEN:
        Requests blocked.

    HALF_OPEN:
        Test request allowed.
    """

    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
    ) -> None:

        self.name = name

        self.failure_threshold = (
            failure_threshold
        )

        self.recovery_timeout = (
            recovery_timeout
        )

        self.failure_count = 0

        self.state = CircuitState.CLOSED

        self.last_failure_time: (
            datetime | None
        ) = None



    def _can_retry(self) -> bool:
        """
        Check if recovery attempt is allowed.
        """

        if not self.last_failure_time:

            return False


        elapsed = (
            datetime.now(
                timezone.utc
            )
            -
            self.last_failure_time
        ).total_seconds()


        return (
            elapsed >= self.recovery_timeout
        )



    async def call(
        self,
        function: Callable[..., Awaitable[Any]],
        *args,
        **kwargs,
    ) -> Any:
        """
        Execute function with circuit protection.
        """

        if self.state == CircuitState.OPEN:

            if self._can_retry():

                self.state = (
                    CircuitState.HALF_OPEN
                )

                logger.info(
                    "Circuit moved to HALF_OPEN: %s",
                    self.name,
                )

            else:

                raise Exception(
                    f"Circuit breaker OPEN: {self.name}"
                )


        try:

            result = await function(
                *args,
                **kwargs,
            )


            self._on_success()


            return result



        except Exception as exc:

            self._on_failure()


            logger.exception(
                "Circuit failure: %s",
                self.name,
                exc_info=exc,
            )


            raise



    def _on_success(
        self,
    ) -> None:
        """
        Handle successful request.
        """

        self.failure_count = 0

        self.state = (
            CircuitState.CLOSED
        )


        logger.info(
            "Circuit recovered: %s",
            self.name,
        )



    def _on_failure(
        self,
    ) -> None:
        """
        Handle failed request.
        """

        self.failure_count += 1


        self.last_failure_time = (
            datetime.now(
                timezone.utc
            )
        )


        if (
            self.failure_count
            >= self.failure_threshold
        ):

            self.state = (
                CircuitState.OPEN
            )


            logger.warning(
                "Circuit opened: %s",
                self.name,
            )



    def reset(
        self,
    ) -> None:
        """
        Manually reset circuit.
        """

        self.failure_count = 0

        self.state = (
            CircuitState.CLOSED
        )

        self.last_failure_time = None



    def status(
        self,
    ) -> dict[str, Any]:
        """
        Return circuit information.
        """

        return {
            "name": self.name,
            "state": self.state.value,
            "failures": self.failure_count,
            "last_failure": (
                self.last_failure_time.isoformat()
                if self.last_failure_time
                else None
            ),
        }