"""Read-only Gmail connector."""

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.gmail.schemas import (
    build_gmail_metadata,
    build_gmail_operations,
    validate_gmail_arguments,
)


class GmailConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {
            item.name: item for item in build_gmail_operations()
        }
        super().__init__(build_gmail_metadata(config))

    async def execute(self, request, credentials):
        operation_name = request.operation
        try:
            self.validate_operation(operation_name)
            operation = self._operations[operation_name]
            arguments = validate_gmail_arguments(
                self.metadata, operation_name, dict(request.arguments or {})
            )

            access_token = credentials.get("access_token")
            if not isinstance(access_token, str) or not access_token.strip():
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=operation_name,
                    success=False,
                    error="Gmail OAuth access token is not configured",
                )

            path = operation.path_template
            if "{message_id}" in path:
                path = path.replace("{message_id}", arguments["message_id"])

            query = {
                key: arguments[key]
                for key in ("maxResults", "pageToken", "q", "includeSpamTrash", "format")
                if key in arguments
            }

            data = self.client.request(
                path, access_token=access_token, query=query or None
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
                error="Gmail request failed",
            )
