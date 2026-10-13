"""Utilities for MCP capability discovery."""
import re
from collections.abc import Mapping


def normalize_query(query: str) -> str:
    if not isinstance(query, str):
        raise TypeError("Discovery query must be a string.")
    return " ".join(query.casefold().split())


def tokenize(value: str) -> tuple[str, ...]:
    return tuple(re.findall(r"[a-z0-9_./:-]+", normalize_query(value)))


def searchable_text(item: Mapping) -> str:
    fields = (
        item.get("name", ""),
        item.get("description", ""),
        item.get("uri", ""),
        " ".join(str(tag) for tag in item.get("tags", ())),
    )
    return normalize_query(" ".join(str(field) for field in fields))


def score_match(query: str, item: Mapping) -> int:
    normalized = normalize_query(query)
    if not normalized:
        return 0

    name = normalize_query(str(item.get("name", "")))
    description = normalize_query(str(item.get("description", "")))
    tags = normalize_query(" ".join(str(t) for t in item.get("tags", ())))
    haystack = searchable_text(item)

    if normalized == name:
        return 100

    if name.startswith(normalized):
        return 80 if item.get("kind") == "tool" else 70

    if normalized in name:
        return 60

    if normalized in tags:
        return 45

    if normalized in description:
        return 30

    query_tokens = set(tokenize(normalized))
    if query_tokens:
        available = set(tokenize(haystack))
        overlap = len(query_tokens & available)
        if overlap:
            return 10 + int(20 * overlap / len(query_tokens))

    return 0

