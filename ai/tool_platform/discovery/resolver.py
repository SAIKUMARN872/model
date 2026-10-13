from __future__ import annotations

from typing import Any


class ToolResolver:
    """Resolves a registered tool by name and optional version."""

    def __init__(self, registry: Any) -> None:
        self.registry = registry

    def resolve(self, name: str, version: str | None = None) -> Any:
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Tool name must be a non-empty string")

        tool = self.registry.get(name.strip(), version=version)

        if not tool.enabled:
            raise ValueError(f"Tool is disabled: {tool.name}")

        return tool
