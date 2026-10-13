"""Read-only Linear connector."""

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.linear.schemas import (
    build_linear_metadata,
    build_linear_operations,
    build_linear_variables,
    validate_linear_arguments,
)


class LinearConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {
            op.name: op for op in build_linear_operations()
        }
        super().__init__(build_linear_metadata(config))

    async def execute(self, request, credentials):
        name = request.operation
        try:
            self.validate_operation(name)
            args = validate_linear_arguments(
                self.metadata, name, dict(request.arguments or {})
            )
            token = credentials.get("token") if isinstance(credentials, dict) else None
            if not isinstance(token, str) or not token.strip():
                return ConnectorResult(
                    connector="linear",
                    operation=name,
                    success=False,
                    error="Linear API key is not configured",
                )

            operation = self._operations[name]
            variables = build_linear_variables(name, args)
            payload = self.client.execute(
                operation.query, variables, token=token
            )

            if not isinstance(payload, dict):
                raise ConnectorValidationError("Linear returned an invalid response")
            if payload.get("errors"):
                return ConnectorResult(
                    connector="linear",
                    operation=name,
                    success=False,
                    error="Linear GraphQL operation failed",
                )

            return ConnectorResult(
                connector="linear",
                operation=name,
                success=True,
                data=payload.get("data"),
            )
        except (ConnectorError, ConnectorValidationError) as exc:
            return ConnectorResult(
                connector="linear",
                operation=name,
                success=False,
                error=str(exc),
            )
        except Exception:
            return ConnectorResult(
                connector="linear",
                operation=name,
                success=False,
                error="Linear request failed",
            )
