from __future__ import annotations

from dataclasses import dataclass

from .history import VersionHistory
from .versions import ModelVersion, VersionStore


@dataclass(frozen=True)
class MigrationResult:
    """
    Result of a model version migration.
    """

    qualified_id: str
    from_version: str | None
    to_version: str
    migrated: bool


class VersionMigrator:
    """
    Handles controlled model-version activation.

    The migrator updates the in-memory VersionStore and records
    lifecycle events in VersionHistory.
    """

    def __init__(
        self,
        store: VersionStore,
        history: VersionHistory | None = None,
    ) -> None:
        self.store = store
        self.history = history or VersionHistory()

    def migrate(
        self,
        qualified_id: str,
        to_version: str,
    ) -> MigrationResult:
        target = self.store.get(
            qualified_id,
            to_version,
        )

        if target is None:
            raise KeyError(
                f"Unknown target version: "
                f"{qualified_id}:{to_version}"
            )

        current_versions = self.store.active(
            qualified_id
        )

        current = (
            current_versions[0]
            if current_versions
            else None
        )

        if (
            current is not None
            and current.version.strip().lower()
            == target.version.strip().lower()
        ):
            self.history.record(
                target,
                "migration_unchanged",
            )

            return MigrationResult(
                qualified_id=target.qualified_id,
                from_version=current.version,
                to_version=target.version,
                migrated=False,
            )

        if current is not None:
            deactivated = current.deactivate()
            self.store.upsert(deactivated)

            self.history.record(
                deactivated,
                "deactivated",
            )

        activated = target.activate()
        self.store.upsert(activated)

        self.history.record(
            activated,
            "activated",
        )

        self.history.record(
            activated,
            "migration",
            message=(
                f"Migrated from "
                f"{current.version if current else None} "
                f"to {activated.version}"
            ),
        )

        return MigrationResult(
            qualified_id=activated.qualified_id,
            from_version=(
                current.version
                if current is not None
                else None
            ),
            to_version=activated.version,
            migrated=True,
        )

    def rollback(
        self,
        qualified_id: str,
        to_version: str,
    ) -> MigrationResult:
        return self.migrate(
            qualified_id,
            to_version,
        )


__all__ = [
    "MigrationResult",
    "VersionMigrator",
]
