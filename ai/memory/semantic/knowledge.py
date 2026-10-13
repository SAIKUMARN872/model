from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Mapping

from ai.memory.semantic.utils import (
    new_knowledge_id,
    normalize_timestamp,
    utc_now,
    validate_confidence,
    validate_identifier,
    validate_metadata,
    validate_text,
)


@dataclass(frozen=True, slots=True)
class SemanticKnowledge:
    knowledge_id: str
    tenant_id: str
    user_id: str
    content: str
    category: str = "general"
    confidence: float = 0.8
    source: str = "user"
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)
    version: int = 1
    archived: bool = False

    def __post_init__(self) -> None:
        for name in ("knowledge_id", "tenant_id", "user_id", "category", "source"):
            object.__setattr__(
                self, name, validate_identifier(getattr(self, name), name)
            )
        object.__setattr__(self, "content", validate_text(self.content, "content"))
        object.__setattr__(
            self, "confidence", validate_confidence(self.confidence)
        )
        object.__setattr__(self, "metadata", validate_metadata(self.metadata))
        object.__setattr__(
            self, "created_at", normalize_timestamp(self.created_at, "created_at")
        )
        object.__setattr__(
            self, "updated_at", normalize_timestamp(self.updated_at, "updated_at")
        )
        if self.updated_at < self.created_at:
            raise ValueError("updated_at cannot precede created_at")
        if isinstance(self.version, bool) or not isinstance(self.version, int) or self.version < 1:
            raise ValueError("version must be a positive integer")
        if not isinstance(self.archived, bool):
            raise ValueError("archived must be boolean")

    def to_dict(self) -> dict[str, Any]:
        return {
            "knowledge_id": self.knowledge_id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "content": self.content,
            "category": self.category,
            "confidence": self.confidence,
            "source": self.source,
            "metadata": validate_metadata(self.metadata),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "version": self.version,
            "archived": self.archived,
        }

    @classmethod
    def from_dict(cls, payload: Mapping[str, Any]) -> "SemanticKnowledge":
        if not isinstance(payload, Mapping):
            raise ValueError("payload must be a mapping")
        data = dict(payload)
        for name in ("created_at", "updated_at"):
            if isinstance(data.get(name), str):
                try:
                    data[name] = datetime.fromisoformat(data[name])
                except ValueError as exc:
                    raise ValueError(f"invalid {name}") from exc
        return cls(**data)


def create_knowledge(
    tenant_id: str,
    user_id: str,
    content: str,
    *,
    category: str = "general",
    confidence: float = 0.8,
    source: str = "user",
    metadata: Mapping[str, Any] | None = None,
) -> SemanticKnowledge:
    return SemanticKnowledge(
        knowledge_id=new_knowledge_id(),
        tenant_id=tenant_id,
        user_id=user_id,
        content=content,
        category=category,
        confidence=confidence,
        source=source,
        metadata=validate_metadata(metadata),
    )
