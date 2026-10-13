"""Public MCP capability discovery service."""
from ai.mcp.discovery.indexer import MCPDiscoveryIndexer
from ai.mcp.discovery.scanner import scan_resources, scan_tools


class MCPDiscovery:
    def __init__(self, tool_registry=None, resource_manager=None, *, indexer=None):
        self.tool_registry = tool_registry
        self.resource_manager = resource_manager
        self.indexer = indexer or MCPDiscoveryIndexer()

    def refresh(self) -> int:
        items = scan_tools(self.tool_registry)
        items.extend(scan_resources(self.resource_manager))
        return self.indexer.rebuild(items)

    def search(self, query: str = "", *, kind=None, tags=None, limit=50) -> list[dict]:
        return self.indexer.search(query, kind=kind, tags=tags, limit=limit)

    def list_tools(self, query: str = "", *, tags=None, limit=50) -> list[dict]:
        return self.search(query, kind="tool", tags=tags, limit=limit)

    def list_resources(self, query: str = "", *, tags=None, limit=50) -> list[dict]:
        return self.search(query, kind="resource", tags=tags, limit=limit)

    def get_resource(self, uri: str) -> dict | None:
        for item in self.indexer.all_items():
            if item.get("kind") == "resource" and item.get("uri") == uri:
                return item
        return None
