"""Small client-side helpers."""
from typing import Any


def find_tool(tools: list[dict[str, Any]], name: str) -> dict[str, Any] | None:
    return next((tool for tool in tools if tool.get("name") == name), None)
