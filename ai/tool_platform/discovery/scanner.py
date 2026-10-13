from __future__ import annotations

from typing import Any


class ToolScanner:
    """Lists tools registered with the tool platform."""

    def __init__(self, registry: Any) -> None:
        self.registry = registry

    def scan(self, enabled_only: bool = True) -> list[Any]:
        return self.registry.list_tools(enabled_only=enabled_only)
