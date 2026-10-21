"""Read-only Microsoft Graph Outlook connector."""

from urllib.parse import quote

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.microsoft_outlook.schemas import (
    build_outlook_metadata,
    build_outlook_operations,
    build_outlook_query,
    validate_outlook_arguments,
)


class MicrosoftOutlookConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {op.name: op for op in build_outlook_operations()}
        super().__init__(build_outlook_metadata(config))

    async def execute(self, request, credentials):
        name = request.operation
        try:
            self.validate_operation(name)
            operation = self._operations[name]
            args = validate_outlook_arguments(
                self.metadata, name, dict(request.arguments or {})
            )
            token = credentials.get("token") if isinstance(credentials, dict) else None
            if not isinstance(token, str) or not token.strip():
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=name,
                    success=False,
                    error="Microsoft Graph access token is not configured",
                )

            path = operation.path
            if "{message_id}" in path:
                path = path.replace(
                    "{message_id}", quote(args["message_id"], safe="")
                )
            query = build_outlook_query(name, args)
            data = self.client.request(
                operation.method, path, token=token, query=query or None
            )
            return ConnectorResult(
                connector=self.metadata.name,
                operation=name,
                success=True,
                data=data,
            )
        except (ConnectorError, ConnectorValidationError) as exc:
            return ConnectorResult(
                connector=self.metadata.name,
                operation=name,
                success=False,
                error=str(exc),
            )
        except Exception:
            return ConnectorResult(
                connector=self.metadata.name,
                operation=name,
                success=False,
                error="Microsoft Graph request failed",
            )
