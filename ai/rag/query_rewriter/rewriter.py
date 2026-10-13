from dataclasses import dataclass

from .expander import QueryExpander
from .normalizer import QueryNormalizer


@dataclass(frozen=True)
class QueryRewriteResult:
    original_query: str
    normalized_query: str
    queries: tuple[str, ...]

    @property
    def expanded_queries(self) -> tuple[str, ...]:
        return self.queries[1:]


class QueryRewriter:
    """Normalize a query and optionally generate retrieval variations."""

    def __init__(
        self,
        expand: bool = True,
        max_queries: int = 3,
    ) -> None:
        if not isinstance(expand, bool):
            raise TypeError("expand must be a boolean")

        self.expand_enabled = expand
        self.normalizer = QueryNormalizer()
        self.expander = QueryExpander(max_queries=max_queries)

    def rewrite(self, query: str) -> QueryRewriteResult:
        normalized = self.normalizer.normalize(query)

        if self.expand_enabled:
            queries = self.expander.expand(normalized)
        else:
            queries = [normalized]

        return QueryRewriteResult(
            original_query=query,
            normalized_query=normalized,
            queries=tuple(queries),
        )

    def __call__(self, query: str) -> QueryRewriteResult:
        return self.rewrite(query)


def rewrite_query(
    query: str,
    expand: bool = True,
    max_queries: int = 3,
) -> QueryRewriteResult:
    """Convenience function for rewriting one query."""
    return QueryRewriter(
        expand=expand,
        max_queries=max_queries,
    ).rewrite(query)
