from __future__ import annotations

from dataclasses import dataclass
from collections.abc import Sequence

from ai.rag.models import RetrievedDocument

from .window import ContextWindow


@dataclass(frozen=True, slots=True)
class ContextBuildResult:
    context: str
    sources: tuple[RetrievedDocument, ...]
    character_count: int
    truncated_count: int
    omitted_count: int


class ContextBuilder:
    """Build bounded, source-attributed context for a RAG request."""

    def __init__(self, max_chars: int = 12000) -> None:
        self.max_chars = max_chars
        self.window = ContextWindow(max_chars=max_chars)

    def build(
        self,
        sources: Sequence[RetrievedDocument],
    ) -> ContextBuildResult:
        """Build context from ranked sources without reordering them."""
        result = self.window.apply(tuple(sources))

        return ContextBuildResult(
            context=result.context,
            sources=result.sources,
            character_count=result.character_count,
            truncated_count=result.truncated_count,
            omitted_count=len(sources) - len(result.sources),
        )


__all__ = ["ContextBuilder", "ContextBuildResult"]
