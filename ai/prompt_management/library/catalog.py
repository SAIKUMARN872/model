from __future__ import annotations

from typing import Any

from .library import PromptLibrary, PromptLibraryEntry
from .search import PromptLibrarySearch


class PromptLibraryCatalog:
    def __init__(self, library: PromptLibrary | None = None) -> None:
        self.library = library if library is not None else PromptLibrary()
        self.search_engine = PromptLibrarySearch(self.library)

    def add(self, tenant_id: str, name: str, content: str, **kwargs: Any) -> PromptLibraryEntry:
        return self.library.create(
            tenant_id=tenant_id,
            name=name,
            content=content,
            **kwargs,
        )

    def get(self, tenant_id: str, entry_id: str) -> PromptLibraryEntry:
        return self.library.get(tenant_id, entry_id)

    def list(
        self,
        tenant_id: str,
        tag: str | None = None,
        limit: int | None = None,
    ) -> list[PromptLibraryEntry]:
        return self.library.list_entries(tenant_id, tag=tag, limit=limit)

    def search(
        self,
        tenant_id: str,
        query: str,
        limit: int | None = None,
    ) -> list[PromptLibraryEntry]:
        return self.search_engine.search(tenant_id, query, limit=limit)

    def update(
        self,
        tenant_id: str,
        entry_id: str,
        **changes: Any,
    ) -> PromptLibraryEntry:
        return self.library.update(tenant_id, entry_id, **changes)

    def remove(self, tenant_id: str, entry_id: str) -> bool:
        return self.library.delete(tenant_id, entry_id)
