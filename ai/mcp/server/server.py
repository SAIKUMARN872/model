"""In-process MCP server facade."""

from ai.mcp.server.handler import MCPHandler


class MCPServer(MCPHandler):
    """MCP message handler; transports can call its async handle method."""
