"""Reusable schema definitions for MCP and JSON-RPC messages."""

JSONRPC_REQUEST_SCHEMA = {
    "type": "object",
    "required": ["jsonrpc", "id", "method"],
    "properties": {
        "jsonrpc": {"type": "string", "const": "2.0"},
        "id": {"type": ["string", "number", "null"]},
        "method": {"type": "string", "minLength": 1},
        "params": {"type": ["object", "array"]},
    },
}

JSONRPC_NOTIFICATION_SCHEMA = {
    "type": "object",
    "required": ["jsonrpc", "method"],
    "properties": {
        "jsonrpc": {"type": "string", "const": "2.0"},
        "method": {"type": "string", "minLength": 1},
        "params": {"type": ["object", "array"]},
    },
}

JSONRPC_RESPONSE_SCHEMA = {
    "type": "object",
    "required": ["jsonrpc", "id"],
    "properties": {
        "jsonrpc": {"type": "string", "const": "2.0"},
        "id": {"type": ["string", "number", "null"]},
        "result": {},
        "error": {"type": "object"},
    },
}

TOOL_CALL_PARAMS_SCHEMA = {
    "type": "object",
    "required": ["name"],
    "properties": {
        "name": {"type": "string", "minLength": 1},
        "arguments": {"type": "object"},
    },
}
