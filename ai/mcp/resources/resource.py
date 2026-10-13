"""Validated MCP resource model."""
from dataclasses import dataclass, field
from typing import Any
from ai.mcp.resources.utils import validate_resource_uri


@dataclass(frozen=True)
class MCPResource:
    uri: str
    name: str
    mime_type: str = "text/plain"
    text: str | None = None
    blob: bytes | None = None
    description: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        validate_resource_uri(self.uri)
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("Resource name must be non-empty.")
        if not isinstance(self.mime_type, str) or not self.mime_type.strip():
            raise ValueError("Resource MIME type must be non-empty.")
        if self.text is not None and not isinstance(self.text, str):
            raise TypeError("Resource text must be a string.")
        if self.blob is not None and not isinstance(self.blob, bytes):
            raise TypeError("Resource blob must be bytes.")
        if self.text is not None and self.blob is not None:
            raise ValueError("A resource cannot contain both text and blob.")
        if not isinstance(self.metadata, dict):
            raise TypeError("Resource metadata must be a dictionary.")

    def to_dict(self) -> dict[str, Any]:
        result: dict[str, Any] = {
            "uri": self.uri,
            "name": self.name,
            "mimeType": self.mime_type,
        }
        if self.description is not None:
            result["description"] = self.description
        if self.metadata:
            result["metadata"] = dict(self.metadata)
        return result

    def to_content(self) -> dict[str, Any]:
        result: dict[str, Any] = {
            "uri": self.uri,
            "mimeType": self.mime_type,
        }
        if self.text is not None:
            result["text"] = self.text
        elif self.blob is not None:
            import base64
            result["blob"] = base64.b64encode(self.blob).decode("ascii")
        else:
            result["text"] = ""
        return result
