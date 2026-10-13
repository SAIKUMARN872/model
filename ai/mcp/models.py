"""Small typed models used by the MCP implementation."""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class MCPServerInfo:
    name: str = "ModelNow"
    version: str = "1.0.0"


@dataclass(frozen=True)
class MCPToolResult:
    content: list[dict[str, Any]]
    is_error: bool = False

    def to_dict(self):
        return {"content": self.content, "isError": self.is_error}
