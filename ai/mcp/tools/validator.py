"""Validation for MCP tool definitions and arguments."""

from typing import Any

from ai.tool_platform.registry import ToolSpec

from ai.mcp.schemas import validate_tool_arguments
from ai.mcp.tools.tool import MCPTool


def validate_tool_definition(tool: Any) -> Any:
    """Validate a public MCP tool definition or registered ToolSpec."""
    if isinstance(tool, MCPTool):
        return tool
    if not isinstance(tool, ToolSpec):
        raise TypeError("tool must be an MCPTool or ToolSpec.")

    if not isinstance(tool.name, str) or not tool.name.strip():
        raise ValueError("Tool name must be a non-empty string.")
    if any(character.isspace() for character in tool.name):
        raise ValueError("Tool name must not contain whitespace.")
    if not isinstance(tool.description, str):
        raise TypeError("Tool description must be a string.")
    if not isinstance(tool.input_schema, dict):
        raise TypeError("Tool input_schema must be a dictionary.")
    if tool.input_schema and tool.input_schema.get("type") != "object":
        raise ValueError("Tool input_schema must declare type 'object'.")
    return tool


def validate_arguments(
    tool: MCPTool | ToolSpec,
    arguments: dict[str, Any] | None,
) -> dict[str, Any]:
    """Validate argument shape and supported JSON Schema constraints."""
    validate_tool_definition(tool)
    if arguments is None:
        arguments = {}
    if not isinstance(arguments, dict):
        raise ValueError("Tool arguments must be an object.")

    schema = tool.input_schema or {"type": "object", "properties": {}}
    properties = schema.get("properties", {})
    required = schema.get("required", [])

    if not isinstance(properties, dict):
        raise ValueError("Schema properties must be an object.")
    if not isinstance(required, list) or not all(
        isinstance(name, str) for name in required
    ):
        raise ValueError("Schema required must be a list of strings.")

    missing = [name for name in required if name not in arguments]
    if missing:
        raise ValueError(f"Missing required arguments: {', '.join(missing)}")

    if schema.get("additionalProperties") is False:
        unknown = sorted(set(arguments) - set(properties))
        if unknown:
            raise ValueError(f"Unexpected arguments: {', '.join(unknown)}")

    type_checks = {
        "object": lambda value: isinstance(value, dict),
        "array": lambda value: isinstance(value, list),
        "string": lambda value: isinstance(value, str),
        "boolean": lambda value: isinstance(value, bool),
        "integer": lambda value: isinstance(value, int)
        and not isinstance(value, bool),
        "number": lambda value: isinstance(value, (int, float))
        and not isinstance(value, bool),
        "null": lambda value: value is None,
    }

    for name, value in arguments.items():
        definition = properties.get(name)
        if not isinstance(definition, dict):
            continue
        expected = definition.get("type")
        if isinstance(expected, list):
            valid = any(
                type_checks.get(item, lambda _: True)(value)
                for item in expected
            )
        elif isinstance(expected, str):
            check = type_checks.get(expected)
            valid = check(value) if check else True
        else:
            valid = True

        if not valid:
            raise ValueError(
                f"Argument '{name}' must have type '{expected}'."
            )

        if isinstance(value, str):
            if isinstance(definition.get("minLength"), int):
                if len(value) < definition["minLength"]:
                    raise ValueError(f"Argument '{name}' is too short.")
            if isinstance(definition.get("maxLength"), int):
                if len(value) > definition["maxLength"]:
                    raise ValueError(f"Argument '{name}' is too long.")

    return dict(arguments)


def validate_tool_call(params: Any) -> tuple[str, dict[str, Any]]:
    """Validate the MCP tools/call parameter structure."""
    return validate_tool_arguments(params)
