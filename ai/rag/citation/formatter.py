from __future__ import annotations

from collections.abc import Sequence

from .citation import Citation
from .utils import citation_marker


def format_inline_citations(citations: Sequence[Citation]) -> str:
    """Format unique citation markers for an answer."""
    markers: list[str] = []
    seen: set[str] = set()

    for citation in citations:
        marker = citation_marker(citation.citation_id)
        if marker not in seen:
            seen.add(marker)
            markers.append(marker)

    return " ".join(markers)


def format_reference(citation: Citation) -> str:
    """Format a single human-readable source reference."""
    parts = [f"{citation_marker(citation.citation_id)}"]

    label = citation.title or citation.source or citation.document_id
    parts.append(label)

    if citation.url:
        parts.append(f"URL: {citation.url}")
    elif citation.source and citation.source != label:
        parts.append(f"Source: {citation.source}")

    if citation.page is not None:
        parts.append(f"Page: {citation.page}")

    return " — ".join(parts)


def format_reference_list(citations: Sequence[Citation]) -> str:
    """Format an ordered reference list without duplicate IDs."""
    lines: list[str] = []
    seen: set[str] = set()

    for citation in citations:
        if citation.citation_id in seen:
            continue
        seen.add(citation.citation_id)
        lines.append(format_reference(citation))

    return "\n".join(lines)


__all__ = [
    "format_inline_citations",
    "format_reference",
    "format_reference_list",
]
