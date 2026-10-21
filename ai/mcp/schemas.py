"""Basic JSON-RPC and MCP request/response validation."""

import math
from typing import Any


def _valid_id(value: Any) -> bool:
    if value is None or isinstance(value, str):
        return True
    if isinstance(value, bool):
        return False
    if isinstance(value, int):
        return True
    return isinstance(value, float) and math.isfinite(value)


def validate_jsonrpc_message(message: Any) -> dict:
    """Validate a JSON-RPC 2.0 request, notification, or response."""
    if not isinstance(message, dict):
        raise ValueError("JSON-RPC message must be an object.")
    if message.get("jsonrpc") != "2.0":
        raise ValueError("jsonrpc must be '2.0'.")

    has_method = "method" in message
    has_result = "result" in message
    has_error = "error" in message

    if has_method:
        if has_result or has_error:
            raise ValueError("Requests must not contain result or error.")
        method = message["method"]
        if not isinstance(method, str) or not method.strip():
            raise ValueError("method must be a non-empty string.")
        if "id" in message and not _valid_id(message["id"]):
            raise ValueError("id must be a string, finite number, or null.")
        if "params" in message and not isinstance(
            message["params"], (dict, list)
        ):
            raise ValueError("params must be an object or array.")
        return message

    if "id" not in message:
        raise ValueError("JSON-RPC responses must contain an id.")
    if not _valid_id(message["id"]):
        raise ValueError("id must be a string, finite number, or null.")
    if has_result == has_error:
        raise ValueError("Response must contain exactly one of result or error.")

    if has_error:
        error = message["error"]
        if not isinstance(error, dict):
            raise ValueError("error must be an object.")
        code = error.get("code")
        if not isinstance(code, int) or isinstance(code, bool):
            raise ValueError("error.code must be an integer.")
        if not isinstance(error.get("message"), str):
            raise ValueError("error.message must be a string.")

    return message


def validate_tool_arguments(params):
    if not isinstance(params, dict):
        raise ValueError("Tool call params must be an object.")
    name = params.get("name")
    arguments = params.get("arguments", {})
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Tool name must be a non-empty string.")
    if not isinstance(arguments, dict):
        raise ValueError("Tool arguments must be an object.")
    return name, arguments