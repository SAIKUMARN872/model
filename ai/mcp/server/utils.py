"""Validation helpers for MCP server routing."""

def validate_resource_read_params(params):
    if not isinstance(params, dict):
        raise ValueError("Resource read params must be an object.")
    uri = params.get("uri")
    if not isinstance(uri, str) or not uri.strip():
        raise ValueError("Resource URI must be a non-empty string.")
    return uri


def validate_method(method):
    if not isinstance(method, str) or not method.strip():
        raise ValueError("Method must be a non-empty string.")
    return method
