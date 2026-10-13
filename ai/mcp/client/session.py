"""MCP client session lifecycle and request methods."""
from typing import Any

from ai.mcp.constants import PROTOCOL_VERSION


class MCPSession:
    def __init__(self, connection, *, client_name="ModelNow Client",
                 client_version="1.0.0"):
        self.connection = connection
        self.client_name = client_name
        self.client_version = client_version
        self._next_id = 1
        self.initialized = False
        self.server_info: dict[str, Any] | None = None
        self.server_capabilities: dict[str, Any] = {}

    def _id(self) -> int:
        value = self._next_id
        self._next_id += 1
        return value

    async def _request(self, method: str, params=None):
        message = {
            "jsonrpc": "2.0",
            "id": self._id(),
            "method": method,
            "params": params or {},
        }
        response = await self.connection.request(message)
        if not isinstance(response, dict):
            raise RuntimeError(f"No response received for {method}")
        if "error" in response:
            error = response["error"]
            raise RuntimeError(
                f"MCP request {method} failed: "
                f"{error.get('code')}: {error.get('message')}"
            )
        if "result" not in response:
            raise RuntimeError(f"Invalid response for {method}")
        return response["result"]

    async def initialize(self) -> dict[str, Any]:
        if self.initialized:
            return {
                "protocolVersion": PROTOCOL_VERSION,
                "serverInfo": self.server_info,
                "capabilities": self.server_capabilities,
            }

        result = await self._request(
            "initialize",
            {
                "protocolVersion": PROTOCOL_VERSION,
                "capabilities": {},
                "clientInfo": {
                    "name": self.client_name,
                    "version": self.client_version,
                },
            },
        )
        self.server_info = result.get("serverInfo")
        self.server_capabilities = result.get("capabilities", {})
        self.initialized = True
        return result

    async def list_tools(self) -> list[dict[str, Any]]:
        if not self.initialized:
            await self.initialize()
        result = await self._request("tools/list")
        return result.get("tools", [])

    async def call_tool(
        self,
        name: str,
        arguments: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if not self.initialized:
            await self.initialize()
        return await self._request(
            "tools/call",
            {"name": name, "arguments": arguments or {}},
        )

    async def ping(self) -> dict[str, Any]:
        if not self.initialized:
            await self.initialize()
        return await self._request("ping")
