"""Validate tool arguments against registered JSON-style schemas."""

from __future__ import annotations

from typing import Any

from ..registry.schemas import validate_input_schema


class ToolInputValidationError(ValueError):
    """Raised when tool arguments do not satisfy the declared schema."""


def validate_arguments(
    arguments: dict[str, Any] | None,
    schema: dict[str, Any],
) -> dict[str, Any]:
    if arguments is None:
        arguments = {}
    if not isinstance(arguments, dict):
        raise ToolInputValidationError("Tool arguments must be a dictionary.")

    try:
        validate_input_schema(schema)
    except (TypeError, ValueError) as exc:
        raise ToolInputValidationError(f"Invalid tool schema: {exc}") from exc

    properties = schema.get("properties", {})
    required = schema.get("required", [])
    additional = schema.get("additionalProperties", True)

    missing = [key for key in required if key not in arguments]
    if missing:
        raise ToolInputValidationError(
            f"Missing required arguments: {', '.join(missing)}"
        )

    if additional is False:
        unknown = sorted(set(arguments) - set(properties))
        if unknown:
            raise ToolInputValidationError(
                f"Unknown arguments: {', '.join(unknown)}"
            )

    for name, value in arguments.items():
        definition = properties.get(name)
        if definition is None:
            continue
        if not isinstance(definition, dict):
            raise ToolInputValidationError(
                f"Schema for argument '{name}' must be a dictionary."
            )
        expected = definition.get("type")
        valid = {
            "object": lambda v: isinstance(v, dict),
            "array": lambda v: isinstance(v, list),
            "string": lambda v: isinstance(v, str),
            "integer": lambda v: isinstance(v, int) and not isinstance(v, bool),
            "number": lambda v: isinstance(v, (int, float)) and not isinstance(v, bool),
            "boolean": lambda v: isinstance(v, bool),
            "null": lambda v: v is None,
        }
        if expected in valid and not valid[expected](value):
            raise ToolInputValidationError(
                f"Argument '{name}' must be of type '{expected}'."
            )

        if isinstance(value, str):
            if "minLength" in definition and len(value) < definition["minLength"]:
                raise ToolInputValidationError(
                    f"Argument '{name}' is shorter than minLength."
                )
            if "maxLength" in definition and len(value) > definition["maxLength"]:
                raise ToolInputValidationError(
                    f"Argument '{name}' exceeds maxLength."
                )
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            if "minimum" in definition and value < definition["minimum"]:
                raise ToolInputValidationError(
                    f"Argument '{name}' is below minimum."
                )
            if "maximum" in definition and value > definition["maximum"]:
                raise ToolInputValidationError(
                    f"Argument '{name}' exceeds maximum."
                )
        if "enum" in definition and value not in definition["enum"]:
            raise ToolInputValidationError(
                f"Argument '{name}' is not an allowed value."
            )

    return dict(arguments)
