"""Configuration for user-defined API integrations."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ai.connectors.config import ConnectorConfig
from .models import CustomOperation


@dataclass(frozen=True, slots=True)
class CustomConnectorConfig:
    name: str
    transport: ConnectorConfig
    operations: tuple[CustomOperation, ...]
    version: str = "1.0.0"
    description: str = "User-configured API connector."
    credential_key: str | None = "api_key"
    auth_header: str = "Authorization"
    auth_prefix: str = "Bearer "
    required_permissions: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("Connector name cannot be empty.")
        if not isinstance(self.transport, ConnectorConfig):
            raise TypeError("transport must be ConnectorConfig.")
        if not self.transport.base_url or not self.transport.allowed_hosts:
            raise ValueError("HTTPS base URL and explicit host allowlist are required.")
        if not isinstance(self.operations, tuple) or not self.operations:
            raise ValueError("At least one configured operation is required.")
        if any(not isinstance(op, CustomOperation) for op in self.operations):
            raise TypeError("operations must contain CustomOperation objects.")
        if len({op.name for op in self.operations}) != len(self.operations):
            raise ValueError("Operation names must be unique.")
        if self.credential_key is not None and (
            not isinstance(self.credential_key, str) or not self.credential_key.strip()
        ):
            raise ValueError("credential_key must be non-empty or None.")
        if not isinstance(self.auth_header, str) or not self.auth_header.strip():
            raise ValueError("auth_header cannot be empty.")
        if any(c in self.auth_header for c in "\r\n:"):
            raise ValueError("Invalid authentication header name.")
        if not isinstance(self.auth_prefix, str) or any(
            c in self.auth_prefix for c in "\r\n"
        ):
            raise ValueError("Invalid authentication prefix.")
        if not isinstance(self.required_permissions, tuple) or any(
            not isinstance(p, str) or not p.strip()
            for p in self.required_permissions
        ):
            raise ValueError("required_permissions must be a tuple of strings.")

    @property
    def operation_map(self) -> dict[str, CustomOperation]:
        return {op.name: op for op in self.operations}

    @property
    def operation_schemas(self) -> dict[str, dict[str, Any]]:
        return {op.name: op.schema for op in self.operations}
