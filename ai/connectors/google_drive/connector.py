"""Read-only Google Drive v3 connector."""
from typing import Any, Mapping

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorAuthenticationError, ConnectorOperationError
from ai.connectors.models import ConnectorMetadata, ConnectorRequest, ConnectorResult
from ai.connectors.google_drive.client import GoogleDriveClient
from ai.connectors.google_drive.config import (
    GOOGLE_DRIVE_REQUIRED_PERMISSIONS,
)
from ai.connectors.google_drive.schemas import OPERATIONS, validate_arguments


class GoogleDriveConnector(Connector):
    def __init__(self, client: GoogleDriveClient | None = None) -> None:
        self.client = client or GoogleDriveClient()
        metadata = ConnectorMetadata(
            name="google_drive",
            version="1.0.0",
            description="Read-only Google Drive file listing, search, and metadata.",
            operations=tuple(OPERATIONS.keys()),
            operation_schemas={
                name: operation["schema"] for name, operation in OPERATIONS.items()
            },
            required_permissions=GOOGLE_DRIVE_REQUIRED_PERMISSIONS,
        )
        super().__init__(metadata)

    async def execute(
        self, request: ConnectorRequest, credentials: Mapping[str, str]
    ) -> ConnectorResult:
        operation = request.operation
        try:
            args = validate_arguments(self.metadata, operation, request.arguments)
            token = credentials.get("access_token", "")
            if not token:
                raise ConnectorAuthenticationError(
                    "Google Drive access token is missing."
                )

            if operation in ("list_files", "search_files"):
                query_params: dict[str, Any] = {
                    "pageSize": args.get("page_size", 100),
                    "fields": "nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,size)",
                    "supportsAllDrives": True,
                    "includeItemsFromAllDrives": True,
                }
                if args.get("page_token"):
                    query_params["pageToken"] = args["page_token"]
                if args.get("order_by"):
                    query_params["orderBy"] = args["order_by"]

                drive_query = args.get("query", "")
                if operation == "search_files" and not drive_query.strip():
                    raise ValueError("Search query cannot be empty.")
                if drive_query:
                    query_params["q"] = drive_query

                data = self.client.request(
                    "/files", access_token=token, query=query_params
                )
            elif operation == "get_file":
                file_id = args["file_id"]
                fields = args.get(
                    "fields",
                    "id,name,mimeType,modifiedTime,webViewLink,size,parents",
                )
                data = self.client.request(
                    f"/files/{file_id}",
                    access_token=token,
                    query={"fields": fields, "supportsAllDrives": True},
                )
            else:
                raise ConnectorOperationError("Unsupported Google Drive operation.")

            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation,
                success=True,
                data=data,
            )
        except Exception as exc:
            # Do not include credentials or raw transport details in the result.
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation,
                success=False,
                error=str(exc) if isinstance(
                    exc, (ValueError, ConnectorAuthenticationError, ConnectorOperationError)
                ) else "Google Drive request failed.",
            )
