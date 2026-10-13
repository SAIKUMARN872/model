"""MCP tool definition model."""

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class MCPTool:
    """Public MCP tool definition, without an executable handler."""

    name: str
    description: str = ""
    input_schema: dict[str, Any] = field(
        default_factory=lambda: {
            "type": "object",
            "properties": {},
        }
    )

    def __post_init__(self) -> None:
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("Tool name must be a non-empty string.")
        if self.name != self.name.strip() or any(
            character.isspace() for character in self.name
        ):
            raise ValueError("Tool name must not contain whitespace.")
        if not isinstance(self.description, str):
            raise TypeError("Tool description must be a string.")
        if not isinstance(self.input_schema, dict):
            raise TypeError("Tool input_schema must be a dictionary.")
        if self.input_schema.get("type") != "object":
            raise ValueError("Tool input_schema must declare type 'object'.")
        object.__setattr__(self, "input_schema", dict(self.input_schema))

    def to_dict(self) -> dict[str, Any]:
        """Return the MCP tools/list representation."""
        return {
            "name": self.name,
            "description": self.description,
            "inputSchema": dict(self.input_schema),
        }
