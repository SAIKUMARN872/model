"""Small helpers for working with Notion API objects."""
from __future__ import annotations

import re
from typing import Any, Mapping

_NOTION_ID = re.compile(
    r"^(?:[0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$"
)


def is_notion_id(value: Any) -> bool:
    return isinstance(value, str) and bool(_NOTION_ID.fullmatch(value))


def extract_title(obj: Mapping[str, Any]) -> str:
    """Extract a readable title from common Notion page/data-source responses."""
    properties = obj.get("properties", {})
    if isinstance(properties, dict):
        for prop in properties.values():
            if isinstance(prop, dict) and prop.get("type") == "title":
                title = prop.get("title", [])
                if isinstance(title, list):
                    return "".join(
                        part.get("plain_text", "")
                        for part in title
                        if isinstance(part, dict)
                    )
    title = obj.get("title", [])
    if isinstance(title, str):
        return title
    if isinstance(title, list):
        return "".join(
            part.get("plain_text", "")
            for part in title
            if isinstance(part, dict)
        )
    return ""
