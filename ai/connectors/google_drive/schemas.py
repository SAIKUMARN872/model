"""Input schemas and validation for Google Drive operations."""
import re
from typing import Any, Mapping

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.schemas import validate_connector_arguments

FILE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,256}$")

COMMON_FIELDS = {
    "id": "id",
    "name": "name",
    "mimeType": "mimeType",
    "modifiedTime": "modifiedTime",
    "webViewLink": "webViewLink",
    "size": "size",
}

OPERATIONS = {
    "list_files": {
        "path": "/files",
        "description": "List accessible Drive files using optional filters.",
        "schema": {
            "type": "object",
            "properties": {
                "page_size": {"type": "integer", "minimum": 1, "maximum": 1000},
                "page_token": {"type": "string"},
                "query": {"type": "string"},
                "order_by": {"type": "string"},
                "include_shared_drives": {"type": "boolean"},
            },
            "additionalProperties": False,
        },
    },
    "search_files": {
        "path": "/files",
        "description": "Search accessible Drive files with a Drive query expression.",
        "schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "page_size": {"type": "integer", "minimum": 1, "maximum": 1000},
                "page_token": {"type": "string"},
                "order_by": {"type": "string"},
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
    "get_file": {
        "path": "/files/{file_id}",
        "description": "Get metadata for one accessible Drive file.",
        "schema": {
            "type": "object",
            "properties": {
                "file_id": {"type": "string"},
                "fields": {"type": "string"},
            },
            "required": ["file_id"],
            "additionalProperties": False,
        },
    },
}

def validate_arguments(
    metadata: ConnectorMetadata, operation: str, arguments: Mapping[str, Any]
) -> dict[str, Any]:
    if operation not in OPERATIONS:
        raise ConnectorValidationError(f"Unsupported Google Drive operation: {operation}")

    normalized = dict(arguments)
    if operation == "get_file":
        file_id = normalized.get("file_id")
        if not isinstance(file_id, str) or not FILE_ID_PATTERN.fullmatch(file_id):
            raise ConnectorValidationError("Invalid Google Drive file ID.")

    if operation in ("list_files", "search_files"):
        page_size = normalized.get("page_size", 100)
        if isinstance(page_size, bool) or not isinstance(page_size, int) or not 1 <= page_size <= 1000:
            raise ConnectorValidationError("page_size must be an integer from 1 to 1000.")

        query = normalized.get("query")
        if query is not None and (not isinstance(query, str) or len(query) > 4000):
            raise ConnectorValidationError("query must be a string of at most 4000 characters.")

        for key in ("page_token", "order_by"):
            value = normalized.get(key)
            if value is not None and not isinstance(value, str):
                raise ConnectorValidationError(f"{key} must be a string.")

    if operation == "get_file":
        fields = normalized.get("fields")
        if fields is not None and (not isinstance(fields, str) or len(fields) > 1000):
            raise ConnectorValidationError("fields must be a string of at most 1000 characters.")

    validate_connector_arguments(metadata, operation, normalized)
    return normalized
