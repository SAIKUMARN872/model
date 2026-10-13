"""Coordinate validation and storage of downloaded content."""

from pathlib import Path
from typing import Any

from .handler import DownloadHandler
from .validator import DownloadValidator


class DownloadManager:
    def __init__(
        self,
        handler: DownloadHandler | None = None,
        validator: DownloadValidator | None = None,
    ) -> None:
        if handler is not None and validator is not None:
            raise ValueError("Provide a handler or a validator, not both.")

        self.validator = validator or (
            handler.validator if handler is not None else DownloadValidator()
        )
        self.handler = handler or DownloadHandler(self.validator)

    def save_response(
        self,
        url: str,
        content: bytes,
        destination: str | Path,
        *,
        declared_size: int | None = None,
    ) -> dict[str, Any]:
        validated_url = self.validator.validate_url(url)

        if declared_size is not None:
            self.validator.validate_size(declared_size)
            if declared_size != len(content):
                raise ValueError("Declared download size does not match content size.")

        path = self.handler.save_bytes(content, destination)

        return {
            "success": True,
            "url": validated_url,
            "path": str(path),
            "size_bytes": len(content),
        }
