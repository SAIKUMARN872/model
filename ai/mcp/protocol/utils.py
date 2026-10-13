"""Shared JSON-RPC protocol validation helpers."""

import math
from typing import Any

from ai.mcp.schemas import validate_jsonrpc_message


def validate_method(method: Any) -> str:
    """Validate and normalize a JSON-RPC method name."""
    if not isinstance(method, str) or not method.strip():
        raise ValueError("method must be a non-empty string.")
    return method.strip()


def validate_request_id(request_id: Any) -> Any:
    """Validate a JSON-RPC identifier."""
    if request_id is None or isinstance(request_id, str):
        return request_id
    if isinstance(request_id, bool):
        raise ValueError("Request ID must be a string, finite number, or null.")
    if isinstance(request_id, int):
        return request_id
    if isinstance(request_id, float) and math.isfinite(request_id):
        return request_id
    raise ValueError("Request ID must be a string, finite number, or null.")


def normalize_params(params: Any = None) -> dict | list:
    """Normalize omitted parameters to an empty object."""
    if params is None:
        return {}
    if not isinstance(params, (dict, list)):
        raise ValueError("params must be an object or array.")
    return params


def validate_message(message: Any) -> dict:
    """Validate a complete JSON-RPC request, notification, or response."""
    return validate_jsonrpc_message(message)
