"""Read-only GitHub connector."""

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.github.schemas import (
    build_github_metadata,
    build_github_operations,
    build_github_path,
    validate_github_arguments,
)


class GitHubConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {
            operation.name: operation for operation in build_github_operations()
        }
        super().__init__(build_github_metadata(config))

    async def execute(self, request, credentials):
        operation_name = request.operation
        try:
            self.validate_operation(operation_name)
            operation = self._operations[operation_name]
            arguments = validate_github_arguments(
                self.metadata, operation_name, dict(request.arguments or {})
            )
            token = credentials.get("token")
            if not isinstance(token, str) or not token.strip():
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=operation_name,
                    success=False,
                    error="GitHub token is not configured",
                )

            path = build_github_path(operation, arguments)
            query = {
                key: arguments[key]
                for key in ("type", "sort", "state", "per_page", "page", "ref")
                if key in arguments
            }
            data = self.client.request(path, token=token, query=query or None)
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
                error="GitHub request failed",
            )
