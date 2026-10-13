"""MCP request validation facade."""

from ai.mcp.schemas import validate_jsonrpc_message, validate_tool_arguments


def validate_request(message):
    message = validate_jsonrpc_message(message)
    if "id" not in message and not message["method"].startswith("notifications/"):
        raise ValueError("Requests must include an id.")
    return message


__all__ = ["validate_request", "validate_tool_arguments"]
