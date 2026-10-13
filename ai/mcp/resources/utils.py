"""Validation and conversion helpers for MCP resources."""
from urllib.parse import urlsplit


def validate_resource_uri(uri: str) -> str:
    if not isinstance(uri, str) or not uri.strip():
        raise ValueError("Resource URI must be a non-empty string.")
    if uri != uri.strip() or any(ord(ch) < 32 for ch in uri):
        raise ValueError("Resource URI contains invalid whitespace or control characters.")
    parsed = urlsplit(uri)
    if not parsed.scheme:
        raise ValueError("Resource URI must have a scheme.")
    if parsed.scheme.lower() == "file" and not parsed.path:
        raise ValueError("File resource URI must include a path.")
    return uri


def resource_to_dict(resource) -> dict:
    if not hasattr(resource, "to_dict"):
        raise TypeError("Resource must provide to_dict().")
    return resource.to_dict()


def resource_content(resource) -> dict:
    if not hasattr(resource, "to_content"):
        raise TypeError("Resource must provide to_content().")
    return resource.to_content()
