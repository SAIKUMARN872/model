"""Base lifecycle and error types for MCP connectors."""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Any

from .utils import validate_name


class MCPConnectorError(RuntimeError):
    """A connector operation failed."""


class ConnectorState(str, Enum):
    DISCONNECTED = "disconnected"
    CONNECTED = "connected"
    CLOSED = "closed"


class MCPConnector(ABC):
    """Common lifecycle for concrete MCP connector adapters."""

    def __init__(self, name: str) -> None:
        self.name = validate_name(name)
        self._state = ConnectorState.DISCONNECTED

    @property
    def state(self) -> ConnectorState:
        return self._state

    @property
    def connected(self) -> bool:
        return self._state == ConnectorState.CONNECTED

    async def connect(self) -> None:
        if self._state == ConnectorState.CLOSED:
            raise MCPConnectorError("A closed connector cannot be reopened.")
        if self.connected:
            return
        await self._connect()
        self._state = ConnectorState.CONNECTED

    async def close(self) -> None:
        if self._state == ConnectorState.CLOSED:
            return
        try:
            if self.connected:
                await self._close()
        finally:
            self._state = ConnectorState.CLOSED

    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.close()
        return False

    def require_connected(self) -> None:
        if not self.connected:
            raise MCPConnectorError(
                f"Connector {self.name!r} is not connected."
            )

    @abstractmethod
    async def _connect(self) -> None:
        """Establish the connector's resources."""

    @abstractmethod
    async def _close(self) -> None:
        """Release the connector's resources."""