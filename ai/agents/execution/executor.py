"""
Task executor for ModelNow.

Supports:
    - synchronous functions
    - asynchronous functions
    - retries
    - timeouts
    - execution metadata
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable
from uuid import uuid4

from .utils import (
    elapsed_ms,
    execute_with_timeout,
    run_sync,
    safe_error,
    serialize_result,
    utc_now,
)


class ExecutionError(Exception):
    """Base execution exception."""


class ExecutionTimeoutError(
    ExecutionError
):
    """Raised when execution exceeds its timeout."""


class ExecutionRetryError(
    ExecutionError
):
    """Raised when all retries fail."""


@dataclass
class ExecutionConfig:
    """
    Configuration for task execution.
    """

    timeout: float | None = None

    max_retries: int = 0

    retry_delay: float = 0.0

    retry_backoff: float = 1.0

    fail_silently: bool = False

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if (
            self.timeout is not None
            and self.timeout <= 0
        ):
            raise ValueError(
                "timeout must be greater than zero"
            )

        if self.max_retries < 0:
            raise ValueError(
                "max_retries cannot be negative"
            )

        if self.retry_delay < 0:
            raise ValueError(
                "retry_delay cannot be negative"
            )

        if self.retry_backoff <= 0:
            raise ValueError(
                "retry_backoff must be greater than zero"
            )


@dataclass
class ExecutionResult:
    """
    Result of one execution.
    """

    execution_id: str

    success: bool

    result: Any = None

    error: str | None = None

    attempts: int = 1

    duration_ms: float = 0.0

    started_at: Any = None

    completed_at: Any = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "execution_id": self.execution_id,
            "success": self.success,
            "result": serialize_result(
                self.result
            ),
            "error": self.error,
            "attempts": self.attempts,
            "duration_ms": self.duration_ms,
            "started_at": (
                self.started_at.isoformat()
                if self.started_at
                else None
            ),
            "completed_at": (
                self.completed_at.isoformat()
                if self.completed_at
                else None
            ),
            "metadata": serialize_result(
                self.metadata
            ),
        }


class TaskExecutor:
    """
    Executes arbitrary Python callables.

    The callable can be sync or async.
    """

    def __init__(
        self,
        config: ExecutionConfig | None = None,
    ) -> None:

        self.config = (
            config
            or ExecutionConfig()
        )

    async def execute(
        self,
        function: Callable[..., Any],
        *args: Any,
        **kwargs: Any,
    ) -> ExecutionResult:

        execution_id = str(uuid4())

        started_at = utc_now()

        start_time = __import__(
            "time"
        ).perf_counter()

        attempts = 0

        last_error: str | None = None

        total_attempts = (
            self.config.max_retries + 1
        )

        while attempts < total_attempts:

            attempts += 1

            try:

                result = await execute_with_timeout(
                    function,
                    self.config.timeout,
                    *args,
                    **kwargs,
                )

                completed_at = utc_now()

                return ExecutionResult(
                    execution_id=execution_id,
                    success=True,
                    result=result,
                    attempts=attempts,
                    duration_ms=elapsed_ms(
                        start_time
                    ),
                    started_at=started_at,
                    completed_at=completed_at,
                    metadata={
                        **self.config.metadata,
                        "retry_count": attempts - 1,
                    },
                )

            except TimeoutError as exc:

                last_error = (
                    "Execution timed out"
                )

            except Exception as exc:

                last_error = safe_error(
                    exc
                )

            if attempts < total_attempts:

                delay = (
                    self.config.retry_delay
                    * (
                        self.config.retry_backoff
                        ** (attempts - 1)
                    )
                )

                if delay > 0:

                    import asyncio

                    await asyncio.sleep(
                        delay
                    )

        completed_at = utc_now()

        result = ExecutionResult(
            execution_id=execution_id,
            success=False,
            result=None,
            error=last_error,
            attempts=attempts,
            duration_ms=elapsed_ms(
                start_time
            ),
            started_at=started_at,
            completed_at=completed_at,
            metadata={
                **self.config.metadata,
                "retry_count": attempts - 1,
            },
        )

        if not self.config.fail_silently:

            raise ExecutionRetryError(
                last_error
                or "Execution failed"
            )

        return result

    def execute_sync(
        self,
        function: Callable[..., Any],
        *args: Any,
        **kwargs: Any,
    ) -> ExecutionResult:

        return run_sync(
            self.execute(
                function,
                *args,
                **kwargs,
            )
        )