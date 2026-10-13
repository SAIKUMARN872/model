"""High-level MCP client API."""
from ai.mcp.client.connection import MCPConnection
from ai.mcp.client.session import MCPSession


class MCPClient:
    def __init__(self, server, *, client_name="ModelNow Client",
                 client_version="1.0.0"):
        self.connection = MCPConnection(server)
        self.session = MCPSession(
            self.connection,
            client_name=client_name,
            client_version=client_version,
        )

    async def connect(self):
        return await self.session.initialize()

    async def list_tools(self):
        return await self.session.list_tools()

    async def call_tool(self, name, arguments=None):
        return await self.session.call_tool(name, arguments)

    async def ping(self):
        return await self.session.ping()

    async def close(self):
        await self.connection.close()

    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        await self.close()
