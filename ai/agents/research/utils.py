"""Utilities for validating and normalizing research inputs."""

from __future__ import annotations

import re
from typing import Any


def validate_research_query(query: str) -> str:
    """Validate a research query and return its trimmed form."""
    if not isinstance(query, str):
        raise ValueError("Research query must be a string.")

    query = query.strip()
    if not query:
        raise ValueError("Research query cannot be empty.")

    if len(query) > 2000:
        raise ValueError("Research query cannot exceed 2000 characters.")

    return query


def normalize_source(source: Any, index: int = 0) -> dict[str, str]:
    """Normalize a search result into a predictable dictionary."""
    if isinstance(source, str):
        title = source.strip()
        return {
            "title": title or f"Source {index + 1}",
            "url": "",
            "snippet": title,
        }

    if not isinstance(source, dict):
        raise ValueError("Each search result must be a string or dictionary.")

    title = str(source.get("title") or f"Source {index + 1}").strip()
    url = str(source.get("url") or "").strip()
    snippet = str(
        source.get("snippet") or source.get("description") or ""
    ).strip()

    return {"title": title, "url": url, "snippet": snippet}


def truncate_text(value: Any, limit: int = 12000) -> str:
    """Convert a value to bounded text."""
    text = str(value or "").strip()
    if limit < 1:
        raise ValueError("Text limit must be positive.")
    return text[:limit]


def slugify(value: str) -> str:
    """Create a stable, readable identifier."""
    value = validate_research_query(value)
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return slug[:80] or "research"
