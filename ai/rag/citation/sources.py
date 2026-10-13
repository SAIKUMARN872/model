from __future__ import annotations

from collections.abc import Sequence

from ai.rag.models import RetrievedDocument

from .citation import Citation
from .utils import metadata_value, validate_citation_id


def extract_citations(
    sources: Sequence[RetrievedDocument],
) -> tuple[Citation, ...]:
    """Convert retrieved documents into unique, ordered citations."""
    citations: list[Citation] = []
    seen_document_ids: set[str] = set()

    for item in sources:
        document = item.document
        document_id = document.document_id.strip()

        if not document_id:
            raise ValueError("Retrieved document ID cannot be empty.")
        if document_id in seen_document_ids:
            continue

        seen_document_ids.add(document_id)
        metadata = dict(document.metadata)

        title = metadata_value(metadata, "title", "name")
        source = metadata_value(
            metadata, "source", "filename", "file_path", "path"
        )
        url = metadata_value(metadata, "url", "source_url", "uri")
        raw_page = metadata.get("page", metadata.get("page_number"))

        page: int | str | None = None
        if isinstance(raw_page, int) and not isinstance(raw_page, bool):
            if raw_page >= 1:
                page = raw_page
            else:
                page = str(raw_page)
        elif raw_page is not None and str(raw_page).strip():
            page = str(raw_page).strip()

        citation_id = validate_citation_id(document_id)

        citations.append(
            Citation(
                citation_id=citation_id,
                document_id=document_id,
                title=title,
                source=source,
                url=url,
                page=page,
                score=float(item.score),
                metadata=metadata,
            )
        )

    return tuple(citations)


__all__ = ["extract_citations"]
