"""In-memory searchable index for MCP tools and resources."""
from threading import RLock
from collections.abc import Iterable, Mapping
from ai.mcp.discovery.utils import normalize_query, score_match


class MCPDiscoveryIndexer:
    def __init__(self) -> None:
        self._items: list[dict] = []
        self._lock = RLock()

    def rebuild(self, items: Iterable[Mapping]) -> int:
        prepared = []
        for item in items:
            if not isinstance(item, Mapping):
                raise TypeError("Every indexed item must be a mapping.")
            prepared.append(dict(item))
        with self._lock:
            self._items = prepared
        return len(prepared)

    def add(self, item: Mapping) -> None:
        if not isinstance(item, Mapping):
            raise TypeError("Indexed item must be a mapping.")
        with self._lock:
            self._items.append(dict(item))

    def all_items(self) -> list[dict]:
        with self._lock:
            return [dict(item) for item in self._items]

    def search(
        self,
        query: str = "",
        *,
        kind: str | None = None,
        tags: Iterable[str] | None = None,
        limit: int = 50,
    ) -> list[dict]:
        normalized = normalize_query(query)
        if not isinstance(limit, int) or isinstance(limit, bool) or limit < 1:
            raise ValueError("limit must be a positive integer.")
        wanted_tags = {
            normalize_query(tag) for tag in (tags or ())
        }
        if kind is not None and kind not in {"tool", "resource"}:
            raise ValueError("kind must be 'tool', 'resource', or None.")

        with self._lock:
            items = [dict(item) for item in self._items]

        matches = []
        for item in items:
            if kind and item.get("kind") != kind:
                continue
            item_tags = {
                normalize_query(str(tag)) for tag in item.get("tags", ())
            }
            if wanted_tags and not wanted_tags.issubset(item_tags):
                continue
            score = score_match(normalized, item) if normalized else 1
            if normalized and score == 0:
                continue
            item["_score"] = score
            matches.append(item)

        matches.sort(
            key=lambda item: (
                -item["_score"],
                str(item.get("name", "")).casefold(),
                str(item.get("uri", "")).casefold(),
            )
        )
        return matches[:limit]
