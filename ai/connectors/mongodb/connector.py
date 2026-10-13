"""Read-only MongoDB connector implementation."""

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.mongodb.schemas import (
    build_mongodb_metadata,
    build_mongodb_operations,
    validate_mongodb_arguments,
)


class MongoDBConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {op.name: op for op in build_mongodb_operations()}
        super().__init__(build_mongodb_metadata(config))

    async def execute(self, request, credentials):
        operation = request.operation
        try:
            self.validate_operation(operation)
            args = validate_mongodb_arguments(
                self.metadata, operation, dict(request.arguments or {}), self.config
            )
            uri = credentials.get("uri") if isinstance(credentials, dict) else None
            if not isinstance(uri, str) or not uri.strip():
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=operation,
                    success=False,
                    error="MongoDB URI credential is not configured",
                )

            # Clients are constructed from the credential at registration time;
            # do not accept an arbitrary URI supplied in operation arguments.
            if getattr(self.client, "_uri", uri) != uri:
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=operation,
                    success=False,
                    error="MongoDB credential does not match configured client",
                )

            if operation == "list_databases":
                data = self.client.list_databases()
            elif operation == "list_collections":
                data = self.client.list_collections()
            elif operation == "find_documents":
                data = self.client.find_documents(
                    args["collection"],
                    args["filter"],
                    args["limit"],
                    args.get("projection"),
                )
            else:
                raise ConnectorValidationError("Unsupported MongoDB operation")

            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation,
                success=True,
                data=data,
            )
        except (ConnectorError, ConnectorValidationError) as exc:
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
                error="MongoDB request failed",
            )
