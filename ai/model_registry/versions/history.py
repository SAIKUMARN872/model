from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable

from .versions import ModelVersion


@dataclass(frozen=True)
class VersionHistoryEntry:
    """
    Immutable record of a model version lifecycle event.
    """

    qualified_id: str
    version: str
    action: str
    timestamp: datetime
    message: str = ""

    @property
    def key(self) -> str:
        return (
            f"{self.qualified_id.strip().lower()}:"
            f"{self.version.strip().lower()}"
        )


class VersionHistory:
    """
    In-memory lifecycle history for model versions.
    """

    def __init__(
        self,
        entries: Iterable[VersionHistoryEntry] | None = None,
    ) -> None:
        self._entries: list[VersionHistoryEntry] = list(
            entries or []
        )

    def record(
        self,
        version: ModelVersion,
        action: str,
        *,
        message: str = "",
        timestamp: datetime | None = None,
    ) -> VersionHistoryEntry:
        if not isinstance(version, ModelVersion):
            raise TypeError(
                "version must be a ModelVersion"
            )

        if not isinstance(action, str):
            raise TypeError(
                "action must be a string"
            )

        action_value = action.strip().lower()

        if not action_value:
            raise ValueError(
                "action cannot be empty"
            )

        entry = VersionHistoryEntry(
            qualified_id=version.qualified_id,
            version=version.version,
            action=action_value,
            timestamp=timestamp
            or datetime.now(timezone.utc),
            message=message,
        )

        self._entries.append(entry)

        return entry

    def list_all(self) -> list[VersionHistoryEntry]:
        return list(self._entries)

    def for_model(
        self,
        qualified_id: str,
    ) -> list[VersionHistoryEntry]:
        value = qualified_id.strip().lower()

        return [
            entry
            for entry in self._entries
            if entry.qualified_id.strip().lower()
            == value
        ]

    def for_version(
        self,
        qualified_id: str,
        version: str,
    ) -> list[VersionHistoryEntry]:
        key = (
            f"{qualified_id.strip().lower()}:"
            f"{version.strip().lower()}"
        )

        return [
            entry
            for entry in self._entries
            if entry.key == key
        ]

    def latest(
        self,
        qualified_id: str,
    ) -> VersionHistoryEntry | None:
        entries = self.for_model(qualified_id)

        if not entries:
            return None

        return max(
            entries,
            key=lambda entry: entry.timestamp,
        )

    def count(self) -> int:
        return len(self._entries)

    def clear(self) -> None:
        self._entries.clear()


__all__ = [
    "VersionHistoryEntry",
    "VersionHistory",
]
