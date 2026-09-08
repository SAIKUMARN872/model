"""
Utilities for the ModelNow research package.
"""

from __future__ import annotations

import inspect
import re
from typing import Any, Awaitable, Callable


async def execute_handler(
    handler: Callable[..., Any],
    *args: Any,
    **kwargs: Any,
) -> Any:
    """Execute sync or async handlers."""

    if not callable(handler):
        raise TypeError(
            "Handler must be callable"
        )

    result = handler(
        *args,
        **kwargs,
    )

    if inspect.isawaitable(result):
        return await result

    return result


def normalize_query(
    query: str,
) -> str:

    query = query.strip()

    query = re.sub(
        r"\s+",
        " ",
        query,
    )

    if not query:
        raise ValueError(
            "Research query cannot be empty"
        )

    return query


def deduplicate_urls(
    results: list[Any],
) -> list[Any]:

    seen: set[str] = set()

    unique = []

    for result in results:

        url = getattr(
            result,
            "url",
            None,
        )

        if not url:
            unique.append(result)
            continue

        if url in seen:
            continue

        seen.add(url)

        unique.append(result)

    return unique


def clean_text(
    text: str,
) -> str:

    text = text.strip()

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text


def extract_urls(
    text: str,
) -> list[str]:

    pattern = r"https?://[^\s]+"

    return re.findall(
        pattern,
        text,
    )


def build_research_prompt(
    query: str,
    results: list[Any],
) -> str:

    sections = [
        f"Research topic: {query}",
        "",
        "Available sources:",
    ]

    for index, result in enumerate(
        results,
        start=1,
    ):

        title = getattr(
            result,
            "title",
            "Untitled",
        )

        snippet = getattr(
            result,
            "snippet",
            "",
        )

        url = getattr(
            result,
            "url",
            "",
        )

        sections.append(
            f"{index}. {title}\n"
            f"{snippet}\n"
            f"{url}"
        )

    sections.extend(
        [
            "",
            "Analyze the sources and produce a "
            "fact-based research response.",
            "Clearly distinguish known facts from "
            "uncertain information.",
        ]
    )

    return "\n".join(
        sections
    )


def word_count(
    text: str,
) -> int:

    return len(
        re.findall(
            r"\b\w+\b",
            text,
        )
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

    return (
        text[: maximum - 3]
        + "..."
    )


def merge_metadata(
    *metadata: dict[str, Any] | None,
) -> dict[str, Any]:

    result: dict[str, Any] = {}

    for item in metadata:

        if item:
            result.update(item)

    return result