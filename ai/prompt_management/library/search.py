from __future__ import annotations

from .library import PromptLibrary, PromptLibraryEntry
from .utils import normalize_search_query, validate_identifier


class PromptLibrarySearch:
    def __init__(self, library: PromptLibrary) -> None:
        if not isinstance(library, PromptLibrary):
            raise TypeError("library must be a PromptLibrary instance")
        self._library = library

    def search(
        self,
        tenant_id: str,
        query: str,
        limit: int | None = None,
    ) -> list[PromptLibraryEntry]:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        normalized_query = normalize_search_query(query)

        if limit is not None:
            if isinstance(limit, bool) or not isinstance(limit, int) or limit < 1:
                raise ValueError("limit must be a positive integer")

        if not normalized_query:
            return []

        terms = normalized_query.split()
        matches: list[tuple[int, PromptLibraryEntry]] = []

        for entry in self._library.list_entries(tenant_id):
            fields = (
                entry.name,
                entry.description,
                entry.content,
                *entry.tags,
            )
            searchable_text = " ".join(fields).casefold()
            matched_terms = sum(1 for term in terms if term in searchable_text)

            if matched_terms:
                exact_phrase_bonus = (
                    2 if normalized_query in searchable_text else 0
                )
                matches.append((matched_terms + exact_phrase_bonus, entry))

        matches.sort(
            key=lambda item: (
                -item[0],
                item[1].created_at,
                item[1].entry_id,
            )
        )
        results = [entry for _, entry in matches]
        return results if limit is None else results[:limit]
