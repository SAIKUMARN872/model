"""
Utilities for the ModelNow memory subsystem.
"""

from __future__ import annotations

import json
import re
from typing import Any, Iterable


def normalize_text(
    text: Any,
) -> str:
    """Normalize arbitrary input into text."""

    if text is None:
        return ""

    if isinstance(
        text,
        str,
    ):
        return text.strip()

    if isinstance(
        text,
        (dict, list, tuple),
    ):
        return json.dumps(
            text,
            default=str,
        )

    return str(text).strip()


def normalize_key(
    key: str,
) -> str:
    """Normalize a memory key."""

    key = normalize_text(key)

    if not key:
        raise ValueError(
            "Memory key cannot be empty"
        )

    return key.lower().replace(
        " ",
        "_",
    )


def approximate_tokens(
    text: str,
) -> int:
    """
    Lightweight token approximation.

    Exact token counting should be delegated to the
    cost_engine token counter when required.
    """

    text = normalize_text(
        text
    )

    if not text:
        return 0

    return max(
        1,
        (len(text) + 3) // 4,
    )


def truncate_text(
    text: str,
    maximum: int,
) -> str:

    if maximum <= 0:
        raise ValueError(
            "maximum must be positive"
        )

    if len(text) <= maximum:
        return text

    if maximum <= 3:
        return text[:maximum]

    return (
        text[: maximum - 3]
        + "..."
    )


def sanitize_metadata(
    metadata: dict[str, Any] | None,
) -> dict[str, Any]:

    if not metadata:
        return {}

    result = {}

    for key, value in metadata.items():

        try:

            json.dumps(
                value,
                default=str,
            )

            result[str(key)] = value

        except (
            TypeError,
            ValueError,
        ):

            result[str(key)] = str(value)

    return result


def keyword_match(
    text: str,
    query: str,
) -> float:
    """
    Return a simple keyword relevance score from 0 to 1.
    """

    text_words = set(
        re.findall(
            r"\b\w+\b",
            text.lower(),
        )
    )

    query_words = set(
        re.findall(
            r"\b\w+\b",
            query.lower(),
        )
    )

    if not query_words:
        return 0.0

    matches = text_words.intersection(
        query_words
    )

    return len(matches) / len(
        query_words
    )


def rank_memories(
    memories: Iterable[dict[str, Any]],
    query: str,
) -> list[dict[str, Any]]:
    """
    Rank memory records using simple lexical matching.
    """

    ranked = []

    for memory in memories:

        content = normalize_text(
            memory.get(
                "content",
                "",
            )
        )

        score = keyword_match(
            content,
            query,
        )

        item = dict(memory)

        item["score"] = score

        ranked.append(item)

    ranked.sort(
        key=lambda item: item.get(
            "score",
            0.0,
        ),
        reverse=True,
    )

    return ranked


def build_context_text(
    memories: Iterable[dict[str, Any]],
    history: Iterable[dict[str, Any]],
) -> str:
    """
    Build a text representation suitable for passing
    into an LLM context.
    """

    sections = []

    memory_items = list(
        memories
    )

    history_items = list(
        history
    )

    if memory_items:

        sections.append(
            "Relevant memories:"
        )

        for memory in memory_items:

            content = normalize_text(
                memory.get(
                    "content",
                    "",
                )
            )

            if content:
                sections.append(
                    f"- {content}"
                )

    if history_items:

        sections.append(
            "\nConversation history:"
        )

        for item in history_items:

            role = item.get(
                "role",
                "unknown",
            )

            content = normalize_text(
                item.get(
                    "content",
                    "",
                )
            )

            sections.append(
                f"{role}: {content}"
            )

    return "\n".join(
        sections
    )


def merge_dicts(
    *values: dict[str, Any] | None,
) -> dict[str, Any]:

    result = {}

    for value in values:

        if value:
            result.update(value)

    return result