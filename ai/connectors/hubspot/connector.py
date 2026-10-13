"""Read-only HubSpot CRM connector."""

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.hubspot.schemas import (
    build_hubspot_metadata,
    build_hubspot_operations,
    build_hubspot_path,
    validate_hubspot_arguments,
)


class HubSpotConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {
            operation.name: operation for operation in build_hubspot_operations()
        }
        super().__init__(build_hubspot_metadata(config))

    async def execute(self, request, credentials):
        operation_name = request.operation
        try:
            self.validate_operation(operation_name)
            operation = self._operations[operation_name]
            arguments = validate_hubspot_arguments(
                self.metadata, operation_name, dict(request.arguments or {})
            )

            token = credentials.get("token") if isinstance(credentials, dict) else None
            if not isinstance(token, str) or not token.strip():
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=operation_name,
                    success=False,
                    error="HubSpot access token is not configured",
                )

            path = build_hubspot_path(operation, arguments)
            if operation_name == "search_contacts":
                body = {
                    key: arguments[key]
                    for key in ("query", "limit", "after", "properties")
                    if key in arguments
                }
                data = self.client.request(
                    operation.method, path, token=token, json_body=body
                )
            else:
                query = {
                    key: arguments[key]
                    for key in ("limit", "after", "properties", "archived")
                    if key in arguments
                }
                data = self.client.request(
                    operation.method, path, token=token, query=query or None
                )

            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation_name,
                success=True,
                data=data,
            )
        except (ConnectorError, ConnectorValidationError) as exc:
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation_name,
                success=False,
                error=str(exc),
            )
        except Exception:
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation_name,
                success=False,
                error="HubSpot request failed",
            )
