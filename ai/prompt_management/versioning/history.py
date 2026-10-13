from __future__ import annotations

from .utils import validate_prompt_id, validate_version_number
from .versions import PromptVersion


class VersionHistory:
    """Ordered, append-only history for one prompt."""

    def __init__(self, prompt_id: str) -> None:
        self.prompt_id = validate_prompt_id(prompt_id)
        self._versions: list[PromptVersion] = []

    def add(self, version: PromptVersion) -> None:
        if not isinstance(version, PromptVersion):
            raise TypeError("version must be a PromptVersion")
        if version.prompt_id != self.prompt_id:
            raise ValueError("version belongs to a different prompt")
        expected = len(self._versions) + 1
        if version.version != expected:
            raise ValueError(
                f"Expected version {expected}, received {version.version}"
            )
        self._versions.append(version)

    def get(self, version: int) -> PromptVersion:
        version = validate_version_number(version)
        if version > len(self._versions):
            raise KeyError(
                f"Prompt {self.prompt_id!r} has no version {version}"
            )
        return self._versions[version - 1]

    def latest(self) -> PromptVersion | None:
        return self._versions[-1] if self._versions else None

    def list_versions(self) -> tuple[PromptVersion, ...]:
        return tuple(self._versions)

    def __len__(self) -> int:
        return len(self._versions)
