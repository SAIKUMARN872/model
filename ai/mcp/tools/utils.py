"""Utilities for MCP tool definitions."""

from ai.tool_platform.registry import ToolSpec


def tool_to_mcp_definition(tool: ToolSpec) -> dict:
    """Convert a registered tool into an MCP tools/list definition."""
    if not isinstance(tool, ToolSpec):
        raise TypeError("tool must be a ToolSpec.")
    return {
        "name": tool.name,
        "description": tool.description,
        "inputSchema": tool.input_schema or {
            "type": "object",
            "properties": {},
        },
    }


def validate_tool_name(name) -> str:
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Tool name must be a non-empty string.")
    if name != name.strip() or any(character.isspace() for character in name):
        raise ValueError("Tool name must not contain whitespace.")
    return name