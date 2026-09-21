from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass(frozen=True)
class ModelVersion:
    """
    Canonical version metadata for a ModelNow model.
    """

    qualified_id: str
    version: str
    active: bool = True
    released_at: datetime | None = None
    metadata: dict[str, object] | None = None

    def __post_init__(self) -> None:
        if not isinstance(self.qualified_id, str):
            raise TypeError(
                "qualified_id must be a string"
            )

        if not self.qualified_id.strip():
            raise ValueError(
                "qualified_id cannot be empty"
            )

        if not isinstance(self.version, str):
            raise TypeError(
                "version must be a string"
            )

        if not self.version.strip():
            raise ValueError(
                "version cannot be empty"
            )

    @property
    def key(self) -> str:
        return (
            f"{self.qualified_id.strip().lower()}:"
            f"{self.version.strip().lower()}"
        )

    def activate(self) -> "ModelVersion":
        return ModelVersion(
            qualified_id=self.qualified_id,
            version=self.version,
            active=True,
            released_at=self.released_at
            or datetime.now(timezone.utc),
            metadata=self.metadata,
        )

    def deactivate(self) -> "ModelVersion":
        return ModelVersion(
            qualified_id=self.qualified_id,
            version=self.version,
            active=False,
            released_at=self.released_at,
            metadata=self.metadata,
        )


class VersionStore:
    """
    In-memory model version store.

    Versions are keyed by qualified model ID and version.
    """

    def __init__(
        self,
        versions: list[ModelVersion] | None = None,
    ) -> None:
        self._versions: dict[str, ModelVersion] = {}

        for version in versions or []:
            self.register(version)

    def register(
        self,
        version: ModelVersion,
    ) -> ModelVersion:
        if not isinstance(version, ModelVersion):
            raise TypeError(
                "version must be a ModelVersion"
            )

        if version.key in self._versions:
            raise ValueError(
                f"Version already exists: {version.key}"
            )

        self._versions[version.key] = version

        return version

    def upsert(
        self,
        version: ModelVersion,
    ) -> ModelVersion:
        if not isinstance(version, ModelVersion):
            raise TypeError(
                "version must be a ModelVersion"
            )

        self._versions[version.key] = version

        return version

    def get(
        self,
        qualified_id: str,
        version: str,
    ) -> ModelVersion | None:
        key = (
            f"{qualified_id.strip().lower()}:"
            f"{version.strip().lower()}"
        )

        return self._versions.get(key)

    def list_for_model(
        self,
        qualified_id: str,
    ) -> list[ModelVersion]:
        value = qualified_id.strip().lower()

        return [
            item
            for item in self._versions.values()
            if item.qualified_id.strip().lower()
            == value
        ]

    def active(
        self,
        qualified_id: str,
    ) -> list[ModelVersion]:
        return [
            item
            for item in self.list_for_model(
                qualified_id
            )
            if item.active
        ]

    def remove(
        self,
        qualified_id: str,
        version: str,
    ) -> ModelVersion | None:
        return self._versions.pop(
            (
                f"{qualified_id.strip().lower()}:"
                f"{version.strip().lower()}"
            ),
            None,
        )

    def clear(self) -> None:
        self._versions.clear()

    def count(self) -> int:
        return len(self._versions)


__all__ = [
    "ModelVersion",
    "VersionStore",
]
