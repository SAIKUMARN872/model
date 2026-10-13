"""Convenient MCP engine wired to the existing Tool Platform."""

from ai.tool_platform.executor import ToolExecutor
from ai.tool_platform.registry import ToolRegistry

from .server.server import MCPServer
from .tools.executor import MCPToolExecutor


class MCPEngine:
    def __init__(
        self,
        registry=None,
        *,
        timeout_seconds=30.0,
        permission_context=None,
        resource_manager=None,
    ):
        self.registry = registry if registry is not None else ToolRegistry()
        self.executor = ToolExecutor(self.registry, timeout_seconds=timeout_seconds)
        self.mcp_tool_executor = MCPToolExecutor(
            self.registry, self.executor
        )
        self.server = MCPServer(
            self.registry,
            self.mcp_tool_executor,
            permission_context=permission_context,
            resource_manager=resource_manager,
        )

    async def handle(self, message):
        return await self.server.handle(message)

