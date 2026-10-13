import re

from .utils import validate_query


_WHITESPACE_PATTERN = re.compile(r"\s+")


def normalize_query(query: str) -> str:
    """Normalize whitespace without changing the query's meaning."""
    cleaned = validate_query(query)
    return _WHITESPACE_PATTERN.sub(" ", cleaned)


class QueryNormalizer:
    """Reusable query-normalization component."""

    def normalize(self, query: str) -> str:
        return normalize_query(query)

    def __call__(self, query: str) -> str:
        return self.normalize(query)
