"""Permission-checked execution of registered connectors."""

from __future__ import annotations

import inspect
from typing import Any

from ai.tool_platform.permissions.policy import PermissionContext

from .authentication import CredentialProvider
from .exceptions import (
    ConnectorError,
    ConnectorOperationError,
)
from .models import ConnectorRequest, ConnectorResult
from .permissions import authorize_connector
from .registry import ConnectorRegistry
from .schemas import validate_connector_arguments


class ConnectorExecutor:
    def __init__(
        self,
        registry: ConnectorRegistry,
        credential_provider: CredentialProvider | None = None,
    ) -> None:
        if not isinstance(registry, ConnectorRegistry):
            raise TypeError("registry must be a ConnectorRegistry.")
        self.registry = registry
        self.credential_provider = credential_provider

    async def execute(
        self,
        connector_name: str,
        operation: str,
        arguments: dict[str, Any] | None = None,
        *,
        context: PermissionContext | None = None,
    ) -> ConnectorResult:
        connector = self.registry.get(connector_name)
        metadata = connector.metadata

        try:
            authorize_connector(metadata, context)
            supplied = {} if arguments is None else arguments
            validated = validate_connector_arguments(
                metadata, operation, supplied
            )
            credentials = (
                self.credential_provider.get_credentials(connector_name)
                if self.credential_provider is not None
                else {}
            )
            request = ConnectorRequest(operation, validated)
            result = connector.execute(request, credentials)
            if inspect.isawaitable(result):
                result = await result

            if not isinstance(result, ConnectorResult):
                raise ConnectorOperationError(
                    "Connector returned an invalid result type."
                )
            if result.connector != connector_name or result.operation != operation:
                raise ConnectorOperationError(
                    "Connector result identity does not match the request."
                )
            return result
        except ConnectorError as exc:
            return ConnectorResult(
                connector=connector_name,
                operation=operation,
                success=False,
                error=str(exc),
            )
        except (TypeError, ValueError) as exc:
            return ConnectorResult(
                connector=connector_name,
                operation=operation,
                success=False,
                error=str(exc),
            )
