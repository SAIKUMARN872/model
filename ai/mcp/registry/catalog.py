"""Convert registered ModelNow tools to MCP tool descriptions."""

class MCPCatalog:
    def __init__(self, registry):
        self.registry = registry

    def list_tools(self):
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "inputSchema": tool.input_schema or {
                    "type": "object",
                    "properties": {},
                },
            }
            for tool in self.registry.list_tools(enabled_only=True)
        ]
