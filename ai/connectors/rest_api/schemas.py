"""Validation for configured REST API operations."""
from collections.abc import Mapping
import math

from ai.connectors.exceptions import ConnectorValidationError


def _validate_object(schema, value, label):
    if not isinstance(value, Mapping):
        raise ConnectorValidationError(f"{label} must be an object.")
    properties = schema.get("properties", {})
    required = schema.get("required", [])
    if schema.get("additionalProperties", False) is False:
        if set(value) - set(properties):
            raise ConnectorValidationError(f"{label} contains unsupported fields.")
    missing = set(required) - set(value)
    if missing:
        raise ConnectorValidationError(f"{label} is missing required fields.")

    result = dict(value)
    for key, item in result.items():
        rule = properties.get(key)
        if rule is None:
            continue
        kind = rule.get("type")
        valid = True
        if kind == "string":
            valid = isinstance(item, str)
        elif kind == "integer":
            valid = isinstance(item, int) and not isinstance(item, bool)
        elif kind == "number":
            valid = isinstance(item, (int, float)) and not isinstance(item, bool)
        elif kind == "boolean":
            valid = isinstance(item, bool)
        elif kind == "object":
            valid = isinstance(item, Mapping)
        elif kind == "array":
            valid = isinstance(item, list)
        if not valid:
            raise ConnectorValidationError(f"Invalid {label} field: {key}.")
        if isinstance(item, str) and (
            len(item) < rule.get("minLength", 0)
            or len(item) > rule.get("maxLength", 10000)
        ):
            raise ConnectorValidationError(f"Invalid {label} field length: {key}.")
        if isinstance(item, (int, float)) and not isinstance(item, bool):
            if isinstance(item, float) and not math.isfinite(item):
                raise ConnectorValidationError(f"Invalid numeric field: {key}.")
            if "minimum" in rule and item < rule["minimum"]:
                raise ConnectorValidationError(f"Field below minimum: {key}.")
            if "maximum" in rule and item > rule["maximum"]:
                raise ConnectorValidationError(f"Field exceeds maximum: {key}.")
    return result


def validate_rest_arguments(operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("REST arguments must be an object.")
    if set(arguments) - {"query", "body"}:
        raise ConnectorValidationError("Unsupported REST operation arguments.")
    method = operation.method.upper()
    if method == "GET" and "body" in arguments:
        raise ConnectorValidationError("GET operations cannot include a body.")
    query = arguments.get("query", {})
    body = arguments.get("body", {})
    if operation.query_schema is not None:
        query = _validate_object(operation.query_schema, query, "query")
    elif query:
        raise ConnectorValidationError("This operation does not accept query arguments.")
    if operation.body_schema is not None:
        body = _validate_object(operation.body_schema, body, "body")
    elif body:
        raise ConnectorValidationError("This operation does not accept body arguments.")
    return {"query": query, "body": body}
