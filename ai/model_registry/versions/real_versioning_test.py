from __future__ import annotations

from datetime import datetime, timezone

from ai.model_registry.versions.history import VersionHistory
from ai.model_registry.versions.migration import (
    MigrationResult,
    VersionMigrator,
)
from ai.model_registry.versions.utils import (
    active_versions,
    latest_version,
    normalize_version,
    sort_versions,
    version_exists,
)
from ai.model_registry.versions.versions import (
    ModelVersion,
    VersionStore,
)


def make_version(
    qualified_id: str,
    version: str,
    *,
    active: bool = False,
) -> ModelVersion:
    return ModelVersion(
        qualified_id=qualified_id,
        version=version,
        active=active,
        metadata={
            "source": "real-integration-test",
            "version": version,
        },
    )


def main() -> None:
    print("=" * 100)
    print("MODELNOW REAL MODEL VERSIONING INTEGRATION TEST")
    print("=" * 100)

    qualified_id = "modelnow:enterprise-model"

    v1 = make_version(
        qualified_id,
        "1.0.0",
        active=True,
    )

    v2 = make_version(
        qualified_id,
        "2.0.0",
        active=False,
    )

    v3 = make_version(
        qualified_id,
        "3.0.0",
        active=False,
    )

    # 1. Model version creation
    assert v1.qualified_id == qualified_id
    assert v1.version == "1.0.0"
    assert v1.active is True
    assert v1.key == (
        "modelnow:enterprise-model:1.0.0"
    )

    print("TEST 1 - MODEL VERSION CREATION: PASS")

    # 2. Version normalization
    normalized = ModelVersion(
        qualified_id=" ModelNow:Enterprise-Model ",
        version=" V1.0.0 ",
    )

    assert normalized.key == (
        "modelnow:enterprise-model:v1.0.0"
    )

    assert normalize_version(
        " 2.0.0 "
    ) == "2.0.0"

    print("TEST 2 - VERSION NORMALIZATION: PASS")

    # 3. Version store registration
    store = VersionStore(
        [
            v1,
            v2,
            v3,
        ]
    )

    assert store.count() == 3

    print("TEST 3 - VERSION STORE REGISTRATION: PASS")
    print(f"  Stored versions: {store.count()}")

    # 4. Case-insensitive version lookup
    assert store.get(
        "MODELNOW:ENTERPRISE-MODEL",
        "1.0.0",
    ) == v1

    assert store.get(
        qualified_id,
        "V2.0.0",
    ) is None

    print("TEST 4 - VERSION STORE LOOKUP: PASS")

    # 5. Model version listing
    versions = store.list_for_model(
        qualified_id
    )

    assert len(versions) == 3
    assert {
        item.version
        for item in versions
    } == {
        "1.0.0",
        "2.0.0",
        "3.0.0",
    }

    print("TEST 5 - MODEL VERSION LISTING: PASS")

    # 6. Active version state
    active = store.active(
        qualified_id
    )

    assert len(active) == 1
    assert active[0].version == "1.0.0"

    print("TEST 6 - ACTIVE VERSION STATE: PASS")

    # 7. Version ordering
    ordered = sort_versions(
        [
            v3,
            v1,
            v2,
        ]
    )

    assert [
        item.version
        for item in ordered
    ] == [
        "1.0.0",
        "2.0.0",
        "3.0.0",
    ]

    assert latest_version(
        [
            v1,
            v3,
            v2,
        ]
    ) == v3

    print("TEST 7 - VERSION ORDERING: PASS")
    print("  Latest version: 3.0.0")

    # 8. Version existence + active utility
    assert version_exists(
        [
            v1,
            v2,
            v3,
        ],
        "2.0.0",
    )

    assert not version_exists(
        [
            v1,
            v2,
            v3,
        ],
        "4.0.0",
    )

    assert active_versions(
        [
            v1,
            v2,
            v3,
        ]
    ) == [v1]

    print("TEST 8 - VERSION UTILITY FUNCTIONS: PASS")

    # 9. Lifecycle history registration
    history = VersionHistory()

    initial_timestamp = datetime(
        2026,
        10,
        8,
        10,
        0,
        tzinfo=timezone.utc,
    )

    initial_entry = history.record(
        v1,
        "activated",
        message="Initial production version",
        timestamp=initial_timestamp,
    )

    assert initial_entry.key == v1.key
    assert initial_entry.action == "activated"
    assert initial_entry.message == (
        "Initial production version"
    )
    assert initial_entry.timestamp == initial_timestamp
    assert history.count() == 1

    print("TEST 9 - VERSION HISTORY RECORDING: PASS")

    # 10. Migration 1.0.0 -> 2.0.0
    migrator = VersionMigrator(
        store=store,
        history=history,
    )

    migration = migrator.migrate(
        qualified_id,
        "2.0.0",
    )

    assert isinstance(
        migration,
        MigrationResult,
    )

    assert migration.migrated is True
    assert migration.from_version == "1.0.0"
    assert migration.to_version == "2.0.0"

    current_v1 = store.get(
        qualified_id,
        "1.0.0",
    )

    current_v2 = store.get(
        qualified_id,
        "2.0.0",
    )

    assert current_v1 is not None
    assert current_v2 is not None
    assert current_v1.active is False
    assert current_v2.active is True

    assert len(
        store.active(qualified_id)
    ) == 1

    assert store.active(
        qualified_id
    )[0].version == "2.0.0"

    print("TEST 10 - VERSION MIGRATION 1.0.0 -> 2.0.0: PASS")

    # 11. Migration lifecycle history
    migration_entries = history.for_model(
        qualified_id
    )

    assert len(migration_entries) == 4

    assert [
        entry.action
        for entry in migration_entries
    ] == [
        "activated",
        "deactivated",
        "activated",
        "migration",
    ]

    assert migration_entries[-1].version == "2.0.0"
    assert migration_entries[-1].message == (
        "Migrated from 1.0.0 to 2.0.0"
    )

    print("TEST 11 - MIGRATION HISTORY: PASS")

    # 12. Same-version migration is a no-op
    unchanged = migrator.migrate(
        qualified_id,
        "2.0.0",
    )

    assert unchanged.migrated is False
    assert unchanged.from_version == "2.0.0"
    assert unchanged.to_version == "2.0.0"

    assert store.active(
        qualified_id
    )[0].version == "2.0.0"

    assert history.latest(
        qualified_id
    ) is not None

    assert history.latest(
        qualified_id
    ).action == "migration_unchanged"

    print("TEST 12 - SAME-VERSION MIGRATION PROTECTION: PASS")

    # 13. Migration 2.0.0 -> 3.0.0
    migration = migrator.migrate(
        qualified_id,
        "3.0.0",
    )

    assert migration.migrated is True
    assert migration.from_version == "2.0.0"
    assert migration.to_version == "3.0.0"

    assert store.get(
        qualified_id,
        "2.0.0",
    ).active is False

    assert store.get(
        qualified_id,
        "3.0.0",
    ).active is True

    assert len(
        store.active(qualified_id)
    ) == 1

    print("TEST 13 - VERSION MIGRATION 2.0.0 -> 3.0.0: PASS")

    # 14. Rollback 3.0.0 -> 2.0.0
    rollback = migrator.rollback(
        qualified_id,
        "2.0.0",
    )

    assert rollback.migrated is True
    assert rollback.from_version == "3.0.0"
    assert rollback.to_version == "2.0.0"

    assert store.get(
        qualified_id,
        "3.0.0",
    ).active is False

    assert store.get(
        qualified_id,
        "2.0.0",
    ).active is True

    assert len(
        store.active(qualified_id)
    ) == 1

    print("TEST 14 - VERSION ROLLBACK 3.0.0 -> 2.0.0: PASS")

    # 15. Rollback history
    rollback_entries = history.for_version(
        qualified_id,
        "2.0.0",
    )

    assert len(rollback_entries) >= 4

    assert any(
        entry.action == "migration"
        and entry.message
        == "Migrated from 3.0.0 to 2.0.0"
        for entry in rollback_entries
    )

    print("TEST 15 - ROLLBACK HISTORY: PASS")

    # 16. Missing migration target protection
    try:
        migrator.migrate(
            qualified_id,
            "4.0.0",
        )
    except KeyError:
        missing_target_rejected = True
    else:
        missing_target_rejected = False

    assert missing_target_rejected is True

    print("TEST 16 - MISSING TARGET VERSION PROTECTION: PASS")

    # 17. Store upsert after lifecycle transition
    v2_metadata = store.get(
        qualified_id,
        "2.0.0",
    )

    assert v2_metadata is not None
    assert v2_metadata.active is True
    assert v2_metadata.metadata is not None
    assert v2_metadata.metadata["source"] == (
        "real-integration-test"
    )

    print("TEST 17 - VERSION METADATA PRESERVATION: PASS")

    # 18. Version history filtering
    model_history = history.for_model(
        qualified_id
    )

    version_history = history.for_version(
        qualified_id,
        "2.0.0",
    )

    assert len(model_history) > 0
    assert len(version_history) > 0

    assert all(
        entry.qualified_id.lower()
        == qualified_id.lower()
        for entry in model_history
    )

    assert all(
        entry.version.lower() == "2.0.0"
        for entry in version_history
    )

    print("TEST 18 - HISTORY FILTERING: PASS")

    # 19. Version removal
    removed = store.remove(
        qualified_id,
        "1.0.0",
    )

    assert removed is not None
    assert removed.version == "1.0.0"
    assert store.get(
        qualified_id,
        "1.0.0",
    ) is None
    assert store.count() == 2

    print("TEST 19 - VERSION REMOVAL: PASS")

    # 20. Store clear + history clear
    store.clear()
    history.clear()

    assert store.count() == 0
    assert history.count() == 0

    print("TEST 20 - STORE + HISTORY CLEAR: PASS")

    # 21. Invalid version construction protection
    try:
        ModelVersion(
            qualified_id="",
            version="1.0.0",
        )
    except ValueError:
        invalid_qualified_id_rejected = True
    else:
        invalid_qualified_id_rejected = False

    assert invalid_qualified_id_rejected is True

    try:
        ModelVersion(
            qualified_id=qualified_id,
            version="",
        )
    except ValueError:
        invalid_version_rejected = True
    else:
        invalid_version_rejected = False

    assert invalid_version_rejected is True

    print("TEST 21 - INVALID VERSION PROTECTION: PASS")

    # 22. Invalid store input protection
    try:
        VersionStore().register(
            "not-a-model-version"
        )
    except TypeError:
        invalid_store_input_rejected = True
    else:
        invalid_store_input_rejected = False

    assert invalid_store_input_rejected is True

    print("TEST 22 - INVALID STORE INPUT PROTECTION: PASS")

    print()
    print("=" * 100)
    print("MODELNOW REAL MODEL VERSIONING INTEGRATION TEST: PASS")
    print("=" * 100)


if __name__ == "__main__":
    main()
