from __future__ import annotations

from pathlib import Path
from urllib.parse import urlparse

from ai.rag.models import RAGDocument
from ai.rag.document_parser import parse_file_content
from .pdf_loader import load_pdf
from .utils import (
    SUPPORTED_TEXT_EXTENSIONS,
    build_document_id,
    file_metadata,
    read_text_file,
    validate_file_path,
)
from .web_loader import load_web_page


def load_text_file(
    path: str | Path,
    *,
    max_bytes: int = 25 * 1024 * 1024,
) -> RAGDocument:
    file_path = validate_file_path(path, max_bytes)
    extension = file_path.suffix.lower()

    if extension not in SUPPORTED_TEXT_EXTENSIONS:
        raise ValueError(f"Unsupported text document type: {extension or '(no extension)'}")

    raw_text = read_text_file(file_path, max_bytes)
    text = parse_file_content(raw_text, file_path)
    metadata = file_metadata(file_path, text)
    metadata["format"] = extension.lstrip(".")

    return RAGDocument(
        document_id=build_document_id(str(file_path), text),
        text=text,
        metadata=metadata,
    )


def load_document(source: str | Path) -> RAGDocument:
    value = str(source)
    parsed = urlparse(value)

    if parsed.scheme in {"http", "https"}:
        return load_web_page(value)

    path = Path(source).expanduser()
    extension = path.suffix.lower()

    if extension == ".pdf":
        return load_pdf(path)
    if extension in SUPPORTED_TEXT_EXTENSIONS:
        return load_text_file(path)

    raise ValueError(f"Unsupported document source type: {extension or '(no extension)'}")


__all__ = ["load_document", "load_text_file", "load_pdf", "load_web_page"]
