"""
Schema generation and validation for ModelNow tools.
"""

from __future__ import annotations

import inspect
from typing import Any


def python_type_to_json_type(
    annotation: Any,
) -> str:
    """Convert a Python annotation into a JSON type."""

    if annotation is inspect.Parameter.empty:
        return "string"

    origin = getattr(
        annotation,
        "__origin__",
        None,
    )

    if origin is list:
        return "array"

    if origin is dict:
        return "object"

    if origin is tuple:
        return "array"

    if origin is set:
        return "array"

    mapping = {
        str: "string",
        int: "integer",
        float: "number",
        bool: "boolean",
        list: "array",
        dict: "object",
        tuple: "array",
        set: "array",
    }

    return mapping.get(
        annotation,
        "string",
    )


def infer_parameters(
    function: Any,
) -> dict[str, Any]:
    """
    Infer JSON-schema-style parameters from a function.
    """

    signature = inspect.signature(
        function
    )

    properties: dict[str, Any] = {}

    required: list[str] = []

    for name, parameter in signature.parameters.items():

        if name in {
            "self",
            "cls",
        }:
            continue

        if parameter.kind in {
            inspect.Parameter.VAR_POSITIONAL,
            inspect.Parameter.VAR_KEYWORD,
        }:
            continue

        annotation = parameter.annotation

        schema = {
            "type": python_type_to_json_type(
                annotation
            )
        }

        if (
            parameter.default
            is not inspect.Parameter.empty
        ):

            schema["default"] = parameter.default

        else:

            required.append(name)

        properties[name] = schema

    return {
        "type": "object",
        "properties": properties,
        "required": required,
    }


def validate_arguments(
    function: Any,
    arguments: dict[str, Any],
) -> None:
    """
    Validate supplied arguments against a callable's signature.
    """

    if not isinstance(
        arguments,
        dict,
    ):

        raise ValueError(
            "Tool arguments must be a dictionary"
        )

    signature = inspect.signature(
        function
    )

    try:

        signature.bind(
            **arguments
        )

    except TypeError as exc:

        raise ValueError(
            f"Invalid tool arguments: {exc}"
        ) from exc


def build_tool_schema(
    name: str,
    description: str,
    function: Any,
) -> dict[str, Any]:
    """
    Build an AI-compatible tool schema.
    """

    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": infer_parameters(
                function
            ),
        },
    }


def validate_schema(
    schema: dict[str, Any],
) -> None:
    """Validate a basic tool schema."""

    if not isinstance(
        schema,
        dict,
    ):
        raise ValueError(
            "Schema must be a dictionary"
        )

    if "type" not in schema:
        raise ValueError(
            "Schema must contain 'type'"
        )

    if schema["type"] != "object":
        raise ValueError(
            "Tool parameter schema must have "
            "type='object'"
        )

    properties = schema.get(
        "properties",
        {},
    )

    if not isinstance(
        properties,
        dict,
    ):
        raise ValueError(
            "Schema properties must be a dictionary"
        )

    required = schema.get(
        "required",
        [],
    )

    if not isinstance(
        required,
        list,
    ):
        raise ValueError(
            "Schema required must be a list"
        )

    for name in required:

        if name not in properties:

            raise ValueError(
                f"Required parameter '{name}' "
                f"is missing from properties"
            )