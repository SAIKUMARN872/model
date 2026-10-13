"""MCP tool registry backed by ModelNow Tool Platform."""

from ai.tool_platform.registry import ToolRegistry, ToolSpec


class MCPRegistry:
    def __init__(self, registry=None):
        self.registry = registry if registry is not None else ToolRegistry()
        if not isinstance(self.registry, ToolRegistry):
            raise TypeError("registry must be a ToolRegistry.")

    def register(self, tool: ToolSpec):
        return self.registry.register(tool)

    def get(self, name, version=None):
        return self.registry.get(name, version)

    def list_tools(self, enabled_only=True):
        return self.registry.list_tools(enabled_only=enabled_only)

    def __len__(self):
        return len(self.registry)
