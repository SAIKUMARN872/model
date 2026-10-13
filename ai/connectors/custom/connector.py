"""Safe execution of preconfigured custom API operations."""

from __future__ import annotations

import asyncio
from typing import Mapping

from ai.connectors.connector import Connector
from ai.connectors.exceptions import (
    ConnectorAuthenticationError,
    ConnectorOperationError,
    ConnectorRequestError,
)
from ai.connectors.models import ConnectorRequest, ConnectorResult

from .client import create_custom_http_client
from .config import CustomConnectorConfig
from .schemas import build_custom_metadata, validate_custom_arguments


class CustomConnector(Connector):
    """Execute configured operations without accepting runtime URLs or headers."""

    def __init__(self, config: CustomConnectorConfig, *, client=None) -> None:
        self.config = config
        self.client = client or create_custom_http_client(config)
        super().__init__(build_custom_metadata(config))

    async def execute(
        self,
        request: ConnectorRequest,
        credentials: Mapping[str, str],
    ) -> ConnectorResult:
        try:
            if not isinstance(request, ConnectorRequest):
                raise TypeError("request must be ConnectorRequest.")
            self.validate_operation(request.operation)
            operation = self.config.operation_map[request.operation]
            arguments = validate_custom_arguments(
                self.config, request.operation, request.arguments
            )

            headers: dict[str, str] = {}
            key = self.config.credential_key
            if key is not None:
                if not isinstance(credentials, Mapping):
                    raise ConnectorAuthenticationError("Credentials are unavailable.")
                secret = credentials.get(key)
                if not isinstance(secret, str) or not secret:
                    raise ConnectorAuthenticationError(
                        "Required custom connector credential is missing."
                    )
                if any(c in secret for c in "\r\n"):
                    raise ConnectorAuthenticationError("Invalid credential value.")
                headers[self.config.auth_header] = self.config.auth_prefix + secret

            # Runtime arguments never control the URL, method, or HTTP headers.
            is_read = operation.method in {"GET", "DELETE"}
            data = await asyncio.to_thread(
                self.client.request,
                operation.method,
                operation.path,
                query=arguments if is_read else None,
                json_body=None if is_read else arguments,
                headers=headers,
            )
            return ConnectorResult(
                connector=self.metadata.name,
                operation=request.operation,
                success=True,
                data=data,
            )
        except Exception as exc:
            # Do not include credentials or raw provider exception details in results.
            from ai.connectors.exceptions import ConnectorError
            if isinstance(exc, ConnectorError):
                message = str(exc)
                if isinstance(exc, ConnectorAuthenticationError):
                    message = "Custom connector authentication failed."
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=getattr(request, "operation", ""),
                    success=False,
                    error=message,
                )
            if isinstance(exc, (TypeError, ValueError)):
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=getattr(request, "operation", ""),
                    success=False,
                    error="Invalid custom connector request.",
                )
            return ConnectorResult(
                connector=self.metadata.name,
                operation=getattr(request, "operation", ""),
                success=False,
                error="Custom connector execution failed.",
            )
