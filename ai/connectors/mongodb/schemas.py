"""MongoDB operation schemas and strict input validation."""

import re

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.mongodb.models import MongoDBOperation


_NAME = re.compile(r"^[A-Za-z0-9_-]{1,120}$")
_FIELD = re.compile(r"^[A-Za-z_][A-Za-z0-9_.-]{0,119}$")
_ALLOWED_FILTER_OPERATORS = {
    "$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$in", "$nin",
    "$exists", "$and", "$or",
}


def _schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def build_mongodb_operations():
    return (
        MongoDBOperation(
            "list_databases",
            "List databases visible to the configured MongoDB identity.",
            _schema(),
        ),
        MongoDBOperation(
            "list_collections",
            "List collections in the configured database.",
            _schema(),
        ),
        MongoDBOperation(
            "find_documents",
            "Find documents using a bounded, validated filter.",
            _schema({
                "collection": {"type": "string", "minLength": 1, "maxLength": 120},
                "filter": {"type": "object"},
                "limit": {"type": "integer", "minimum": 1, "maximum": 100},
                "projection": {"type": "object"},
            }, ["collection"]),
        ),
    )


def build_mongodb_metadata(config):
    operations = build_mongodb_operations()
    return ConnectorMetadata(
        name="mongodb",
        version="1.0.0",
        description="Read-only MongoDB connector",
        operations=tuple(op.name for op in operations),
        operation_schemas={op.name: op.schema for op in operations},
        required_permissions=config.required_permissions,
    )


def _validate_filter(value, *, depth=0):
    if depth > 5:
        raise ConnectorValidationError("Filter nesting is too deep")
    if not isinstance(value, dict):
        raise ConnectorValidationError("Filter values must be objects")

    for key, item in value.items():
        if key.startswith("$"):
            if key not in _ALLOWED_FILTER_OPERATORS:
                raise ConnectorValidationError("Unsupported MongoDB filter operator")
            if key in ("$and", "$or"):
                if not isinstance(item, list) or not item or len(item) > 20:
                    raise ConnectorValidationError("Logical filter must be a bounded list")
                for child in item:
                    _validate_filter(child, depth=depth + 1)
            elif key in ("$in", "$nin"):
                if not isinstance(item, list) or len(item) > 100:
                    raise ConnectorValidationError("Membership filter is too large")
                for child in item:
                    _validate_scalar(child)
            elif key == "$exists":
                if not isinstance(item, bool):
                    raise ConnectorValidationError("$exists must be boolean")
            elif isinstance(item, dict):
                _validate_filter(item, depth=depth + 1)
            else:
                _validate_scalar(item)
        else:
            if not _FIELD.fullmatch(key):
                raise ConnectorValidationError("Invalid filter field")
            if isinstance(item, dict):
                _validate_filter(item, depth=depth + 1)
            else:
                _validate_scalar(item)


def _validate_scalar(value):
    if value is None or isinstance(value, (str, bool, int, float)):
        if isinstance(value, str) and len(value) > 2000:
            raise ConnectorValidationError("Filter string is too long")
        return
    if isinstance(value, list):
        if len(value) > 100:
            raise ConnectorValidationError("Filter list is too large")
        for item in value:
            _validate_scalar(item)
        return
    raise ConnectorValidationError("Unsupported filter value type")


def validate_mongodb_arguments(metadata, operation, arguments, config):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")
    if operation not in metadata.operation_schemas:
        raise ConnectorValidationError("Unsupported MongoDB operation")

    allowed = metadata.operation_schemas[operation]["properties"]
    if set(arguments) - set(allowed):
        raise ConnectorValidationError("Unknown MongoDB argument")

    result = dict(arguments)
    if operation == "find_documents":
        collection = result.get("collection")
        if not isinstance(collection, str) or not _NAME.fullmatch(collection):
            raise ConnectorValidationError("Invalid collection name")

        limit = result.get("limit", min(config.max_documents, 50))
        if isinstance(limit, bool) or not isinstance(limit, int):
            raise ConnectorValidationError("limit must be an integer")
        if not 1 <= limit <= config.max_documents:
            raise ConnectorValidationError("limit exceeds configured bounds")
        result["limit"] = limit

        filter_document = result.get("filter", {})
        _validate_filter(filter_document)
        result["filter"] = filter_document

        if "projection" in result:
            projection = result["projection"]
            if not isinstance(projection, dict) or len(projection) > 50:
                raise ConnectorValidationError("Invalid projection")
            for key, value in projection.items():
                if not isinstance(key, str) or not _FIELD.fullmatch(key):
                    raise ConnectorValidationError("Invalid projection field")
                if value not in (0, 1, False, True):
                    raise ConnectorValidationError("Projection values must be 0 or 1")
            result["projection"] = projection
    elif result:
        raise ConnectorValidationError("This operation accepts no arguments")

    return result
