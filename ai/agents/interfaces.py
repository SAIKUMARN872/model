"""
Interfaces and protocols for the ModelNow tool system.
"""

from __future__ import annotations

from typing import Any, Callable, Protocol


class ToolFunction(Protocol):
    """
    Protocol for synchronous and asynchronous tool functions.
    """

    def __call__(
        self,
        *args: Any,
        **kwargs: Any,
    ) -> Any:
        ...


class ToolRegistryInterface(Protocol):
    """Interface for a tool registry."""

    def register(
        self,
        tool: Any,
        overwrite: bool = False,
    ) -> Any:
        ...

    def get(
        self,
        name: str,
    ) -> Any:
        ...

    def remove(
        self,
        name: str,
    ) -> bool:
        ...

    def list_tools(
        self,
    ) -> list[str]:
        ...


class ToolExecutorInterface(Protocol):
    """Interface for a tool executor."""

    async def execute(
        self,
        tool: Any,
        arguments: dict[str, Any] | None = None,
    ) -> Any:
        ...


class ToolEngineInterface(Protocol):
    """Public interface for the tool engine."""

    def register(
        self,
        function: Callable[..., Any],
        name: str | None = None,
        description: str = "",
        **kwargs: Any,
    ) -> Any:
        ...

    async def execute(
        self,
        name: str,
        arguments: dict[str, Any] | None = None,
        **kwargs: Any,
    ) -> Any:
        ...

    def get_tool(
        self,
        name: str,
    ) -> Any:
        ...

    def list_tools(
        self,
    ) -> list[str]:
        ...