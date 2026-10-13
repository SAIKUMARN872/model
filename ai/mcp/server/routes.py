"""MCP resource route handlers."""

from ai.mcp.resources.manager import MCPResourceManager
from ai.mcp.server.utils import validate_resource_read_params


def list_resources(manager: MCPResourceManager) -> dict:
    """Return MCP resource metadata without exposing resource contents."""
    if not isinstance(manager, MCPResourceManager):
        raise TypeError("manager must be an MCPResourceManager.")
    resources = sorted(manager.list_resources(), key=lambda item: item.uri)
    return {"resources": [resource.to_dict() for resource in resources]}


def read_resource(manager: MCPResourceManager, params) -> dict:
    """Read one registered resource by URI."""
    if not isinstance(manager, MCPResourceManager):
        raise TypeError("manager must be an MCPResourceManager.")
    uri = validate_resource_read_params(params)
    resource = manager.get(uri)
    if resource is None:
        raise KeyError(f"Unknown MCP resource: {uri}")
    return {"contents": [resource.to_content()]}
