"""Validation rules for browser download destinations and content."""

from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit


class DownloadValidationError(ValueError):
    """Raised when a download violates a configured safety policy."""


@dataclass(frozen=True)
class DownloadValidator:
    max_bytes: int = 25 * 1024 * 1024
    allowed_extensions: tuple[str, ...] = ()
    allow_overwrite: bool = False

    def __post_init__(self) -> None:
        if isinstance(self.max_bytes, bool) or not isinstance(self.max_bytes, int):
            raise DownloadValidationError("max_bytes must be an integer.")
        if self.max_bytes <= 0:
            raise DownloadValidationError("max_bytes must be positive.")

        normalized = tuple(
            extension.lower() if extension.startswith(".")
            else "." + extension.lower()
            for extension in self.allowed_extensions
        )
        if any(
            not extension[1:]
            or any(char in extension for char in ("/", "\\", "\x00"))
            for extension in normalized
        ):
            raise DownloadValidationError("Invalid allowed file extension.")

        object.__setattr__(self, "allowed_extensions", normalized)

    def validate_url(self, url: str) -> str:
        if not isinstance(url, str) or not url.strip():
            raise DownloadValidationError("Download URL is required.")

        parsed = urlsplit(url.strip())
        if parsed.scheme.lower() != "https" or not parsed.hostname:
            raise DownloadValidationError("Only HTTPS download URLs are accepted.")

        if parsed.username is not None or parsed.password is not None:
            raise DownloadValidationError("URLs containing credentials are not allowed.")

        if parsed.hostname.lower() in {"localhost", "localhost.localdomain"}:
            raise DownloadValidationError("Localhost download URLs are not allowed.")

        return url.strip()

    def validate_destination(self, destination: str | Path) -> Path:
        if not isinstance(destination, (str, Path)) or not str(destination).strip():
            raise DownloadValidationError("A destination path is required.")

        path = Path(destination).expanduser().resolve()
        if path.exists() and path.is_dir():
            raise DownloadValidationError("Destination must be a file path.")

        if self.allowed_extensions and path.suffix.lower() not in self.allowed_extensions:
            raise DownloadValidationError("File extension is not allowed.")

        if path.exists() and not self.allow_overwrite:
            raise DownloadValidationError("Destination already exists.")

        return path

    def validate_size(self, size: int) -> None:
        if isinstance(size, bool) or not isinstance(size, int) or size < 0:
            raise DownloadValidationError("Download size must be a non-negative integer.")

        if size > self.max_bytes:
            raise DownloadValidationError("Download exceeds the configured size limit.")
