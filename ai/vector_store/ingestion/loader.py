"""Load text from strings and supported local files."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from ai.vector_store.ingestion.utils import (
    normalize_text,
    source_id_for_path,
    validate_extension,
)


@dataclass(frozen=True)
class LoadedSource:
    source_id: str
    text: str
    source_name: str
    source_path: str | None = None


class SourceLoader:
    """Load plain-text content without requiring external APIs."""

    def load_text(
        self,
        text: str,
        *,
        source_id: str = "inline",
        source_name: str = "inline",
    ) -> LoadedSource:
        normalized = normalize_text(text)
        if not normalized:
            raise ValueError("Source text is empty after normalization")
        if not isinstance(source_id, str) or not source_id.strip():
            raise ValueError("source_id must be a non-empty string")
        if not isinstance(source_name, str) or not source_name.strip():
            raise ValueError("source_name must be a non-empty string")

        return LoadedSource(
            source_id=source_id.strip(),
            text=normalized,
            source_name=source_name.strip(),
        )

    def load_file(self, path: str | Path) -> LoadedSource:
        file_path = Path(path).expanduser()

        if not file_path.exists():
            raise FileNotFoundError(f"Source file not found: {file_path}")
        if not file_path.is_file():
            raise ValueError(f"Source path is not a file: {file_path}")

        validate_extension(file_path)
        text = file_path.read_text(encoding="utf-8-sig")
        loaded = self.load_text(
            text,
            source_id=source_id_for_path(file_path),
            source_name=file_path.name,
        )

        return LoadedSource(
            source_id=loaded.source_id,
            text=loaded.text,
            source_name=loaded.source_name,
            source_path=str(file_path.resolve()),
        )

    def load_files(
        self,
        paths: list[str | Path],
    ) -> list[LoadedSource]:
        if isinstance(paths, (str, bytes)):
            raise TypeError("paths must be a list of file paths")
        return [self.load_file(path) for path in paths]
