"""Adapters for registering connectors in ModelNow's Tool Platform."""

from __future__ import annotations

from typing import Any

from ai.tool_platform.permissions.policy import PermissionContext
from ai.tool_platform.registry import ToolRegistry, ToolSpec

from .executor import ConnectorExecutor
from .registry import ConnectorRegistry


def register_connector_tools(
    tool_registry: ToolRegistry,
    connector_registry: ConnectorRegistry,
    *,
    permission_context: PermissionContext,
    executor: ConnectorExecutor | None = None,
) -> list[ToolSpec]:
    """Register one Tool Platform tool per connector.

    The permission context is explicitly supplied by the trusted application
    layer, never by tool-call arguments.
    """
    if not isinstance(tool_registry, ToolRegistry):
        raise TypeError("tool_registry must be a ToolRegistry.")
    if not isinstance(connector_registry, ConnectorRegistry):
        raise TypeError("connector_registry must be a ConnectorRegistry.")
    if not isinstance(permission_context, PermissionContext):
        raise TypeError("A trusted PermissionContext is required.")

    connector_executor = executor or ConnectorExecutor(connector_registry)
    registered: list[ToolSpec] = []

    for connector in connector_registry.list_connectors():
        metadata = connector.metadata
        tool_name = f"connector.{metadata.name.replace('-', '_')}"

        async def handler(
            operation: str,
            arguments: dict[str, Any] | None = None,
            *,
            _name: str = metadata.name,
        ) -> dict[str, Any]:
            result = await connector_executor.execute(
                _name,
                operation,
                arguments,
                context=permission_context,
            )
            return result.to_dict()

        spec = ToolSpec(
            name=tool_name,
            description=metadata.description,
            handler=handler,
            version=metadata.version,
            input_schema={
                "type": "object",
                "properties": {
                    "operation": {
                        "type": "string",
                        "enum": list(metadata.operations),
                    },
                    "arguments": {"type": "object"},
                },
                "required": ["operation"],
                "additionalProperties": False,
            },
            required_permissions=(
                f"connector:{metadata.name}:execute",
            ) + metadata.required_permissions,
            tags=("connector", metadata.name),
        )
        registered.append(tool_registry.register(spec))

    return registered
