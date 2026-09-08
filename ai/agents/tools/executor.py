"""
Tool execution system for AI tools.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any

from .adapter import (
    ToolAdapter,
    ToolCall,
)
from .utils import (
    elapsed_ms,
    execute_callable,
    safe_exception_message,
    validate_arguments,
)


class ToolExecutionError(
    Exception
):
    """Base tool execution exception."""


class ToolTimeoutError(
    ToolExecutionError
):
    """Raised when a tool exceeds its timeout."""


@dataclass
class ToolExecutionResult:
    """
    Standard result returned by a tool execution.
    """

    success: bool

    tool_name: str

    result: Any = None

    error: str | None = None

    call_id: str | None = None

    attempts: int = 1

    duration_ms: float = 0.0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "success": self.success,
            "tool_name": self.tool_name,
            "result": self.result,
            "error": self.error,
            "call_id": self.call_id,
            "attempts": self.attempts,
            "duration_ms": self.duration_ms,
            "metadata": dict(
                self.metadata
            ),
        }


@dataclass
class ToolExecutorConfig:
    """
    Configuration for tool execution.
    """

    timeout: float | None = 30.0

    max_retries: int = 0

    retry_delay: float = 0.0

    fail_silently: bool = True

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


class ToolExecutor:
    """
    Executes ToolAdapter instances safely.

    Supports:
        - sync tools
        - async tools
        - timeouts
        - retries
        - structured results
    """

    def __init__(
        self,
        config: ToolExecutorConfig | None = None,
    ) -> None:

        self.config = (
            config
            or ToolExecutorConfig()
        )

    async def execute(
        self,
        tool: ToolAdapter,
        arguments: dict[str, Any] | None = None,
        call: ToolCall | None = None,
    ) -> ToolExecutionResult:

        arguments = arguments or {}

        validate_arguments(
            tool.function,
            arguments,
        )

        call = call or ToolCall(
            tool_name=tool.name,
            arguments=arguments,
        )

        start_time = (
            __import__("time").perf_counter()
        )

        attempts = 0

        last_error: str | None = None

        total_attempts = (
            self.config.max_retries + 1
        )

        while attempts < total_attempts:

            attempts += 1

            try:

                result_coroutine = (
                    execute_callable(
                        tool.function,
                        **arguments,
                    )
                )

                if self.config.timeout is not None:

                    result = await asyncio.wait_for(
                        result_coroutine,
                        timeout=self.config.timeout,
                    )

                else:

                    result = await result_coroutine

                return ToolExecutionResult(
                    success=True,
                    tool_name=tool.name,
                    result=result,
                    call_id=call.call_id,
                    attempts=attempts,
                    duration_ms=elapsed_ms(
                        start_time
                    ),
                    metadata={
                        "category": tool.category,
                        "version": tool.version,
                    },
                )

            except asyncio.TimeoutError:

                last_error = (
                    f"Tool '{tool.name}' "
                    f"timed out"
                )

            except Exception as exc:

                last_error = (
                    safe_exception_message(
                        exc
                    )
                )

            if attempts < total_attempts:

                if self.config.retry_delay > 0:

                    await asyncio.sleep(
                        self.config.retry_delay
                    )

        result = ToolExecutionResult(
            success=False,
            tool_name=tool.name,
            error=(
                last_error
                or "Tool execution failed"
            ),
            call_id=call.call_id,
            attempts=attempts,
            duration_ms=elapsed_ms(
                start_time
            ),
        )

        if not self.config.fail_silently:

            raise ToolExecutionError(
                result.error
                or "Tool execution failed"
            )

        return result