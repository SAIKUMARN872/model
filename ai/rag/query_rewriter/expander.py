import re

from .normalizer import normalize_query
from .utils import unique_queries


_EXPANSION_TERMS = {
    "rag": ["retrieval augmented generation"],
    "llm": ["large language model"],
    "slm": ["small language model"],
    "mlm": ["medium language model"],
    "ai": ["artificial intelligence"],
    "ml": ["machine learning"],
    "vector database": ["vector store"],
}


def expand_query(query: str, max_queries: int = 3) -> list[str]:
    """Return the original query and useful terminology-based variations."""
    cleaned = normalize_query(query)

    if isinstance(max_queries, bool) or not isinstance(max_queries, int):
        raise TypeError("max_queries must be an integer")

    if max_queries < 1:
        raise ValueError("max_queries must be at least 1")

    candidates = [cleaned]
    lowered = cleaned.casefold()

    for term, expansions in _EXPANSION_TERMS.items():
        pattern = rf"(?<!\w){re.escape(term)}(?!\w)"

        if re.search(pattern, lowered):
            for expansion in expansions:
                candidates.append(f"{cleaned} ({expansion})")

    return unique_queries(candidates)[:max_queries]


class QueryExpander:
    """Reusable query-expansion component."""

    def __init__(self, max_queries: int = 3) -> None:
        if isinstance(max_queries, bool) or not isinstance(max_queries, int):
            raise TypeError("max_queries must be an integer")
        if max_queries < 1:
            raise ValueError("max_queries must be at least 1")

        self.max_queries = max_queries

    def expand(self, query: str) -> list[str]:
        return expand_query(query, self.max_queries)

    def __call__(self, query: str) -> list[str]:
        return self.expand(query)
