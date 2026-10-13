"""MCP-specific exceptions."""

class MCPError(RuntimeError):
    pass

class MCPProtocolError(MCPError):
    pass

class MCPMethodNotFoundError(MCPError):
    pass

class MCPToolCallError(MCPError):
    pass
