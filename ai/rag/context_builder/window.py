from __future__ import annotations

from dataclasses import dataclass

from ai.rag.models import RAGDocument, RetrievedDocument

from .compressor import truncate_text
from .utils import format_source_section, validate_max_chars


@dataclass(frozen=True, slots=True)
class ContextWindowResult:
    context: str
    sources: tuple[RetrievedDocument, ...]
    character_count: int
    truncated_count: int


class ContextWindow:
    """Build a source-aware context that respects a character budget."""

    def __init__(self, max_chars: int = 12000) -> None:
        self.max_chars = validate_max_chars(max_chars)

    def apply(
        self,
        sources: list[RetrievedDocument] | tuple[RetrievedDocument, ...],
    ) -> ContextWindowResult:
        sections: list[str] = []
        selected: list[RetrievedDocument] = []
        used_chars = 0
        truncated_count = 0

        for item in sources:
            separator = "\n\n" if sections else ""
            header = f"[Source: {item.document.document_id}]\n"
            remaining = self.max_chars - used_chars - len(separator)

            if remaining <= len(header):
                break

            text_budget = remaining - len(header)
            original_text = item.document.text
            text = truncate_text(original_text, text_budget)

            if not text.strip():
                break

            is_truncated = len(text) < len(original_text)
            document = item.document

            if is_truncated:
                document = RAGDocument(
                    document_id=item.document.document_id,
                    text=text,
                    metadata=dict(item.document.metadata),
                )
                truncated_count += 1

            selected_item = RetrievedDocument(
                document=document,
                score=item.score,
                rank=item.rank,
            )

            section = format_source_section(selected_item)
            sections.append(section)
            selected.append(selected_item)
            used_chars += len(separator) + len(section)

            if is_truncated:
                break

        context = "\n\n".join(sections)

        return ContextWindowResult(
            context=context,
            sources=tuple(selected),
            character_count=len(context),
            truncated_count=truncated_count,
        )


__all__ = ["ContextWindow", "ContextWindowResult"]
