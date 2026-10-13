"""Read-only Jira Cloud connector."""

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.jira.schemas import (
    build_jira_metadata,
    build_jira_operations,
    build_jira_path,
    validate_jira_arguments,
)


class JiraConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {
            op.name: op for op in build_jira_operations()
        }
        super().__init__(build_jira_metadata(config))

    async def execute(self, request, credentials):
        name = request.operation
        try:
            self.validate_operation(name)
            operation = self._operations[name]
            args = validate_jira_arguments(
                self.metadata, name, dict(request.arguments or {})
            )
            token = credentials.get("token") if isinstance(credentials, dict) else None
            if not isinstance(token, str) or not token.strip():
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=name,
                    success=False,
                    error="Jira API token is not configured",
                )

            path = build_jira_path(operation, args)
            query = {
                key: args[key]
                for key in ("jql", "start_at", "max_results", "fields", "query")
                if key in args
            }
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
                error="Jira request failed",
            )
