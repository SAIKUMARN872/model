"""Registry for discovering and managing agent tools."""

from __future__ import annotations

from threading import RLock

from .adapter import ToolDefinition, ToolAdapter


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, ToolDefinition] = {}
        self._lock = RLock()

    def register(self, tool: ToolDefinition) -> ToolDefinition:
        if not isinstance(tool, ToolDefinition):
            raise TypeError("tool must be a ToolDefinition.")

        with self._lock:
            if tool.name in self._tools:
                raise ValueError(f"Tool '{tool.name}' is already registered.")
            self._tools[tool.name] = tool
        return tool

    def register_function(
        self,
        name: str,
        function,
        description: str | None = None,
    ) -> ToolDefinition:
        return self.register(ToolAdapter.adapt(name, function, description))

    def get(self, name: str) -> ToolDefinition:
        with self._lock:
            try:
                return self._tools[name]
            except KeyError as exc:
                raise KeyError(f"Tool '{name}' is not registered.") from exc

    def list_tools(self) -> list[ToolDefinition]:
        with self._lock:
            return list(self._tools.values())

    def unregister(self, name: str) -> bool:
        with self._lock:
            return self._tools.pop(name, None) is not None

    def __len__(self) -> int:
        with self._lock:
            return len(self._tools)
