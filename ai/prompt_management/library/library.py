from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from threading import RLock
from typing import Any
from uuid import uuid4

from .utils import (
    normalize_tags,
    normalize_text,
    validate_identifier,
    validate_metadata,
)


@dataclass(frozen=True)
class PromptLibraryEntry:
    entry_id: str
    tenant_id: str
    name: str
    description: str
    content: str
    tags: tuple[str, ...]
    metadata: dict[str, Any]
    created_at: datetime
    updated_at: datetime


class PromptLibrary:
    """Thread-safe, in-memory prompt library with tenant isolation."""

    def __init__(self) -> None:
        self._entries: dict[str, PromptLibraryEntry] = {}
        self._lock = RLock()

    @staticmethod
    def _copy(entry: PromptLibraryEntry) -> PromptLibraryEntry:
        return PromptLibraryEntry(
            entry_id=entry.entry_id,
            tenant_id=entry.tenant_id,
            name=entry.name,
            description=entry.description,
            content=entry.content,
            tags=tuple(entry.tags),
            metadata=validate_metadata(entry.metadata),
            created_at=entry.created_at,
            updated_at=entry.updated_at,
        )

    def create(
        self,
        tenant_id: str,
        name: str,
        content: str,
        description: str = "",
        tags: list[str] | tuple[str, ...] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> PromptLibraryEntry:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        name = normalize_text(name, "name")
        content = normalize_text(content, "content")

        if not isinstance(description, str):
            raise TypeError("description must be a string")

        description = description.strip()
        normalized_tags = normalize_tags(tags)
        normalized_metadata = validate_metadata(metadata)
        now = datetime.now(timezone.utc)

        entry = PromptLibraryEntry(
            entry_id=str(uuid4()),
            tenant_id=tenant_id,
            name=name,
            description=description,
            content=content,
            tags=normalized_tags,
            metadata=normalized_metadata,
            created_at=now,
            updated_at=now,
        )

        with self._lock:
            self._entries[entry.entry_id] = self._copy(entry)
            return self._copy(entry)

    def get(self, tenant_id: str, entry_id: str) -> PromptLibraryEntry:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        entry_id = validate_identifier(entry_id, "entry_id")

        with self._lock:
            entry = self._entries.get(entry_id)
            if entry is None or entry.tenant_id != tenant_id:
                raise KeyError(f"Library entry not found: {entry_id}")
            return self._copy(entry)

    def list_entries(
        self,
        tenant_id: str,
        tag: str | None = None,
        limit: int | None = None,
    ) -> list[PromptLibraryEntry]:
        tenant_id = validate_identifier(tenant_id, "tenant_id")

        if limit is not None:
            if isinstance(limit, bool) or not isinstance(limit, int) or limit < 1:
                raise ValueError("limit must be a positive integer")

        normalized_tag = None
        if tag is not None:
            normalized_tag = normalize_text(tag, "tag").casefold()

        with self._lock:
            entries = [
                entry for entry in self._entries.values()
                if entry.tenant_id == tenant_id
                and (
                    normalized_tag is None
                    or any(t.casefold() == normalized_tag for t in entry.tags)
                )
            ]
            entries.sort(key=lambda entry: (entry.created_at, entry.entry_id))
            if limit is not None:
                entries = entries[:limit]
            return [self._copy(entry) for entry in entries]

    def update(
        self,
        tenant_id: str,
        entry_id: str,
        *,
        name: str | None = None,
        content: str | None = None,
        description: str | None = None,
        tags: list[str] | tuple[str, ...] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> PromptLibraryEntry:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        entry_id = validate_identifier(entry_id, "entry_id")

        with self._lock:
            current = self._entries.get(entry_id)
            if current is None or current.tenant_id != tenant_id:
                raise KeyError(f"Library entry not found: {entry_id}")

            new_name = current.name if name is None else normalize_text(name, "name")
            new_content = (
                current.content if content is None
                else normalize_text(content, "content")
            )

            if description is None:
                new_description = current.description
            elif isinstance(description, str):
                new_description = description.strip()
            else:
                raise TypeError("description must be a string")

            new_tags = current.tags if tags is None else normalize_tags(tags)
            new_metadata = (
                validate_metadata(current.metadata)
                if metadata is None else validate_metadata(metadata)
            )

            updated = PromptLibraryEntry(
                entry_id=current.entry_id,
                tenant_id=current.tenant_id,
                name=new_name,
                description=new_description,
                content=new_content,
                tags=new_tags,
                metadata=new_metadata,
                created_at=current.created_at,
                updated_at=datetime.now(timezone.utc),
            )
            self._entries[entry_id] = self._copy(updated)
            return self._copy(updated)

    def delete(self, tenant_id: str, entry_id: str) -> bool:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        entry_id = validate_identifier(entry_id, "entry_id")

        with self._lock:
            current = self._entries.get(entry_id)
            if current is None or current.tenant_id != tenant_id:
                raise KeyError(f"Library entry not found: {entry_id}")
            del self._entries[entry_id]
            return True

    def count(self, tenant_id: str) -> int:
        return len(self.list_entries(tenant_id))
