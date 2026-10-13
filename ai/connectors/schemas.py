"""Validate connector operations using ModelNow's Tool Platform validator."""

from __future__ import annotations

from typing import Any

from ai.tool_platform.validation.validator import (
    ToolInputValidationError,
    validate_arguments,
)

from .exceptions import ConnectorValidationError
from .models import ConnectorMetadata


def validate_connector_arguments(
    metadata: ConnectorMetadata,
    operation: str,
    arguments: dict[str, Any],
) -> dict[str, Any]:
    if operation not in metadata.operations:
        raise ConnectorValidationError(
            f"Unsupported operation '{operation}'."
        )

    schema = metadata.operation_schemas.get(
        operation,
        {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False,
        },
    )

    try:
        return validate_arguments(arguments, schema)
    except (ToolInputValidationError, TypeError, ValueError) as exc:
        raise ConnectorValidationError(
            f"Invalid arguments for operation '{operation}': {exc}"
        ) from exc
