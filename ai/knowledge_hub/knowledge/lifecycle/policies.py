from dataclasses import dataclass


@dataclass(frozen=True)
class LifecyclePolicy:
    max_file_size_bytes: int = 25 * 1024 * 1024
    allowed_extensions: tuple[str, ...] = (".pdf", ".docx", ".txt", ".md")
    retention_days: int | None = None
