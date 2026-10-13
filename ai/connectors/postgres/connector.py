"""Read-only PostgreSQL connector."""
from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorMetadata, ConnectorResult
from .schemas import build_postgres_operations, validate_postgres_arguments


class PostgreSQLConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        operations = build_postgres_operations(config)
        super().__init__(
            ConnectorMetadata(
                name="postgres",
                version="1.0.0",
                description="Read-only PostgreSQL table metadata and bounded row queries.",
                operations=tuple(op["name"] for op in operations),
                operation_schemas={op["name"]: op["schema"] for op in operations},
                required_permissions=config.required_permissions,
            )
        )

    async def execute(self, request, credentials):
        operation = request.operation
        try:
            self.validate_operation(operation)
            args = validate_postgres_arguments(
                self.metadata, operation, dict(request.arguments or {}), self.config
            )
            if operation == "list_tables":
                data = self.client.list_tables()
            elif operation == "describe_table":
                data = self.client.describe_table(args["table"])
            elif operation == "select_rows":
                data = self.client.select_rows(
                    args["table"], args["columns"], args["filters"], args["limit"]
                )
            else:
                raise ConnectorValidationError("Unsupported PostgreSQL operation")
            return ConnectorResult(
                connector=self.metadata.name, operation=operation,
                success=True, data=data,
            )
        except (ConnectorError, ConnectorValidationError, ValueError) as exc:
            return ConnectorResult(
                connector=self.metadata.name, operation=operation,
                success=False, error=str(exc),
            )
        except Exception:
            return ConnectorResult(
                connector=self.metadata.name, operation=operation,
                success=False, error="PostgreSQL request failed",
            )
