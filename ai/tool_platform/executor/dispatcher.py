"""Timeout-aware dispatch for synchronous and asynchronous tool handlers."""

from __future__ import annotations

import asyncio
import inspect
from typing import Any, Callable


class ToolDispatchTimeout(TimeoutError):
    """Raised when a tool handler exceeds its configured timeout."""


class ToolDispatcher:
    """Execute handlers while enforcing an asynchronous timeout."""

    def __init__(self, timeout_seconds: float = 30.0) -> None:
        if (
            isinstance(timeout_seconds, bool)
            or not isinstance(timeout_seconds, (int, float))
            or timeout_seconds <= 0
        ):
            raise ValueError("timeout_seconds must be a positive number.")
        self.timeout_seconds = float(timeout_seconds)

    async def dispatch(
        self,
        handler: Callable[..., Any],
        arguments: dict[str, Any],
    ) -> Any:
        if not callable(handler):
            raise TypeError("Tool handler must be callable.")

        async def invoke() -> Any:
            if inspect.iscoroutinefunction(handler):
                return await handler(**arguments)

            result = await asyncio.to_thread(handler, **arguments)
            if inspect.isawaitable(result):
                return await result
            return result

        try:
            async with asyncio.timeout(self.timeout_seconds):
                return await invoke()
        except TimeoutError as exc:
            raise ToolDispatchTimeout(
                f"Tool execution timed out after "
                f"{self.timeout_seconds:g} seconds."
            ) from exc
