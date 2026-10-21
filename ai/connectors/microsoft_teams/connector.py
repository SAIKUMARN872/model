"""Read-only Microsoft Teams connector."""

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.microsoft_teams.schemas import (
    build_teams_metadata,
    build_teams_operations,
    build_teams_path,
    validate_teams_arguments,
)


class MicrosoftTeamsConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {op.name: op for op in build_teams_operations()}
        super().__init__(build_teams_metadata(config))

    async def execute(self, request, credentials):
        name = request.operation
        try:
            self.validate_operation(name)
            operation = self._operations[name]
            args = validate_teams_arguments(
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

            path = build_teams_path(operation, args)
            query = {"$top": args["top"]} if "top" in args else None
            data = self.client.request(
                operation.method, path, token=token, query=query
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
