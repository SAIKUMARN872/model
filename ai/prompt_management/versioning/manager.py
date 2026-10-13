from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .history import VersionHistory
from .utils import (
    validate_content,
    validate_metadata,
    validate_prompt_id,
    validate_version_number,
)
from .versions import PromptVersion


class PromptVersionManager:
    """Manage in-memory, append-only versions for multiple prompts."""

    def __init__(self) -> None:
        self._histories: dict[str, VersionHistory] = {}

    def create_version(
        self,
        prompt_id: str,
        content: str,
        *,
        change_note: str = "",
        metadata: Mapping[str, Any] | None = None,
    ) -> PromptVersion:
        prompt_id = validate_prompt_id(prompt_id)
        content = validate_content(content)
        metadata_copy = validate_metadata(metadata)

        if not isinstance(change_note, str):
            raise TypeError("change_note must be a string")

        history = self._histories.get(prompt_id)
        if history is None:
            history = VersionHistory(prompt_id)
            self._histories[prompt_id] = history

        version = PromptVersion.create(
            prompt_id=prompt_id,
            version=len(history) + 1,
            content=content,
            change_note=change_note,
            metadata=metadata_copy,
        )
        history.add(version)
        return version

    def get_version(self, prompt_id: str, version: int) -> PromptVersion:
        prompt_id = validate_prompt_id(prompt_id)
        version = validate_version_number(version)
        history = self._histories.get(prompt_id)
        if history is None:
            raise KeyError(f"Unknown prompt: {prompt_id!r}")
        return history.get(version)

    def latest_version(self, prompt_id: str) -> PromptVersion:
        prompt_id = validate_prompt_id(prompt_id)
        history = self._histories.get(prompt_id)
        if history is None or history.latest() is None:
            raise KeyError(f"No versions found for prompt: {prompt_id!r}")
        return history.latest()

    def list_versions(self, prompt_id: str) -> tuple[PromptVersion, ...]:
        prompt_id = validate_prompt_id(prompt_id)
        history = self._histories.get(prompt_id)
        return history.list_versions() if history else ()

    def restore_version(
        self,
        prompt_id: str,
        version: int,
        *,
        change_note: str | None = None,
    ) -> PromptVersion:
        source = self.get_version(prompt_id, version)
        note = (
            change_note
            if change_note is not None
            else f"Restored from version {source.version}"
        )
        if not isinstance(note, str):
            raise TypeError("change_note must be a string")

        return self.create_version(
            prompt_id=source.prompt_id,
            content=source.content,
            change_note=note,
            metadata=dict(source.metadata),
        )
