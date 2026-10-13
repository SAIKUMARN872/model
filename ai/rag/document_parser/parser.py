from __future__ import annotations

from pathlib import Path

from .html import parse_html
from .markdown import parse_markdown
from .utils import require_text


def parse_document(text: str, file_type: str = "txt") -> str:
    extension = file_type.lower().strip()
    if extension.startswith("."):
        extension = extension[1:]

    if extension in {"html", "htm"}:
        result = parse_html(text)
    elif extension in {"md", "markdown"}:
        result = parse_markdown(text)
    elif extension in {"txt", "text", "csv", "json", "xml", "log"}:
        result = text
    else:
        raise ValueError(f"Unsupported document type: {file_type}")

    return require_text(result)


def parse_file_content(text: str, filename: str | Path) -> str:
    return parse_document(text, Path(filename).suffix)
