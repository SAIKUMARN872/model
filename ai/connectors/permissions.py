"""Connector authorization using ModelNow's trusted permission context."""

from __future__ import annotations

from ai.tool_platform.permissions.policy import (
    PermissionContext,
    ToolPermissionError,
    authorize_tool,
)

from .exceptions import ConnectorPermissionError
from .models import ConnectorMetadata


def authorize_connector(
    metadata: ConnectorMetadata,
    context: PermissionContext | None,
) -> None:
    required = tuple(
        dict.fromkeys(
            (f"connector:{metadata.name}:execute",)
            + metadata.required_permissions
        )
    )
    try:
        authorize_tool(required, context)
    except (ToolPermissionError, TypeError, ValueError) as exc:
        raise ConnectorPermissionError(str(exc)) from exc
