"""Base interface implemented by provider-specific connectors."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Mapping

from .models import ConnectorMetadata, ConnectorRequest, ConnectorResult


class Connector(ABC):
    metadata: ConnectorMetadata

    def __init__(self, metadata: ConnectorMetadata) -> None:
        if not isinstance(metadata, ConnectorMetadata):
            raise TypeError("metadata must be ConnectorMetadata.")
        self.metadata = metadata

    @abstractmethod
    async def execute(
        self,
        request: ConnectorRequest,
        credentials: Mapping[str, str],
    ) -> ConnectorResult:
        """Execute a supported provider operation."""
        raise NotImplementedError

    def validate_operation(self, operation: str) -> None:
        if operation not in self.metadata.operations:
            raise ValueError(
                f"Unsupported operation '{operation}' for connector "
                f"'{self.metadata.name}'."
            )
