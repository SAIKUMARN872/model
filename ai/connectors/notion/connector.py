"""Read-only Notion API connector."""
from __future__ import annotations

from typing import Any, Mapping

from ai.connectors.connector import Connector
from ai.connectors.exceptions import (
    ConnectorAuthenticationError,
    ConnectorOperationError,
    ConnectorRequestError,
    ConnectorValidationError,
)
from ai.connectors.models import ConnectorMetadata, ConnectorRequest, ConnectorResult
from .client import NotionClient
from .config import NOTION_REQUIRED_PERMISSIONS
from .schemas import OPERATIONS, validate_arguments


class NotionConnector(Connector):
    def __init__(self, client: NotionClient | None = None) -> None:
        self.client = client or NotionClient()
        metadata = ConnectorMetadata(
            name="notion",
            version="1.0.0",
            description=(
                "Read-only Notion page search, page retrieval, data-source search, "
                "and data-source queries."
            ),
            operations=tuple(OPERATIONS),
            operation_schemas={
                name: spec["schema"] for name, spec in OPERATIONS.items()
            },
            required_permissions=NOTION_REQUIRED_PERMISSIONS,
        )
        super().__init__(metadata)

    async def execute(
        self,
        request: ConnectorRequest,
        credentials: Mapping[str, str],
    ) -> ConnectorResult:
        operation = request.operation
        try:
            args = validate_arguments(self.metadata, operation, request.arguments)
            token = credentials.get("access_token", "")
            if not token:
                raise ConnectorAuthenticationError(
                    "Notion access token is missing."
                )

            if operation in ("search_pages", "search_data_sources"):
                body: dict[str, Any] = {
                    "page_size": args.get("page_size", 50),
                }
                if args.get("query"):
                    body["query"] = args["query"]
                if args.get("start_cursor"):
                    body["start_cursor"] = args["start_cursor"]
                object_type = (
                    "page" if operation == "search_pages" else "data_source"
                )
                body["filter"] = {"property": "object", "value": object_type}
                if args.get("sort_direction"):
                    body["sort"] = {
                        "direction": args["sort_direction"],
                        "timestamp": "last_edited_time",
                    }
                data = self.client.request(
                    "/search",
                    access_token=token,
                    method="POST",
                    body=body,
                )

            elif operation == "get_page":
                data = self.client.request(
                    f"/pages/{args['page_id']}",
                    access_token=token,
                )

            elif operation == "get_data_source":
                data = self.client.request(
                    f"/data_sources/{args['data_source_id']}",
                    access_token=token,
                )

            elif operation == "query_data_source":
                body = {"page_size": args.get("page_size", 50)}
                if "filter" in args:
                    body["filter"] = args["filter"]
                if "sorts" in args:
                    body["sorts"] = args["sorts"]
                if args.get("start_cursor"):
                    body["start_cursor"] = args["start_cursor"]
                data = self.client.request(
                    f"/data_sources/{args['data_source_id']}/query",
                    access_token=token,
                    method="POST",
                    body=body,
                )

            else:
                raise ConnectorOperationError("Unsupported Notion operation.")

            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation,
                success=True,
                data=data,
            )
        except Exception as exc:
            if isinstance(
                exc,
                (
                    ConnectorAuthenticationError,
                    ConnectorOperationError,
                    ConnectorValidationError,
                    ValueError,
                ),
            ):
                error = str(exc)
            elif isinstance(exc, ConnectorRequestError):
                error = "Notion API request failed."
            else:
                error = "Notion connector execution failed."
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation,
                success=False,
                error=error,
            )
