"""Typed contracts shared by ModelNow integrations."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ConnectorMetadata:
    name: str
    version: str
    description: str
    operations: tuple[str, ...]
    operation_schemas: dict[str, dict[str, Any]] = field(default_factory=dict)
    required_permissions: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("Connector name must be non-empty.")
        if not isinstance(self.version, str) or not self.version.strip():
            raise ValueError("Connector version must be non-empty.")
        if not isinstance(self.description, str) or not self.description.strip():
            raise ValueError("Connector description must be non-empty.")
        if not self.operations or any(
            not isinstance(op, str) or not op.strip() for op in self.operations
        ):
            raise ValueError("At least one valid operation is required.")
        if len(set(self.operations)) != len(self.operations):
            raise ValueError("Connector operations must be unique.")
        if not isinstance(self.operation_schemas, dict):
            raise TypeError("operation_schemas must be a dictionary.")
        if set(self.operation_schemas) - set(self.operations):
            raise ValueError("Schemas reference unknown operations.")
        if not isinstance(self.required_permissions, tuple) or any(
            not isinstance(p, str) or not p.strip()
            for p in self.required_permissions
        ):
            raise ValueError("required_permissions must be a tuple of strings.")


@dataclass(frozen=True)
class ConnectorRequest:
    operation: str
    arguments: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.operation, str) or not self.operation.strip():
            raise ValueError("Operation must be non-empty.")
        if not isinstance(self.arguments, dict):
            raise TypeError("Connector arguments must be a dictionary.")


@dataclass(frozen=True)
class ConnectorResult:
    connector: str
    operation: str
    success: bool
    data: Any = None
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "connector": self.connector,
            "operation": self.operation,
            "success": self.success,
            "data": self.data,
            "error": self.error,
        }
