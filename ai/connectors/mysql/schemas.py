"""MySQL operation schemas and validation."""

import re

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.mysql.models import MySQLOperation


_IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,63}$")


def _schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def build_mysql_operations():
    return (
        MySQLOperation(
            "list_tables",
            "List tables in the configured database.",
            _schema(),
        ),
        MySQLOperation(
            "describe_table",
            "Read column metadata for one table.",
            _schema({
                "table": {"type": "string", "minLength": 1, "maxLength": 64},
            }, ["table"]),
        ),
        MySQLOperation(
            "select_rows",
            "Run a bounded SELECT query with equality filters.",
            _schema({
                "table": {"type": "string", "minLength": 1, "maxLength": 64},
                "columns": {"type": "array", "items": {"type": "string"}, "maxItems": 50},
                "filters": {"type": "object"},
                "limit": {"type": "integer", "minimum": 1, "maximum": 100},
            }, ["table"]),
        ),
    )


def build_mysql_metadata(config):
    operations = build_mysql_operations()
    return ConnectorMetadata(
        name="mysql",
        version="1.0.0",
        description="Read-only MySQL connector",
        operations=tuple(op.name for op in operations),
        operation_schemas={op.name: op.schema for op in operations},
        required_permissions=config.required_permissions,
    )


def validate_mysql_arguments(metadata, operation, arguments, config):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")
    if operation not in metadata.operation_schemas:
        raise ConnectorValidationError("Unsupported MySQL operation")
    schema = metadata.operation_schemas[operation]
    if set(arguments) - set(schema["properties"]):
        raise ConnectorValidationError("Unknown MySQL argument")
    for name in schema["required"]:
        if name not in arguments:
            raise ConnectorValidationError(f"Missing required argument: {name}")

    result = dict(arguments)
    if operation == "describe_table":
        if not isinstance(result["table"], str) or not _IDENTIFIER.fullmatch(result["table"]):
            raise ConnectorValidationError("Invalid table identifier")
    elif operation == "select_rows":
        if not isinstance(result["table"], str) or not _IDENTIFIER.fullmatch(result["table"]):
            raise ConnectorValidationError("Invalid table identifier")
        columns = result.get("columns", ["*"])
        if (
            not isinstance(columns, list)
            or not columns
            or len(columns) > 50
            or any(
                not isinstance(c, str)
                or (c != "*" and not _IDENTIFIER.fullmatch(c))
                for c in columns
            )
            or ("*" in columns and columns != ["*"])
        ):
            raise ConnectorValidationError("Invalid columns")
        filters = result.get("filters", {})
        if not isinstance(filters, dict) or len(filters) > 50:
            raise ConnectorValidationError("Invalid filters")
        if any(not isinstance(k, str) or not _IDENTIFIER.fullmatch(k) for k in filters):
            raise ConnectorValidationError("Invalid filter column")
        for value in filters.values():
            if value is not None and not isinstance(value, (str, int, float, bool, bytes)):
                raise ConnectorValidationError("Unsupported filter value")
            if isinstance(value, str) and len(value) > 2000:
                raise ConnectorValidationError("Filter value is too long")
        limit = result.get("limit", min(50, config.max_rows))
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= config.max_rows:
            raise ConnectorValidationError("Invalid row limit")
        result.update(columns=columns, filters=filters, limit=limit)
    elif result:
        raise ConnectorValidationError("This operation accepts no arguments")
    return result
