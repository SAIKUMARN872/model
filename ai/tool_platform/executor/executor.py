"""Secure orchestration for ModelNow tool execution."""

from __future__ import annotations

import asyncio
import time
from typing import Any

from ..discovery.resolver import ToolResolver
from ..permissions.policy import (
    PermissionContext,
    ToolPermissionError,
    authorize_tool,
)
from ..registry.registry import ToolNotFoundError, ToolRegistry
from ..validation.validator import (
    ToolInputValidationError,
    validate_arguments,
)
from .dispatcher import ToolDispatcher, ToolDispatchTimeout
from .result import ExecutionStatus, ToolExecutionResult


class ToolExecutor:
    """Resolve, authorize, validate, and execute registered tools."""

    def __init__(
        self,
        registry: ToolRegistry,
        timeout_seconds: float = 30.0,
    ) -> None:
        if not isinstance(registry, ToolRegistry):
            raise TypeError("registry must be a ToolRegistry.")

        self.registry = registry
        self.resolver = ToolResolver(registry)
        self.dispatcher = ToolDispatcher(timeout_seconds)
        self.timeout_seconds = float(timeout_seconds)

    async def execute(
        self,
        tool_name: str,
        arguments: dict[str, Any] | None = None,
        *,
        version: str | None = None,
        context: PermissionContext | None = None,
    ) -> ToolExecutionResult:
        """Execute a registered tool and return a structured result."""
        started = time.perf_counter()
        safe_name = tool_name if isinstance(tool_name, str) else str(tool_name)
        resolved_version: str | None = version

        def result(
            status: ExecutionStatus,
            *,
            output: Any = None,
            error: str | None = None,
        ) -> ToolExecutionResult:
            return ToolExecutionResult(
                tool_name=safe_name,
                success=status is ExecutionStatus.SUCCESS,
                status=status,
                output=output,
                error=error,
                duration_seconds=max(0.0, time.perf_counter() - started),
                version=resolved_version,
            )

        if not isinstance(tool_name, str) or not tool_name.strip():
            return result(
                ExecutionStatus.VALIDATION_ERROR,
                error="Tool name must be a non-empty string.",
            )

        try:
            tool = self.resolver.resolve(tool_name, version=version)
            resolved_version = tool.version
        except ToolNotFoundError as exc:
            return result(ExecutionStatus.NOT_FOUND, error=str(exc))
        except (TypeError, ValueError) as exc:
            status = (
                ExecutionStatus.DISABLED
                if str(exc).startswith("Tool is disabled:")
                else ExecutionStatus.VALIDATION_ERROR
            )
            return result(status, error=str(exc))

        try:
            validated_arguments = validate_arguments(
                arguments,
                tool.input_schema,
            )
        except (ToolInputValidationError, TypeError, ValueError) as exc:
            return result(ExecutionStatus.VALIDATION_ERROR, error=str(exc))

        try:
            authorize_tool(tool.required_permissions, context)
        except (ToolPermissionError, TypeError, ValueError) as exc:
            return result(ExecutionStatus.PERMISSION_DENIED, error=str(exc))

        try:
            output = await self.dispatcher.dispatch(
                tool.handler,
                validated_arguments,
            )
            return result(ExecutionStatus.SUCCESS, output=output)
        except ToolDispatchTimeout as exc:
            return result(ExecutionStatus.TIMEOUT, error=str(exc))
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            return result(
                ExecutionStatus.ERROR,
                error=f"{type(exc).__name__}: {exc}",
            )
