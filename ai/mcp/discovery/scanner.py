"""Read-only scanner for MCP tools and resources."""
from collections.abc import Iterable
from typing import Any


def _get_value(obj: Any, *names: str, default=None):
    for name in names:
        if isinstance(obj, dict) and name in obj:
            return obj[name]
        if hasattr(obj, name):
            return getattr(obj, name)
    return default


def scan_tools(registry) -> list[dict]:
    if registry is None:
        return []
    if hasattr(registry, "list_tools"):
        try:
            tools = registry.list_tools(enabled_only=True)
        except TypeError:
            tools = registry.list_tools()
    elif hasattr(registry, "list"):
        tools = registry.list()
    else:
        raise TypeError("Tool registry must provide list_tools() or list().")

    results = []
    for tool in tools:
        enabled = _get_value(tool, "enabled", default=True)
        if not enabled:
            continue
        name = _get_value(tool, "name")
        if not isinstance(name, str) or not name.strip():
            continue
        tags = _get_value(tool, "tags", default=()) or ()
        results.append({
            "kind": "tool",
            "name": name,
            "description": str(_get_value(tool, "description", default="") or ""),
            "version": str(_get_value(tool, "version", default="1.0.0")),
            "tags": list(tags),
            "required_permissions": list(
                _get_value(tool, "required_permissions", default=()) or ()
            ),
            "input_schema": _get_value(tool, "input_schema", default={}) or {},
        })
    return results


def scan_resources(manager) -> list[dict]:
    if manager is None:
        return []
    if hasattr(manager, "list_resources"):
        resources = manager.list_resources()
    elif hasattr(manager, "list"):
        resources = manager.list()
    else:
        raise TypeError("Resource manager must provide list_resources() or list().")

    results = []
    for resource in resources:
        uri = _get_value(resource, "uri")
        name = _get_value(resource, "name", default=uri)
        if not isinstance(uri, str) or not uri:
            continue
        results.append({
            "kind": "resource",
            "uri": uri,
            "name": str(name or uri),
            "description": str(_get_value(resource, "description", default="") or ""),
            "mime_type": str(
                _get_value(resource, "mime_type", "mimeType", default="text/plain")
            ),
            "tags": list(_get_value(resource, "tags", default=()) or ()),
        })
    return results
