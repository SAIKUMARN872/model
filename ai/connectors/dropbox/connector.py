"""Dropbox connector using fixed, read-only API v2 endpoints."""

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorResult
from ai.connectors.dropbox.schemas import (
    build_dropbox_metadata,
    build_dropbox_operations,
    validate_dropbox_arguments,
)


class DropboxConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {
            operation.name: operation for operation in build_dropbox_operations()
        }
        super().__init__(build_dropbox_metadata(config))

    async def execute(self, request, credentials):
        operation_name = request.operation
        try:
            self.validate_operation(operation_name)
            operation = self._operations[operation_name]
            arguments = validate_dropbox_arguments(
                self.metadata, operation_name, dict(request.arguments or {})
            )
            token = credentials.get("access_token")
            if not isinstance(token, str) or not token.strip():
                return ConnectorResult(
                    connector=self.metadata.name,
                    operation=operation_name,
                    success=False,
                    error="Dropbox access token is not configured",
                )

            body = {}
            if operation_name == "list_folder":
                body = {
                    "path": arguments["path"],
                    "recursive": arguments.get("recursive", False),
                    "limit": arguments.get("limit", 100),
                }
            elif operation_name == "get_metadata":
                body = {"path": arguments["path"]}
                for key in ("include_media_info", "include_deleted"):
                    if key in arguments:
                        body[key] = arguments[key]
            elif operation_name == "search":
                body = {
                    "query": arguments["query"],
                    "options": {
                        "max_results": arguments.get("max_results", 20)
                    },
                }

            data = self.client.request(
                operation.path,
                token=token,
                body=body,
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
                error="Dropbox request failed",
            )
