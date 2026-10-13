"""Controlled execution of registered tools."""

from __future__ import annotations

import asyncio
import inspect
from dataclasses import dataclass
from typing import Any

from .tool_registry import ToolRegistry
from .utils import validate_arguments, validate_tool_name


@dataclass(frozen=True)
class ToolResult:
    tool_name: str
    success: bool
    output: Any = None
    error: str | None = None


class ToolExecutor:
    def __init__(self, registry: ToolRegistry, timeout_seconds: float = 30.0):
        if not isinstance(registry, ToolRegistry):
            raise TypeError("registry must be a ToolRegistry.")
        if (
            isinstance(timeout_seconds, bool)
            or not isinstance(timeout_seconds, (int, float))
            or timeout_seconds <= 0
        ):
            raise ValueError("timeout_seconds must be positive.")
        self.registry = registry
        self.timeout_seconds = float(timeout_seconds)

    async def execute(
        self, tool_name: str, arguments: dict[str, Any] | None = None
    ) -> ToolResult:
        try:
            name = validate_tool_name(tool_name)
            kwargs = validate_arguments(arguments)
            tool = self.registry.get(name)

            output = await asyncio.wait_for(
                tool.invoke(kwargs), timeout=self.timeout_seconds
            )
            return ToolResult(tool_name=name, success=True, output=output)
        except asyncio.TimeoutError:
            return ToolResult(
                tool_name=str(tool_name),
                success=False,
                error=f"Tool execution timed out after {self.timeout_seconds:g} seconds.",
            )
        except Exception as exc:
            return ToolResult(
                tool_name=str(tool_name),
                success=False,
                error=f"{type(exc).__name__}: {exc}",
            )
