"""Connection abstraction for an MCP client."""
from typing import Any


class MCPConnection:
    """In-process connection to an MCP server.

    This is useful for embedding and testing. Network clients can implement
    the same request interface using HTTP, streams, or WebSockets.
    """

    def __init__(self, server):
        self.server = server
        self.closed = False

    async def request(self, message: dict[str, Any]) -> dict[str, Any] | None:
        if self.closed:
            raise RuntimeError("MCP connection is closed")
        return await self.server.handle(message)

    async def close(self) -> None:
        self.closed = True
