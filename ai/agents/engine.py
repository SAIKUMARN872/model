"""
Main ModelNow Tool Engine.

Provides registration, discovery, validation,
execution, limits, and execution history.
"""

from __future__ import annotations

import asyncio
import inspect
from dataclasses import dataclass, field
from typing import Any, Callable

from .constants import (
    DEFAULT_MAX_RETRIES,
    DEFAULT_MAX_TOOL_CALLS,
    DEFAULT_RETRY_DELAY,
    DEFAULT_TOOL_TIMEOUT,
)
from .exceptions import (
    ToolExecutionError,
    ToolLimitExceededError,
    ToolNotFoundError,
    ToolPermissionError,
    ToolTimeoutError,
)
from .models import (
    ToolCall,
    ToolDefinition,
    ToolExecutionRecord,
    ToolResult,
)
from .schemas import (
    build_tool_schema,
    validate_arguments,
)
from .utils import (
    elapsed_ms,
    get_description,
    is_async_callable,
    normalize_tool_name,
    safe_error,
)


@dataclass
class RegisteredTool:
    """
    Internal representation of a registered tool.
    """

    name: str

    function: Callable[..., Any]

    description: str

    category: str = "general"

    version: str = "1.0.0"

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    enabled: bool = True

    @property
    def is_async(self) -> bool:

        return is_async_callable(
            self.function
        )

    def definition(
        self,
    ) -> ToolDefinition:

        from .schemas import infer_parameters

        return ToolDefinition(
            name=self.name,
            description=self.description,
            function=self.function,
            category=self.category,
            version=self.version,
            parameters=infer_parameters(
                self.function
            ),
            metadata=dict(
                self.metadata
            ),
            is_async=self.is_async,
            enabled=self.enabled,
        )

    def schema(
        self,
    ) -> dict[str, Any]:

        return build_tool_schema(
            name=self.name,
            description=self.description,
            function=self.function,
        )


@dataclass
class ToolEngineConfig:
    """Configuration for the tool engine."""

    timeout: float | None = DEFAULT_TOOL_TIMEOUT

    max_retries: int = DEFAULT_MAX_RETRIES

    retry_delay: float = DEFAULT_RETRY_DELAY

    max_tool_calls: int = DEFAULT_MAX_TOOL_CALLS

    allow_disabled_tools: bool = False

    require_confirmation: bool = False

    allowed_categories: set[str] | None = None

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

        if self.max_tool_calls <= 0:

            raise ValueError(
                "max_tool_calls must be positive"
            )


class ToolEngine:
    """
    Central tool management and execution engine.
    """

    def __init__(
        self,
        config: ToolEngineConfig | None = None,
    ) -> None:

        self.config = (
            config
            or ToolEngineConfig()
        )

        self._tools: dict[
            str,
            RegisteredTool,
        ] = {}

        self._history: list[
            ToolExecutionRecord
        ] = []

        self._call_count = 0

    # --------------------------------------------------
    # Registration
    # --------------------------------------------------

    def register(
        self,
        function: Callable[..., Any],
        name: str | None = None,
        description: str = "",
        category: str = "general",
        version: str = "1.0.0",
        metadata: dict[str, Any] | None = None,
        overwrite: bool = False,
    ) -> RegisteredTool:
        """
        Register a Python callable as a tool.
        """

        if not callable(function):

            raise TypeError(
                "function must be callable"
            )

        tool_name = normalize_tool_name(
            name
            or getattr(
                function,
                "__name__",
                "tool",
            )
        )

        if (
            tool_name in self._tools
            and not overwrite
        ):

            raise ValueError(
                f"Tool already registered: "
                f"{tool_name}"
            )

        if not description:

            description = get_description(
                function
            )

        tool = RegisteredTool(
            name=tool_name,
            function=function,
            description=description,
            category=category,
            version=version,
            metadata=metadata or {},
        )

        self._tools[
            tool_name
        ] = tool

        return tool

    def unregister(
        self,
        name: str,
    ) -> bool:

        name = normalize_tool_name(
            name
        )

        if name not in self._tools:
            return False

        del self._tools[
            name
        ]

        return True

    # --------------------------------------------------
    # Discovery
    # --------------------------------------------------

    def get_tool(
        self,
        name: str,
    ) -> RegisteredTool:

        name = normalize_tool_name(
            name
        )

        tool = self._tools.get(
            name
        )

        if tool is None:

            raise ToolNotFoundError(
                f"Tool not found: {name}"
            )

        return tool

    def has_tool(
        self,
        name: str,
    ) -> bool:

        try:

            name = normalize_tool_name(
                name
            )

        except (
            TypeError,
            ValueError,
        ):

            return False

        return name in self._tools

    def list_tools(
        self,
    ) -> list[str]:

        return sorted(
            self._tools.keys()
        )

    def definitions(
        self,
    ) -> list[ToolDefinition]:

        return [
            tool.definition()
            for tool
            in self._tools.values()
        ]

    def schemas(
        self,
    ) -> list[dict[str, Any]]:

        return [
            tool.schema()
            for tool
            in self._tools.values()
        ]

    def tools_by_category(
        self,
        category: str,
    ) -> list[RegisteredTool]:

        return [
            tool
            for tool
            in self._tools.values()
            if tool.category == category
        ]

    # --------------------------------------------------
    # Execution
    # --------------------------------------------------

    async def execute(
        self,
        name: str,
        arguments: dict[str, Any] | None = None,
        user_id: str | None = None,
        agent_id: str | None = None,
        session_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> ToolResult:

        if (
            self._call_count
            >= self.config.max_tool_calls
        ):

            raise ToolLimitExceededError(
                "Maximum tool-call limit reached"
            )

        tool = self.get_tool(
            name
        )

        if not tool.enabled:

            if not self.config.allow_disabled_tools:

                raise ToolPermissionError(
                    f"Tool is disabled: "
                    f"{tool.name}"
                )

        if (
            self.config.allowed_categories
            and tool.category
            not in self.config.allowed_categories
        ):

            raise ToolPermissionError(
                f"Tool category is not allowed: "
                f"{tool.category}"
            )

        arguments = arguments or {}

        try:

            validate_arguments(
                tool.function,
                arguments,
            )

        except Exception as exc:

            raise ToolExecutionError(
                f"Invalid arguments for "
                f"'{tool.name}': {exc}"
            ) from exc

        call = ToolCall(
            tool_name=tool.name,
            arguments=arguments,
            user_id=user_id,
            agent_id=agent_id,
            session_id=session_id,
            metadata=metadata or {},
        )

        self._call_count += 1

        start = (
            __import__(
                "time"
            ).perf_counter()
        )

        attempts = 0

        last_error: str | None = None

        for attempt in range(
            self.config.max_retries + 1
        ):

            attempts += 1

            try:

                result = tool.function(
                    **arguments
                )

                if inspect.isawaitable(
                    result
                ):

                    if (
                        self.config.timeout
                        is not None
                    ):

                        result = await asyncio.wait_for(
                            result,
                            timeout=self.config.timeout,
                        )

                    else:

                        result = await result

                else:

                    result = await self._run_sync(
                        result,
                        self.config.timeout,
                    )

                duration = elapsed_ms(
                    start
                )

                tool_result = ToolResult.success_result(
                    tool_name=tool.name,
                    result=result,
                    call_id=call.call_id,
                    duration_ms=duration,
                    attempts=attempts,
                    metadata={
                        "category": tool.category,
                        "version": tool.version,
                    },
                )

                self._record(
                    call,
                    tool_result,
                )

                return tool_result

            except asyncio.TimeoutError:

                last_error = (
                    f"Tool '{tool.name}' "
                    f"timed out"
                )

            except Exception as exc:

                last_error = safe_error(
                    exc
                )

            if (
                attempt
                < self.config.max_retries
            ):

                if self.config.retry_delay > 0:

                    await asyncio.sleep(
                        self.config.retry_delay
                    )

        duration = elapsed_ms(
            start
        )

        tool_result = ToolResult.failure_result(
            tool_name=tool.name,
            error=(
                last_error
                or "Tool execution failed"
            ),
            call_id=call.call_id,
            duration_ms=duration,
            attempts=attempts,
        )

        self._record(
            call,
            tool_result,
        )

        return tool_result

    async def _run_sync(
        self,
        result: Any,
        timeout: float | None,
    ) -> Any:
        """
        Handle already-created synchronous results.

        Normal synchronous functions execute before this method,
        so this method primarily preserves the common async API.
        """

        return result

    def _record(
        self,
        call: ToolCall,
        result: ToolResult,
    ) -> None:

        record = ToolExecutionRecord(
            call=call,
            result=result,
        )

        self._history.append(
            record
        )

    async def execute_call(
        self,
        call: ToolCall,
    ) -> ToolResult:

        return await self.execute(
            name=call.tool_name,
            arguments=call.arguments,
            user_id=call.user_id,
            agent_id=call.agent_id,
            session_id=call.session_id,
            metadata=call.metadata,
        )

    # --------------------------------------------------
    # History
    # --------------------------------------------------

    def history(
        self,
    ) -> list[ToolExecutionRecord]:

        return list(
            self._history
        )

    def clear_history(self) -> None:

        self._history.clear()

    def reset_call_count(self) -> None:

        self._call_count = 0

    # --------------------------------------------------
    # Status
    # --------------------------------------------------

    def status(
        self,
    ) -> dict[str, Any]:

        return {
            "registered_tools": len(
                self._tools
            ),
            "tools": self.list_tools(),
            "call_count": self._call_count,
            "max_tool_calls": (
                self.config.max_tool_calls
            ),
            "history_count": len(
                self._history
            ),
        }