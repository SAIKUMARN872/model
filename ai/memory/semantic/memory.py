from __future__ import annotations

import threading
from dataclasses import replace
from datetime import datetime
from typing import Any, Mapping

from ai.memory.semantic.knowledge import SemanticKnowledge, create_knowledge
from ai.memory.semantic.utils import (
    validate_confidence,
    validate_identifier,
    validate_metadata,
    validate_text,
    utc_now,
)


class SemanticMemory:
    def __init__(self) -> None:
        self._records: dict[tuple[str, str, str], SemanticKnowledge] = {}
        self._fingerprints: dict[tuple[str, str, str], str] = {}
        self._lock = threading.RLock()

    @staticmethod
    def _scope(tenant_id: str, user_id: str) -> tuple[str, str]:
        return (
            validate_identifier(tenant_id, "tenant_id"),
            validate_identifier(user_id, "user_id"),
        )

    @staticmethod
    def _fingerprint(content: str, category: str) -> str:
        return f"{category.casefold()}\x1f{content.casefold()}"

    def add(
        self,
        tenant_id: str,
        user_id: str,
        content: str,
        *,
        category: str = "general",
        confidence: float = 0.8,
        source: str = "user",
        metadata: Mapping[str, Any] | None = None,
        deduplicate: bool = True,
    ) -> SemanticKnowledge:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        content = validate_text(content, "content")
        category = validate_identifier(category, "category")
        confidence = validate_confidence(confidence)
        safe_metadata = validate_metadata(metadata)
        if not isinstance(deduplicate, bool):
            raise ValueError("deduplicate must be boolean")

        fingerprint = self._fingerprint(content, category)
        scope_key = (tenant_id, user_id, fingerprint)

        with self._lock:
            if deduplicate:
                existing_id = self._fingerprints.get(scope_key)
                if existing_id is not None:
                    existing_key = (tenant_id, user_id, existing_id)
                    existing = self._records.get(existing_key)
                    if existing is not None and not existing.archived:
                        return SemanticKnowledge.from_dict(existing.to_dict())

            record = create_knowledge(
                tenant_id,
                user_id,
                content,
                category=category,
                confidence=confidence,
                source=source,
                metadata=safe_metadata,
            )
            key = (tenant_id, user_id, record.knowledge_id)
            self._records[key] = record
            if not record.archived:
                self._fingerprints[scope_key] = record.knowledge_id
            return SemanticKnowledge.from_dict(record.to_dict())

    def get(
        self, tenant_id: str, user_id: str, knowledge_id: str
    ) -> SemanticKnowledge | None:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        knowledge_id = validate_identifier(knowledge_id, "knowledge_id")
        with self._lock:
            record = self._records.get((tenant_id, user_id, knowledge_id))
            return SemanticKnowledge.from_dict(record.to_dict()) if record else None

    def update(
        self,
        tenant_id: str,
        user_id: str,
        knowledge_id: str,
        *,
        expected_version: int,
        content: str | None = None,
        category: str | None = None,
        confidence: float | None = None,
        source: str | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> SemanticKnowledge:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        knowledge_id = validate_identifier(knowledge_id, "knowledge_id")
        if isinstance(expected_version, bool) or not isinstance(expected_version, int) or expected_version < 1:
            raise ValueError("expected_version must be a positive integer")

        key = (tenant_id, user_id, knowledge_id)
        with self._lock:
            current = self._records.get(key)
            if current is None:
                raise KeyError("semantic knowledge not found")
            if current.version != expected_version:
                raise ValueError(
                    f"version conflict: expected {expected_version}, found {current.version}"
                )

            updated_content = (
                validate_text(content, "content") if content is not None else current.content
            )
            updated_category = (
                validate_identifier(category, "category")
                if category is not None else current.category
            )
            updated_confidence = (
                validate_confidence(confidence)
                if confidence is not None else current.confidence
            )
            updated_source = (
                validate_identifier(source, "source") if source is not None else current.source
            )
            updated_metadata = dict(current.metadata)
            if metadata is not None:
                updated_metadata.update(validate_metadata(metadata))

            updated = replace(
                current,
                content=updated_content,
                category=updated_category,
                confidence=updated_confidence,
                source=updated_source,
                metadata=validate_metadata(updated_metadata),
                updated_at=max(utc_now(), current.updated_at),
                version=current.version + 1,
            )

            old_fp = self._fingerprint(current.content, current.category)
            old_fp_key = (tenant_id, user_id, old_fp)
            if self._fingerprints.get(old_fp_key) == knowledge_id:
                self._fingerprints.pop(old_fp_key, None)

            new_fp_key = (
                tenant_id, user_id,
                self._fingerprint(updated.content, updated.category),
            )
            existing_id = self._fingerprints.get(new_fp_key)
            if existing_id is not None and existing_id != knowledge_id:
                other = self._records.get((tenant_id, user_id, existing_id))
                if other is not None and not other.archived:
                    raise ValueError("equivalent semantic knowledge already exists")

            self._records[key] = updated
            if not updated.archived:
                self._fingerprints[new_fp_key] = knowledge_id
            return SemanticKnowledge.from_dict(updated.to_dict())

    def archive(
        self, tenant_id: str, user_id: str, knowledge_id: str, *, expected_version: int
    ) -> SemanticKnowledge:
        current = self.get(tenant_id, user_id, knowledge_id)
        if current is None:
            raise KeyError("semantic knowledge not found")
        if current.version != expected_version:
            raise ValueError("version conflict")
        if current.archived:
            return current
        return self._set_archived(
            current, archived=True
        )

    def restore(
        self, tenant_id: str, user_id: str, knowledge_id: str, *, expected_version: int
    ) -> SemanticKnowledge:
        current = self.get(tenant_id, user_id, knowledge_id)
        if current is None:
            raise KeyError("semantic knowledge not found")
        if current.version != expected_version:
            raise ValueError("version conflict")
        if not current.archived:
            return current
        return self._set_archived(current, archived=False)

    def _set_archived(
        self, current: SemanticKnowledge, *, archived: bool
    ) -> SemanticKnowledge:
        tenant_id, user_id, knowledge_id = (
            current.tenant_id, current.user_id, current.knowledge_id
        )
        key = (tenant_id, user_id, knowledge_id)
        with self._lock:
            latest = self._records.get(key)
            if latest is None or latest.version != current.version:
                raise ValueError("version conflict")
            updated = replace(
                latest,
                archived=archived,
                updated_at=max(utc_now(), latest.updated_at),
                version=latest.version + 1,
            )
            fingerprint_key = (
                tenant_id, user_id,
                self._fingerprint(updated.content, updated.category),
            )
            if archived:
                if self._fingerprints.get(fingerprint_key) == knowledge_id:
                    self._fingerprints.pop(fingerprint_key, None)
            else:
                existing_id = self._fingerprints.get(fingerprint_key)
                if existing_id is not None and existing_id != knowledge_id:
                    existing = self._records.get((tenant_id, user_id, existing_id))
                    if existing is not None and not existing.archived:
                        raise ValueError("equivalent semantic knowledge already exists")
                self._fingerprints[fingerprint_key] = knowledge_id
            self._records[key] = updated
            return SemanticKnowledge.from_dict(updated.to_dict())

    def list(
        self,
        tenant_id: str,
        user_id: str,
        *,
        category: str | None = None,
        include_archived: bool = False,
        limit: int = 100,
    ) -> list[SemanticKnowledge]:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        if category is not None:
            category = validate_identifier(category, "category")
        if not isinstance(include_archived, bool):
            raise ValueError("include_archived must be boolean")
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 1000:
            raise ValueError("limit must be an integer between 1 and 1000")
        with self._lock:
            records = [
                record for (tenant, user, _), record in self._records.items()
                if tenant == tenant_id and user == user_id
                and (include_archived or not record.archived)
                and (category is None or record.category == category)
            ]
            records.sort(
                key=lambda item: (item.updated_at, item.knowledge_id), reverse=True
            )
            return [SemanticKnowledge.from_dict(r.to_dict()) for r in records[:limit]]

    def delete(self, tenant_id: str, user_id: str, knowledge_id: str) -> bool:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        knowledge_id = validate_identifier(knowledge_id, "knowledge_id")
        key = (tenant_id, user_id, knowledge_id)
        with self._lock:
            record = self._records.pop(key, None)
            if record is None:
                return False
            fp_key = (
                tenant_id, user_id,
                self._fingerprint(record.content, record.category),
            )
            if self._fingerprints.get(fp_key) == knowledge_id:
                self._fingerprints.pop(fp_key, None)
            return True

    def count(
        self, tenant_id: str, user_id: str, *, include_archived: bool = False
    ) -> int:
        return len(
            self.list(
                tenant_id, user_id,
                include_archived=include_archived, limit=1000,
            )
        )
