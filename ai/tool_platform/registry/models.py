"""Core data models for the ModelNow tool platform."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .schemas import validate_version


@dataclass(frozen=True)
class ToolSpec:
    """Describes a registered tool without executing it."""

    name: str
    description: str
    handler: Any
    version: str = "1.0.0"
    input_schema: dict[str, Any] = field(default_factory=dict)
    required_permissions: tuple[str, ...] = ()
    tags: tuple[str, ...] = ()
    enabled: bool = True

    def __post_init__(self) -> None:
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("Tool name must be a non-empty string.")
        if self.name != self.name.strip() or any(
            character.isspace() for character in self.name
        ):
            raise ValueError("Tool name must not contain whitespace.")
        if not isinstance(self.description, str) or not self.description.strip():
            raise ValueError("Tool description must be non-empty.")
        if not callable(self.handler):
            raise ValueError("Tool handler must be callable.")
        validate_version(self.version)
        if not isinstance(self.input_schema, dict):
            raise TypeError("input_schema must be a dictionary.")
        if not isinstance(self.required_permissions, tuple) or any(
            not isinstance(item, str) or not item.strip()
            for item in self.required_permissions
        ):
            raise ValueError("required_permissions must be a tuple of non-empty strings.")
        if not isinstance(self.tags, tuple) or any(
            not isinstance(item, str) or not item.strip() for item in self.tags
        ):
            raise ValueError("tags must be a tuple of non-empty strings.")
        if not isinstance(self.enabled, bool):
            raise TypeError("enabled must be a boolean.")
