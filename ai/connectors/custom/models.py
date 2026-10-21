"""Models for user-configured custom API operations."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any
from urllib.parse import urlsplit


_NAME = re.compile(r"^[a-z][a-z0-9_.-]{0,63}$")
_PATH = re.compile(r"^/?[A-Za-z0-9._~/-]*$")


@dataclass(frozen=True, slots=True)
class CustomOperation:
    name: str
    method: str
    path: str
    schema: dict[str, Any] = field(default_factory=lambda: {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": False,
    })
    description: str = "Custom API operation."

    def __post_init__(self) -> None:
        if not isinstance(self.name, str) or not _NAME.fullmatch(self.name):
            raise ValueError("Operation name must be a lowercase identifier.")
        if not isinstance(self.method, str) or self.method.upper() not in {
            "GET", "POST", "PUT", "PATCH", "DELETE"
        }:
            raise ValueError("Unsupported HTTP method.")
        if not isinstance(self.path, str) or not _PATH.fullmatch(self.path):
            raise ValueError("Path must be a static relative URL path.")
        parsed = urlsplit(self.path)
        if (
            parsed.scheme or parsed.netloc or parsed.query or parsed.fragment
            or "\\" in self.path or "%" in self.path
            or any(part in {".", ".."} for part in self.path.split("/"))
            or self.path.startswith("//")
        ):
            raise ValueError("Unsafe custom endpoint path.")
        if not isinstance(self.schema, dict) or self.schema.get("type") != "object":
            raise ValueError("Operation schema must describe an object.")
        if not isinstance(self.description, str) or not self.description.strip():
            raise ValueError("Operation description cannot be empty.")
        object.__setattr__(self, "method", self.method.upper())
