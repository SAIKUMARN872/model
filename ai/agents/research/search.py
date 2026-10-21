"""Search abstraction for the research agent.

Inject a search callable to connect a real search provider. No network
requests are performed by this module itself.
"""

from __future__ import annotations

import inspect
from collections.abc import Callable
from typing import Any

from .utils import normalize_source, validate_research_query


class SearchClient:
    """Adapter around an injected synchronous or asynchronous search function."""

    def __init__(self, search_fn: Callable[..., Any] | None = None) -> None:
        if search_fn is not None and not callable(search_fn):
            raise TypeError("search_fn must be callable.")
        self.search_fn = search_fn

    async def search(self, query: str, limit: int = 5) -> list[dict[str, str]]:
        query = validate_research_query(query)
        if not isinstance(limit, int) or isinstance(limit, bool) or limit < 1:
            raise ValueError("limit must be a positive integer.")
        if limit > 20:
            raise ValueError("limit cannot exceed 20.")
        if self.search_fn is None:
            raise RuntimeError("No search provider has been configured.")

        result = self.search_fn(query, limit=limit)
        if inspect.isawaitable(result):
            result = await result

        if isinstance(result, (str, dict)) or result is None:
            raise ValueError("Search provider must return a list of results.")

        try:
            items = list(result)
        except TypeError as exc:
            raise ValueError("Search provider must return an iterable.") from exc

        return [normalize_source(item, i) for i, item in enumerate(items[:limit])]
