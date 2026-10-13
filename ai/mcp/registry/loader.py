"""Load JSON tool metadata into the ModelNow MCP registry."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Mapping

from ai.mcp.registry.registry import MCPRegistry
from ai.mcp.constants import MAX_MESSAGE_SIZE
from ai.tool_platform.registry import ToolNotFoundError, ToolSpec, ToolRegistry

from .utils import validate_registry_document


class MCPRegistryLoadError(ValueError):
    """Raised when an MCP registry file cannot be loaded safely."""


class MCPRegistryLoader:
    """Load tool metadata using handlers supplied by trusted application code.

    JSON files never specify import paths or executable code. Each definition's
    name must resolve to a callable in the supplied handler mapping.
    """

    def __init__(
        self,
        registry: MCPRegistry | ToolRegistry | None = None,
        *,
        max_bytes: int = MAX_MESSAGE_SIZE,
    ) -> None:
        if registry is None:
            registry = MCPRegistry()
        elif isinstance(registry, ToolRegistry):
            registry = MCPRegistry(registry)
        elif not isinstance(registry, MCPRegistry):
            raise TypeError("registry must be an MCPRegistry or ToolRegistry.")

        if isinstance(max_bytes, bool) or not isinstance(max_bytes, int) or max_bytes < 1:
            raise ValueError("max_bytes must be a positive integer.")

        self.registry = registry
        self.max_bytes = max_bytes

    def load_data(
        self,
        document: Any,
        handlers: Mapping[str, Any],
    ) -> MCPRegistry:
        """Validate all definitions before registering any of them."""
        try:
            definitions = validate_registry_document(document)
            if not isinstance(handlers, Mapping):
                raise ValueError("handlers must be a mapping of tool names to callables.")

            specs = []
            for definition in definitions:
                name = definition["name"]
                handler = handlers.get(name)
                if not callable(handler):
                    raise ValueError(
                        f"No callable handler was supplied for tool '{name}'."
                    )

                specs.append(
                    ToolSpec(
                        name=name,
                        description=definition["description"],
                        handler=handler,
                        version=definition["version"],
                        input_schema=definition["input_schema"],
                        required_permissions=definition["required_permissions"],
                        tags=definition["tags"],
                        enabled=definition["enabled"],
                    )
                )

            existing = {
                (tool.name, tool.version)
                for tool in self.registry.list_tools(enabled_only=False)
            }
            incoming = [(tool.name, tool.version) for tool in specs]

            collisions = sorted(set(existing).intersection(incoming))
            if collisions:
                name, version = collisions[0]
                raise ValueError(
                    f"Tool '{name}' version '{version}' is already registered."
                )

            # Register only after every definition and collision is checked.
            for spec in specs:
                self.registry.register(spec)

            return self.registry

        except (TypeError, ValueError, KeyError) as exc:
            raise MCPRegistryLoadError(str(exc)) from exc

    def load_file(
        self,
        path: str | Path,
        handlers: Mapping[str, Any],
    ) -> MCPRegistry:
        """Read and load a UTF-8 JSON registry file."""
        try:
            registry_path = Path(path)
            with registry_path.open("rb") as file:
                raw = file.read(self.max_bytes + 1)

            if len(raw) > self.max_bytes:
                raise MCPRegistryLoadError(
                    f"Registry file exceeds the {self.max_bytes}-byte limit."
                )

            try:
                document = json.loads(raw.decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise MCPRegistryLoadError(
                    f"Registry file is not valid UTF-8 JSON: {exc}"
                ) from exc

            return self.load_data(document, handlers)

        except MCPRegistryLoadError:
            raise
        except OSError as exc:
            raise MCPRegistryLoadError(
                f"Unable to read registry file '{path}': {exc}"
            ) from exc

    def get(self, name: str, version: str | None = None) -> ToolSpec:
        try:
            return self.registry.get(name, version)
        except (KeyError, ValueError) as exc:
            raise ToolNotFoundError(str(exc)) from exc

