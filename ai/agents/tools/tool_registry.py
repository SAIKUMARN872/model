"""
Tool registry for the AI tools system.
"""

from __future__ import annotations

from threading import RLock
from typing import Any, Callable

from .adapter import (
    ToolAdapter,
    ToolDefinition,
    adapt_tool,
)


class ToolRegistry:
    """
    Thread-safe registry of AI tools.
    """

    def __init__(self) -> None:

        self._tools: dict[
            str,
            ToolAdapter,
        ] = {}

        self._lock = RLock()

    def register(
        self,
        tool: ToolAdapter,
        overwrite: bool = False,
    ) -> ToolAdapter:
        """
        Register a ToolAdapter.
        """

        if not isinstance(
            tool,
            ToolAdapter,
        ):

            raise TypeError(
                "tool must be a ToolAdapter"
            )

        with self._lock:

            if (
                tool.name in self._tools
                and not overwrite
            ):

                raise ValueError(
                    f"Tool already registered: "
                    f"{tool.name}"
                )

            self._tools[
                tool.name
            ] = tool

        return tool

    def register_function(
        self,
        function: Callable[..., Any],
        name: str | None = None,
        description: str | None = None,
        category: str = "general",
        version: str = "1.0.0",
        metadata: dict[str, Any] | None = None,
        overwrite: bool = False,
    ) -> ToolAdapter:
        """
        Register a Python function directly.
        """

        tool = adapt_tool(
            function=function,
            name=name,
            description=description,
            category=category,
            version=version,
            metadata=metadata,
        )

        return self.register(
            tool,
            overwrite=overwrite,
        )

    def get(
        self,
        name: str,
    ) -> ToolAdapter | None:

        with self._lock:

            return self._tools.get(
                name
            )

    def require(
        self,
        name: str,
    ) -> ToolAdapter:

        tool = self.get(
            name
        )

        if tool is None:

            raise KeyError(
                f"Tool not found: {name}"
            )

        return tool

    def remove(
        self,
        name: str,
    ) -> bool:

        with self._lock:

            if name not in self._tools:
                return False

            del self._tools[
                name
            ]

            return True

    def has(
        self,
        name: str,
    ) -> bool:

        with self._lock:

            return name in self._tools

    def names(
        self,
    ) -> list[str]:

        with self._lock:

            return sorted(
                self._tools.keys()
            )

    def all(
        self,
    ) -> list[ToolAdapter]:

        with self._lock:

            return list(
                self._tools.values()
            )

    def definitions(
        self,
    ) -> list[ToolDefinition]:

        with self._lock:

            return [
                tool.definition()
                for tool
                in self._tools.values()
            ]

    def schemas(
        self,
    ) -> list[dict[str, Any]]:

        with self._lock:

            return [
                tool.schema()
                for tool
                in self._tools.values()
            ]

    def by_category(
        self,
        category: str,
    ) -> list[ToolAdapter]:

        with self._lock:

            return [
                tool
                for tool
                in self._tools.values()
                if tool.category == category
            ]

    def clear(self) -> None:

        with self._lock:
            self._tools.clear()

    def __len__(self) -> int:

        with self._lock:
            return len(
                self._tools
            )

    def __contains__(
        self,
        name: str,
    ) -> bool:

        return self.has(name)