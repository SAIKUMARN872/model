"""Read-only MySQL connector."""

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.mysql.schemas import (
    build_mysql_metadata,
    build_mysql_operations,
    validate_mysql_arguments,
)


class MySQLConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {op.name: op for op in build_mysql_operations()}
        super().__init__(build_mysql_metadata(config))

    async def execute(self, request, credentials):
        operation = request.operation
        try:
            self.validate_operation(operation)
            args = validate_mysql_arguments(
                self.metadata, operation, dict(request.arguments or {}), self.config
            )
            if operation == "list_tables":
                data = self.client.list_tables()
            elif operation == "describe_table":
                data = self.client.describe_table(args["table"])
            elif operation == "select_rows":
                data = self.client.select_rows(
                    args["table"],
                    args["columns"],
                    args["filters"],
                    args["limit"],
                )
            else:
                raise ConnectorValidationError("Unsupported MySQL operation")
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation,
                success=True,
                data=data,
            )
        except (ConnectorError, ConnectorValidationError, ValueError) as exc:
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation,
                success=False,
                error=str(exc),
            )
        except Exception:
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation,
                success=False,
                error="MySQL request failed",
            )
