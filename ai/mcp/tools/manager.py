"""MCP tool management backed by the ModelNow Tool Platform."""

from ai.tool_platform.executor import ToolExecutor
from ai.tool_platform.registry import ToolRegistry, ToolSpec

from ai.mcp.registry.registry import MCPRegistry
from ai.mcp.tools.utils import tool_to_mcp_definition, validate_tool_name


class MCPToolManager:
    """Register, discover, look up, and execute MCP-exposed tools."""

    def __init__(self, registry=None, executor=None, *, timeout_seconds=30.0):
        if isinstance(registry, MCPRegistry):
            self.mcp_registry = registry
            self.registry = registry.registry
        elif registry is None:
            self.registry = ToolRegistry()
            self.mcp_registry = MCPRegistry(self.registry)
        elif isinstance(registry, ToolRegistry):
            self.registry = registry
            self.mcp_registry = MCPRegistry(registry)
        else:
            raise TypeError("registry must be a ToolRegistry or MCPRegistry.")

        if executor is not None:
            if not isinstance(executor, ToolExecutor):
                raise TypeError("executor must be a ToolExecutor.")
            if executor.registry is not self.registry:
                raise ValueError("executor must use the same registry.")
            self.executor = executor
        else:
            self.executor = ToolExecutor(
                self.registry, timeout_seconds=timeout_seconds
            )

    def register(self, tool: ToolSpec) -> ToolSpec:
        if not isinstance(tool, ToolSpec):
            raise TypeError("tool must be a ToolSpec.")
        return self.mcp_registry.register(tool)

    def get(self, name: str, version: str | None = None) -> ToolSpec:
        validate_tool_name(name)
        return self.mcp_registry.get(name, version)

    def list_tools(self, *, enabled_only=True) -> list[dict]:
        tools = self.registry.list_tools(enabled_only=enabled_only)
        return [tool_to_mcp_definition(tool) for tool in tools]

    async def execute(
        self,
        name: str,
        arguments: dict | None = None,
        *,
        version: str | None = None,
        context=None,
    ):
        validate_tool_name(name)
        return await self.executor.execute(
            name, arguments, version=version, context=context
        )

    def unregister(self, name: str, version: str) -> bool:
        validate_tool_name(name)
        return self.registry.unregister(name, version)

    def __len__(self) -> int:
        return len(self.registry)