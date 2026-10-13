"""PostgreSQL schemas and strict argument validation."""
import re

from ai.connectors.exceptions import ConnectorValidationError
from .models import PostgreSQLOperation

_IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,62}$")


def _schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def build_postgres_operations(config):
    return (
        {
            "name": "list_tables",
            "schema": _schema(),
        },
        {
            "name": "describe_table",
            "schema": _schema({
                "table": {"type": "string", "minLength": 1, "maxLength": 63},
            }, ["table"]),
        },
        {
            "name": "select_rows",
            "schema": _schema({
                "table": {"type": "string", "minLength": 1, "maxLength": 63},
                "columns": {"type": "array", "items": {"type": "string"}, "maxItems": 50},
                "filters": {"type": "object"},
                "limit": {"type": "integer", "minimum": 1, "maximum": config.max_rows},
            }, ["table"]),
        },
    )


def validate_postgres_arguments(metadata, operation, arguments, config):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")
    if operation not in metadata.operation_schemas:
        raise ConnectorValidationError("Unsupported PostgreSQL operation")
    schema = metadata.operation_schemas[operation]
    if set(arguments) - set(schema["properties"]):
        raise ConnectorValidationError("Unknown PostgreSQL argument")
    for name in schema["required"]:
        if name not in arguments:
            raise ConnectorValidationError(f"Missing required argument: {name}")

    result = dict(arguments)
    if operation == "list_tables":
        if result:
            raise ConnectorValidationError("list_tables accepts no arguments")
    elif operation == "describe_table":
        if not isinstance(result["table"], str) or not _IDENTIFIER.fullmatch(result["table"]):
            raise ConnectorValidationError("Invalid table identifier")
    elif operation == "select_rows":
        if not isinstance(result["table"], str) or not _IDENTIFIER.fullmatch(result["table"]):
            raise ConnectorValidationError("Invalid table identifier")
        columns = result.get("columns", ["*"])
        if (
            not isinstance(columns, list) or not columns or len(columns) > 50
            or any(not isinstance(c, str) or (c != "*" and not _IDENTIFIER.fullmatch(c)) for c in columns)
            or ("*" in columns and columns != ["*"])
        ):
            raise ConnectorValidationError("Invalid columns")
        filters = result.get("filters", {})
        if not isinstance(filters, dict) or len(filters) > 50:
            raise ConnectorValidationError("Invalid filters")
        for key, value in filters.items():
            if not isinstance(key, str) or not _IDENTIFIER.fullmatch(key):
                raise ConnectorValidationError("Invalid filter column")
            if value is not None and (
                isinstance(value, (dict, list, tuple, set))
                or not isinstance(value, (str, int, float, bool, bytes))
            ):
                raise ConnectorValidationError("Unsupported filter value")
            if isinstance(value, str) and len(value) > 2000:
                raise ConnectorValidationError("Filter value is too long")
            if isinstance(value, float) and (value != value or abs(value) == float("inf")):
                raise ConnectorValidationError("Invalid numeric filter value")
        limit = result.get("limit", min(50, config.max_rows))
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= config.max_rows:
            raise ConnectorValidationError("Invalid row limit")
        result.update(columns=columns, filters=filters, limit=limit)
    return result
