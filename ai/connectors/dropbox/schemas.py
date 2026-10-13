"""Dropbox operation metadata and argument validation."""

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.schemas import validate_connector_arguments
from ai.connectors.dropbox.models import DropboxOperation


def _object_schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def build_dropbox_operations():
    return (
        DropboxOperation(
            name="get_current_account",
            path="/2/users/get_current_account",
            description="Get the account associated with the access token.",
            schema=_object_schema(),
        ),
        DropboxOperation(
            name="list_folder",
            path="/2/files/list_folder",
            description="List entries in a Dropbox folder.",
            schema=_object_schema({
                "path": {"type": "string", "maxLength": 4096},
                "recursive": {"type": "boolean"},
                "limit": {"type": "integer", "minimum": 1, "maximum": 2000},
            }, ["path"]),
        ),
        DropboxOperation(
            name="get_metadata",
            path="/2/files/get_metadata",
            description="Get metadata for a Dropbox file or folder.",
            schema=_object_schema({
                "path": {"type": "string", "minLength": 1, "maxLength": 4096},
                "include_media_info": {"type": "boolean"},
                "include_deleted": {"type": "boolean"},
            }, ["path"]),
        ),
        DropboxOperation(
            name="search",
            path="/2/files/search_v2",
            description="Search Dropbox files by text.",
            schema=_object_schema({
                "query": {"type": "string", "minLength": 1, "maxLength": 1000},
                "max_results": {"type": "integer", "minimum": 1, "maximum": 100},
            }, ["query"]),
        ),
    )


def build_dropbox_metadata(config):
    operations = build_dropbox_operations()
    return ConnectorMetadata(
        name="dropbox",
        version=config.version,
        description=config.description,
        operations=tuple(operation.name for operation in operations),
        operation_schemas={
            operation.name: operation.schema for operation in operations
        },
        required_permissions=config.required_permissions,
    )


def validate_dropbox_arguments(metadata, operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")

    validate_connector_arguments(metadata, operation, arguments)
    result = dict(arguments)

    if "path" in result:
        path = result["path"]
        if not isinstance(path, str) or len(path) > 4096:
            raise ConnectorValidationError("path must be a valid Dropbox path")
        if path and not path.startswith("/"):
            raise ConnectorValidationError("path must start with '/' or be empty")
        if "\x00" in path:
            raise ConnectorValidationError("path contains an invalid character")

    if "query" in result:
        query = result["query"]
        if not isinstance(query, str) or not query.strip() or len(query) > 1000:
            raise ConnectorValidationError("query must contain 1 to 1000 characters")

    if "limit" in result:
        value = result["limit"]
        if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= 2000:
            raise ConnectorValidationError("limit must be an integer from 1 to 2000")

    if "max_results" in result:
        value = result["max_results"]
        if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= 100:
            raise ConnectorValidationError("max_results must be an integer from 1 to 100")

    for key in ("recursive", "include_media_info", "include_deleted"):
        if key in result and not isinstance(result[key], bool):
            raise ConnectorValidationError(f"{key} must be a boolean")

    return result
