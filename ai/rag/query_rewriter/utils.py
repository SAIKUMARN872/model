from collections.abc import Iterable


def validate_query(query: str) -> str:
    """Validate a query and return its whitespace-trimmed value."""
    if not isinstance(query, str):
        raise TypeError("query must be a string")

    cleaned = query.strip()
    if not cleaned:
        raise ValueError("query must not be empty")

    return cleaned


def unique_queries(queries: Iterable[str]) -> list[str]:
    """Remove duplicate queries while preserving their original order."""
    if isinstance(queries, (str, bytes)):
        raise TypeError("queries must be an iterable of strings, not a string")

    result: list[str] = []
    seen: set[str] = set()

    for query in queries:
        if not isinstance(query, str):
            raise TypeError("every query must be a string")

        cleaned = query.strip()
        if not cleaned:
            continue

        key = cleaned.casefold()
        if key not in seen:
            seen.add(key)
            result.append(cleaned)

    return result
