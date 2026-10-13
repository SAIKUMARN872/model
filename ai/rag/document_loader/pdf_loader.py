from __future__ import annotations

from pathlib import Path
from typing import Any

from ai.rag.models import RAGDocument
from ai.rag.document_parser.utils import require_text
from .utils import build_document_id, validate_file_path, file_metadata


def load_pdf(path: str | Path, max_bytes: int = 25 * 1024 * 1024) -> RAGDocument:
    file_path = validate_file_path(path, max_bytes)

    if file_path.suffix.lower() != ".pdf":
        raise ValueError("PDF loader requires a .pdf file")

    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise RuntimeError(
            "PDF support requires pypdf. Install it with: python -m pip install pypdf"
        ) from exc

    try:
        reader = PdfReader(str(file_path), strict=True)
        if reader.is_encrypted:
            raise ValueError("Encrypted PDFs are not supported")

        page_text: list[str] = []
        for page_number, page in enumerate(reader.pages, start=1):
            extracted = page.extract_text() or ""
            if extracted.strip():
                page_text.append(f"[Page {page_number}]\n{extracted}")

        text = require_text("\n\n".join(page_text))
    except (ValueError, RuntimeError):
        raise
    except Exception as exc:
        raise ValueError(f"Unable to read PDF: {file_path.name}") from exc

    metadata: dict[str, Any] = file_metadata(file_path, text)
    metadata.update({"format": "pdf", "page_count": len(reader.pages)})

    return RAGDocument(
        document_id=build_document_id(str(file_path), text),
        text=text,
        metadata=metadata,
    )


load_pdf_file = load_pdf

__all__ = ["load_pdf", "load_pdf_file"]
