from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping


@dataclass(frozen=True, slots=True)
class Citation:
    """A formatted reference to a retrieved RAG source."""

    citation_id: str
    document_id: str
    title: str | None = None
    source: str | None = None
    url: str | None = None
    page: int | str | None = None
    score: float | None = None
    metadata: Mapping[str, Any] | None = None

    def __post_init__(self) -> None:
        if not self.citation_id.strip():
            raise ValueError("Citation ID cannot be empty.")
        if not self.document_id.strip():
            raise ValueError("Citation document ID cannot be empty.")
        if self.page is not None and isinstance(self.page, bool):
            raise TypeError("Citation page cannot be a boolean.")
        if isinstance(self.page, int) and self.page < 1:
            raise ValueError("Citation page must be at least 1.")
        if isinstance(self.page, str) and not self.page.strip():
            raise ValueError("Citation page cannot be an empty string.")


__all__ = ["Citation"]
