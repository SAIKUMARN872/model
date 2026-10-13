from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any

MAX_DOCUMENT_BYTES = 25 * 1024 * 1024
SUPPORTED_TEXT_EXTENSIONS = {".txt", ".md", ".markdown", ".html", ".htm", ".csv", ".json", ".xml"}


def validate_file_path(path: str | Path, max_bytes: int = MAX_DOCUMENT_BYTES) -> Path:
    file_path = Path(path).expanduser()

    if not file_path.exists():
        raise FileNotFoundError(f"Document does not exist: {file_path}")
    if not file_path.is_file():
        raise ValueError(f"Document path is not a file: {file_path}")

    size = file_path.stat().st_size
    if size <= 0:
        raise ValueError(f"Document is empty: {file_path}")
    if size > max_bytes:
        raise ValueError(f"Document exceeds the {max_bytes}-byte limit")

    return file_path.resolve()


def read_text_file(path: str | Path, max_bytes: int = MAX_DOCUMENT_BYTES) -> str:
    file_path = validate_file_path(path, max_bytes)
    raw = file_path.read_bytes()

    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            text = raw.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    else:
        raise ValueError(f"Unable to decode document: {file_path}")

    if not text.strip():
        raise ValueError(f"Document contains no readable text: {file_path}")

    return text


def build_document_id(source: str, content: str) -> str:
    digest = hashlib.sha256(
        f"{source}\0{content}".encode("utf-8", errors="replace")
    ).hexdigest()
    return digest


def file_metadata(path: str | Path, content: str) -> dict[str, Any]:
    file_path = Path(path).expanduser().resolve()
    return {
        "source": str(file_path),
        "filename": file_path.name,
        "extension": file_path.suffix.lower(),
        "size_bytes": file_path.stat().st_size,
        "content_sha256": hashlib.sha256(
            content.encode("utf-8", errors="replace")
        ).hexdigest(),
    }
