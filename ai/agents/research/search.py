"""
Search abstractions for the ModelNow research system.

The actual web/search provider is injected through a handler,
so this module does not depend on a particular search API.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable
from uuid import uuid4


class SearchError(Exception):
    """Base search exception."""


@dataclass
class SearchRequest:
    """Represents a research search request."""

    query: str

    max_results: int = 10

    language: str = "en"

    recency_days: int | None = None

    domains: list[str] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.query = self.query.strip()

        if not self.query:
            raise ValueError(
                "Search query cannot be empty"
            )

        if self.max_results <= 0:
            raise ValueError(
                "max_results must be positive"
            )

        if (
            self.recency_days is not None
            and self.recency_days < 0
        ):
            raise ValueError(
                "recency_days cannot be negative"
            )


@dataclass
class SearchResult:
    """Represents a single search result."""

    title: str

    url: str

    snippet: str = ""

    source: str | None = None

    relevance: float = 0.0

    published_at: datetime | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    result_id: str = field(
        default_factory=lambda: str(uuid4())
    )

    def __post_init__(self) -> None:

        if not self.title.strip():
            raise ValueError(
                "Search result title cannot be empty"
            )

        if not self.url.strip():
            raise ValueError(
                "Search result URL cannot be empty"
            )

        self.relevance = max(
            0.0,
            min(1.0, self.relevance),
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "result_id": self.result_id,
            "title": self.title,
            "url": self.url,
            "snippet": self.snippet,
            "source": self.source,
            "relevance": self.relevance,
            "published_at": (
                self.published_at.isoformat()
                if self.published_at
                else None
            ),
            "metadata": dict(
                self.metadata
            ),
        }


@dataclass
class SearchResponse:
    """Response returned by a search provider."""

    query: str

    results: list[SearchResult] = field(
        default_factory=list
    )

    success: bool = True

    error: str | None = None

    searched_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "query": self.query,
            "results": [
                result.to_dict()
                for result in self.results
            ],
            "success": self.success,
            "error": self.error,
            "searched_at": (
                self.searched_at.isoformat()
            ),
            "metadata": dict(
                self.metadata
            ),
        }


class SearchProvider:
    """
    Generic search provider.

    The handler can be connected to:
        - web search
        - enterprise search
        - internal knowledge search
        - API-based search

    Handler signature:

        handler(request) -> list | dict
    """

    def __init__(
        self,
        handler: Callable[..., Any] | None = None,
    ) -> None:

        self.handler = handler

    async def search(
        self,
        request: SearchRequest,
    ) -> SearchResponse:

        if self.handler is None:

            return SearchResponse(
                query=request.query,
                success=False,
                error=(
                    "No search provider configured"
                ),
            )

        try:

            from .utils import execute_handler

            raw_result = await execute_handler(
                self.handler,
                request,
            )

            results = self._parse_results(
                raw_result
            )

            results = self.rank_results(
                results,
                request.query,
            )

            return SearchResponse(
                query=request.query,
                results=results[
                    : request.max_results
                ],
                success=True,
                metadata=request.metadata,
            )

        except Exception as exc:

            return SearchResponse(
                query=request.query,
                success=False,
                error=str(exc),
                metadata=request.metadata,
            )

    def _parse_results(
        self,
        value: Any,
    ) -> list[SearchResult]:

        if isinstance(
            value,
            SearchResponse,
        ):
            return value.results

        if isinstance(
            value,
            dict,
        ):

            value = value.get(
                "results",
                [],
            )

        if not isinstance(
            value,
            list,
        ):
            return []

        results = []

        for item in value:

            if isinstance(
                item,
                SearchResult,
            ):

                results.append(item)

                continue

            if isinstance(
                item,
                dict,
            ):

                results.append(
                    SearchResult(
                        title=str(
                            item.get(
                                "title",
                                "Untitled",
                            )
                        ),
                        url=str(
                            item.get(
                                "url",
                                "",
                            )
                        ),
                        snippet=str(
                            item.get(
                                "snippet",
                                item.get(
                                    "description",
                                    "",
                                ),
                            )
                        ),
                        source=item.get(
                            "source"
                        ),
                        relevance=float(
                            item.get(
                                "relevance",
                                0.0,
                            )
                        ),
                        metadata=dict(
                            item.get(
                                "metadata",
                                {},
                            )
                        ),
                    )
                )

        return results

    @staticmethod
    def rank_results(
        results: list[SearchResult],
        query: str,
    ) -> list[SearchResult]:

        query_words = {
            word.lower()
            for word in query.split()
            if word.strip()
        }

        if not query_words:
            return results

        for result in results:

            text = (
                f"{result.title} "
                f"{result.snippet}"
            ).lower()

            matches = sum(
                word in text
                for word in query_words
            )

            keyword_score = (
                matches / len(query_words)
            )

            result.relevance = max(
                result.relevance,
                keyword_score,
            )

        results.sort(
            key=lambda item: item.relevance,
            reverse=True,
        )

        return results