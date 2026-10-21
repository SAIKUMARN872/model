"""Validation helpers for MCP registry definitions."""

from typing import Any


def validate_name(value: Any, field: str = "name") -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a non-empty string.")
    if value != value.strip() or any(character.isspace() for character in value):
        raise ValueError(f"{field} must not contain whitespace.")
    return value


def validate_tool_definition(definition: Any) -> dict:
    """Validate metadata for one JSON-defined tool."""
    if not isinstance(definition, dict):
        raise ValueError("Each tool definition must be an object.")

    allowed = {
        "name",
        "description",
        "version",
        "input_schema",
        "required_permissions",
        "tags",
        "enabled",
    }
    unknown = set(definition) - allowed
    if unknown:
        raise ValueError(
            f"Unknown tool definition fields: {', '.join(sorted(unknown))}"
        )

    validate_name(definition.get("name"), "tool name")

    description = definition.get("description")
    if not isinstance(description, str) or not description.strip():
        raise ValueError("Tool description must be a non-empty string.")

    version = definition.get("version", "1.0.0")
    if not isinstance(version, str) or not version:
        raise ValueError("Tool version must be a non-empty string.")

    parts = version.split(".")
    if len(parts) != 3 or any(
        not part.isascii() or not part.isdigit() for part in parts
    ):
        raise ValueError("Tool version must use MAJOR.MINOR.PATCH format.")

    schema = definition.get("input_schema", {})
    if not isinstance(schema, dict):
        raise ValueError("input_schema must be an object.")

    permissions = definition.get("required_permissions", [])
    if not isinstance(permissions, list) or any(
        not isinstance(item, str) or not item.strip()
        for item in permissions
    ):
        raise ValueError("required_permissions must be an array of non-empty strings.")
    if len(permissions) != len(set(permissions)):
        raise ValueError("required_permissions must not contain duplicates.")

    tags = definition.get("tags", [])
    if not isinstance(tags, list) or any(
        not isinstance(item, str) or not item.strip() for item in tags
    ):
        raise ValueError("tags must be an array of non-empty strings.")
    if len(tags) != len(set(tags)):
        raise ValueError("tags must not contain duplicates.")

    enabled = definition.get("enabled", True)
    if not isinstance(enabled, bool):
        raise ValueError("enabled must be a boolean.")

    return {
        "name": definition["name"],
        "description": description,
        "version": version,
        "input_schema": schema,
        "required_permissions": tuple(permissions),
        "tags": tuple(tags),
        "enabled": enabled,
    }


def validate_registry_document(document: Any) -> list[dict]:
    """Return validated tool definitions from a registry JSON object."""
    if not isinstance(document, dict):
        raise ValueError("Registry document must be a JSON object.")

    unknown = set(document) - {"tools"}
    if unknown:
        raise ValueError(
            f"Unknown registry document fields: {', '.join(sorted(unknown))}"
        )

    tools = document.get("tools")
    if not isinstance(tools, list):
        raise ValueError("Registry document must contain a tools array.")

    validated = [validate_tool_definition(item) for item in tools]
    seen = set()

    for tool in validated:
        key = (tool["name"], tool["version"])
        if key in seen:
            raise ValueError(
                f"Duplicate tool definition: {key[0]} version {key[1]}."
            )
        seen.add(key)

    return validated
