"""Thread-safe registry for ModelNow tool specifications."""

from __future__ import annotations

from threading import RLock

from .models import ToolSpec
from .schemas import validate_input_schema, validate_tool_name, validate_version


class ToolNotFoundError(KeyError):
    """Raised when a requested tool/version is not registered."""


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[tuple[str, str], ToolSpec] = {}
        self._lock = RLock()

    def register(self, tool: ToolSpec) -> ToolSpec:
        if not isinstance(tool, ToolSpec):
            raise TypeError("tool must be a ToolSpec.")
        validate_tool_name(tool.name)
        validate_version(tool.version)
        validate_input_schema(tool.input_schema)

        key = (tool.name, tool.version)
        with self._lock:
            if key in self._tools:
                raise ValueError(
                    f"Tool '{tool.name}' version '{tool.version}' is already registered."
                )
            self._tools[key] = tool
        return tool

    def get(self, name: str, version: str | None = None) -> ToolSpec:
        validate_tool_name(name)
        if version is not None:
            validate_version(version)
        with self._lock:
            if version is not None:
                tool = self._tools.get((name, version))
                if tool is None:
                    raise ToolNotFoundError(
                        f"Tool '{name}' version '{version}' is not registered."
                    )
                return tool
            matches = [
                tool for (tool_name, _), tool in self._tools.items()
                if tool_name == name
            ]
            if not matches:
                raise ToolNotFoundError(f"Tool '{name}' is not registered.")
            return max(matches, key=lambda tool: tuple(
                int(part) for part in tool.version.split(".")
            ))

    def list_tools(self, *, enabled_only: bool = False) -> list[ToolSpec]:
        with self._lock:
            tools = list(self._tools.values())
        if enabled_only:
            tools = [tool for tool in tools if tool.enabled]
        return sorted(tools, key=lambda tool: (tool.name, tuple(
            int(part) for part in tool.version.split(".")
        )))

    def unregister(self, name: str, version: str) -> bool:
        validate_tool_name(name)
        validate_version(version)
        with self._lock:
            return self._tools.pop((name, version), None) is not None

    def __len__(self) -> int:
        with self._lock:
            return len(self._tools)
