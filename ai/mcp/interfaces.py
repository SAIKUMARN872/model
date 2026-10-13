"""Typing interfaces for MCP message handlers."""

from typing import Any, Protocol


class MessageHandler(Protocol):
    async def handle(self, message: dict[str, Any]) -> dict[str, Any] | None:
        ...
