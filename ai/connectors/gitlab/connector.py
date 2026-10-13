"""Read-only GitLab connector."""

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.gitlab.schemas import (
    build_gitlab_metadata,
    build_gitlab_operations,
    validate_gitlab_arguments,
)


class GitLabConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {
            operation.name: operation for operation in build_gitlab_operations()
        }
        super().__init__(build_gitlab_metadata(config))

    async def execute(self, request, credentials):
        operation_name = request.operation
        try:
            self.validate_operation(operation_name)
            operation = self._operations[operation_name]
            arguments = validate_gitlab_arguments(
                self.metadata, operation_name, dict(request.arguments or {})
            )
            token = credentials.get("token")
            if not isinstance(token, str) or not token.strip():
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=operation_name,
                    success=False,
                    error="GitLab token is not configured",
                )

            path = operation.path_template
            if "{project_id}" in path:
                path = path.replace("{project_id}", arguments["project_id"])

            query = {
                key: arguments[key]
                for key in (
                    "membership", "owned", "order_by", "sort",
                    "state", "per_page", "page"
                )
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
                error="GitLab request failed",
            )
