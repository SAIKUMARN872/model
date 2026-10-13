from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from types import MappingProxyType
from collections.abc import Mapping
from typing import Any

from .utils import (
    validate_content,
    validate_metadata,
    validate_prompt_id,
    validate_version_number,
)


@dataclass(frozen=True)
class PromptVersion:
    prompt_id: str
    version: int
    content: str
    created_at: datetime
    change_note: str = ""
    metadata: Mapping[str, Any] | None = None
    restored_from: int | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "prompt_id", validate_prompt_id(self.prompt_id))
        object.__setattr__(self, "version", validate_version_number(self.version))
        object.__setattr__(self, "content", validate_content(self.content))

        if not isinstance(self.created_at, datetime):
            raise TypeError("created_at must be a datetime")
        if self.created_at.tzinfo is None:
            raise ValueError("created_at must be timezone-aware")

        if not isinstance(self.change_note, str):
            raise TypeError("change_note must be a string")

        metadata = validate_metadata(self.metadata)
        object.__setattr__(self, "metadata", MappingProxyType(metadata))

        if self.restored_from is not None:
            object.__setattr__(
                self,
                "restored_from",
                validate_version_number(self.restored_from),
            )

    @classmethod
    def create(
        cls,
        prompt_id: str,
        version: int,
        content: str,
        *,
        change_note: str = "",
        metadata: Mapping[str, Any] | None = None,
        restored_from: int | None = None,
    ) -> "PromptVersion":
        return cls(
            prompt_id=prompt_id,
            version=version,
            content=content,
            created_at=datetime.now(timezone.utc),
            change_note=change_note,
            metadata=metadata,
            restored_from=restored_from,
        )
