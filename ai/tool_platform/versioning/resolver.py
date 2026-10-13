"""Resolve registered tool versions according to explicit constraints."""

from __future__ import annotations

from ..registry.registry import ToolNotFoundError, ToolRegistry
from .compatibility import is_compatible
from .versioning import parse_version


class ToolVersionResolver:
    """Resolve exact or latest compatible registered tool versions."""

    def __init__(self, registry: ToolRegistry) -> None:
        if not isinstance(registry, ToolRegistry):
            raise TypeError("registry must be a ToolRegistry.")
        self.registry = registry

    def resolve(
        self,
        name: str,
        version: str | None = None,
        *,
        compatible_with: str | None = None,
        enabled_only: bool = True,
    ):
        """Resolve a tool by exact version or highest eligible version.

        If version is supplied, it must be registered exactly.
        Otherwise, the highest registered version satisfying the
        optional compatibility constraint is returned.
        """
        if version is not None:
            parse_version(version)

        if compatible_with is not None:
            parse_version(compatible_with)

        if not isinstance(enabled_only, bool):
            raise TypeError("enabled_only must be a boolean.")

        tools = [
            tool
            for tool in self.registry.list_tools(enabled_only=enabled_only)
            if tool.name == name
        ]

        if version is not None:
            tools = [tool for tool in tools if tool.version == version]

        if compatible_with is not None:
            tools = [
                tool for tool in tools
                if is_compatible(tool.version, compatible_with)
            ]

        if not tools:
            constraints = []
            if version is not None:
                constraints.append(f"version '{version}'")
            if compatible_with is not None:
                constraints.append(
                    f"compatible with '{compatible_with}'"
                )
            if enabled_only:
                constraints.append("enabled")
            detail = " and ".join(constraints) or "matching constraints"
            raise ToolNotFoundError(
                f"No registered version of tool '{name}' satisfies {detail}."
            )

        return max(tools, key=lambda tool: parse_version(tool.version))
