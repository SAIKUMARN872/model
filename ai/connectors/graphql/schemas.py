"""Validation for configured GraphQL operations."""
from typing import Any, Mapping

from ai.connectors.exceptions import ConnectorValidationError


def validate_variables(schema: Mapping[str, Any], variables: Mapping[str, Any]) -> dict[str, Any]:
    if not isinstance(variables, Mapping):
        raise ConnectorValidationError("GraphQL variables must be an object.")
    properties = schema.get("properties", {})
    required = schema.get("required", [])
    if schema.get("additionalProperties") is False:
        unknown = set(variables) - set(properties)
        if unknown:
            raise ConnectorValidationError("GraphQL variables contain unsupported fields.")
    missing = [name for name in required if name not in variables]
    if missing:
        raise ConnectorValidationError("Required GraphQL variables are missing.")

    result = dict(variables)
    for name, value in result.items():
        definition = properties.get(name, {})
        kind = definition.get("type")
        valid = True
        if kind == "string":
            valid = isinstance(value, str)
        elif kind == "integer":
            valid = isinstance(value, int) and not isinstance(value, bool)
        elif kind == "number":
            valid = isinstance(value, (int, float)) and not isinstance(value, bool)
        elif kind == "boolean":
            valid = isinstance(value, bool)
        elif kind == "object":
            valid = isinstance(value, Mapping)
        elif kind == "array":
            valid = isinstance(value, list)
        if not valid:
            raise ConnectorValidationError(f"Invalid value for GraphQL variable: {name}.")
        if isinstance(value, str):
            if len(value) > definition.get("maxLength", 10000):
                raise ConnectorValidationError(f"GraphQL variable is too long: {name}.")
            if len(value) < definition.get("minLength", 0):
                raise ConnectorValidationError(f"GraphQL variable is too short: {name}.")
        if kind in ("integer", "number"):
            if "minimum" in definition and value < definition["minimum"]:
                raise ConnectorValidationError(f"GraphQL variable is below minimum: {name}.")
            if "maximum" in definition and value > definition["maximum"]:
                raise ConnectorValidationError(f"GraphQL variable exceeds maximum: {name}.")
    return result
