"""Summary abstraction for the research agent."""

from __future__ import annotations

import inspect
from collections.abc import Callable
from typing import Any


class Summarizer:
    """Adapter around an injected synchronous or asynchronous summarizer."""

    def __init__(self, summarize_fn: Callable[..., Any] | None = None) -> None:
        if summarize_fn is not None and not callable(summarize_fn):
            raise TypeError("summarize_fn must be callable.")
        self.summarize_fn = summarize_fn

    async def summarize(
        self, query: str, sources: list[dict[str, str]]
    ) -> str:
        if self.summarize_fn is None:
            # A deterministic fallback, not an LLM-generated summary.
            if not sources:
                return f"No sources were found for: {query}"
            return "\n".join(
                f"- {source['title']}: {source['snippet']}"
                for source in sources
            )

        result = self.summarize_fn(query, sources)
        if inspect.isawaitable(result):
            result = await result

        if not isinstance(result, str):
            raise ValueError("Summarizer must return a string.")

        result = result.strip()
        if not result:
            raise ValueError("Summarizer returned an empty summary.")

        return result
