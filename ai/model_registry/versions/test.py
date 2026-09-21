from __future__ import annotations

import unittest
from datetime import datetime, timezone

from .history import VersionHistory
from .migration import VersionMigrator
from .utils import (
    active_versions,
    latest_version,
    normalize_version,
    sort_versions,
    version_exists,
)
from .versions import ModelVersion, VersionStore


def make_version(
    version: str = "1.0.0",
    active: bool = True,
) -> ModelVersion:
    return ModelVersion(
        qualified_id="openai:test-model",
        version=version,
        active=active,
    )


class TestModelVersion(unittest.TestCase):

    def test_creation(self):
        version = make_version()

        self.assertEqual(
            version.qualified_id,
            "openai:test-model",
        )
        self.assertEqual(
            version.version,
            "1.0.0",
        )
        self.assertTrue(version.active)

    def test_key(self):
        version = ModelVersion(
            qualified_id=" OpenAI:Test-Model ",
            version=" V1.0.0 ",
        )

        self.assertEqual(
            version.key,
            "openai:test-model:v1.0.0",
        )

    def test_empty_qualified_id(self):
        with self.assertRaises(ValueError):
            ModelVersion(
                qualified_id="",
                version="1.0.0",
            )

    def test_empty_version(self):
        with self.assertRaises(ValueError):
            ModelVersion(
                qualified_id="openai:test-model",
                version="",
            )

    def test_invalid_qualified_id_type(self):
        with self.assertRaises(TypeError):
            ModelVersion(
                qualified_id=123,
                version="1.0.0",
            )

    def test_invalid_version_type(self):
        with self.assertRaises(TypeError):
            ModelVersion(
                qualified_id="openai:test-model",
                version=123,
            )

    def test_activate(self):
        version = make_version(
            active=False
        )

        activated = version.activate()

        self.assertTrue(activated.active)
        self.assertIsNotNone(
            activated.released_at
        )
        self.assertEqual(
            activated.version,
            version.version,
        )

    def test_deactivate(self):
        version = make_version(
            active=True
        )

        deactivated = version.deactivate()

        self.assertFalse(deactivated.active)
        self.assertEqual(
            deactivated.version,
            version.version,
        )


class TestVersionStore(unittest.TestCase):

    def setUp(self):
        self.store = VersionStore()

    def test_register(self):
        version = make_version()

        result = self.store.register(version)

        self.assertIs(result, version)
        self.assertEqual(
            self.store.count(),
            1,
        )

    def test_register_duplicate(self):
        version = make_version()

        self.store.register(version)

        with self.assertRaises(ValueError):
            self.store.register(version)

    def test_invalid_register(self):
        with self.assertRaises(TypeError):
            self.store.register("invalid")

    def test_get(self):
        version = make_version()

        self.store.register(version)

        result = self.store.get(
            "OPENAI:TEST-MODEL",
            "1.0.0",
        )

        self.assertEqual(
            result,
            version,
        )

    def test_get_missing(self):
        self.assertIsNone(
            self.store.get(
                "openai:test-model",
                "missing",
            )
        )

    def test_upsert(self):
        version = make_version()

        self.store.upsert(version)

        updated = ModelVersion(
            qualified_id="openai:test-model",
            version="1.0.0",
            active=False,
        )

        self.store.upsert(updated)

        result = self.store.get(
            "openai:test-model",
            "1.0.0",
        )

        self.assertEqual(
            result,
            updated,
        )
        self.assertEqual(
            self.store.count(),
            1,
        )

    def test_list_for_model(self):
        self.store.register(
            make_version("1.0.0")
        )
        self.store.register(
            make_version("2.0.0")
        )
        self.store.register(
            ModelVersion(
                qualified_id="anthropic:test-model",
                version="1.0.0",
            )
        )

        result = self.store.list_for_model(
            "openai:test-model"
        )

        self.assertEqual(
            len(result),
            2,
        )

    def test_active(self):
        self.store.register(
            make_version(
                "1.0.0",
                active=True,
            )
        )
        self.store.register(
            make_version(
                "2.0.0",
                active=False,
            )
        )

        result = self.store.active(
            "openai:test-model"
        )

        self.assertEqual(
            len(result),
            1,
        )
        self.assertEqual(
            result[0].version,
            "1.0.0",
        )

    def test_remove(self):
        version = make_version()

        self.store.register(version)

        removed = self.store.remove(
            "openai:test-model",
            "1.0.0",
        )

        self.assertEqual(
            removed,
            version,
        )
        self.assertEqual(
            self.store.count(),
            0,
        )

    def test_clear(self):
        self.store.register(
            make_version()
        )

        self.store.clear()

        self.assertEqual(
            self.store.count(),
            0,
        )


class TestVersionHistory(unittest.TestCase):

    def setUp(self):
        self.history = VersionHistory()

    def test_record(self):
        version = make_version()

        timestamp = datetime(
            2026,
            1,
            1,
            tzinfo=timezone.utc,
        )

        entry = self.history.record(
            version,
            "activated",
            message="initial activation",
            timestamp=timestamp,
        )

        self.assertEqual(
            entry.qualified_id,
            "openai:test-model",
        )
        self.assertEqual(
            entry.version,
            "1.0.0",
        )
        self.assertEqual(
            entry.action,
            "activated",
        )
        self.assertEqual(
            entry.timestamp,
            timestamp,
        )
        self.assertEqual(
            entry.message,
            "initial activation",
        )

    def test_key(self):
        version = ModelVersion(
            qualified_id="OpenAI:Test-Model",
            version="V1.0.0",
        )

        entry = self.history.record(
            version,
            "activated",
        )

        self.assertEqual(
            entry.key,
            "openai:test-model:v1.0.0",
        )

    def test_invalid_version(self):
        with self.assertRaises(TypeError):
            self.history.record(
                "invalid",
                "activated",
            )

    def test_empty_action(self):
        with self.assertRaises(ValueError):
            self.history.record(
                make_version(),
                "",
            )

    def test_for_model(self):
        self.history.record(
            make_version("1.0.0"),
            "activated",
        )
        self.history.record(
            make_version("2.0.0"),
            "activated",
        )

        result = self.history.for_model(
            "openai:test-model"
        )

        self.assertEqual(
            len(result),
            2,
        )

    def test_for_version(self):
        self.history.record(
            make_version("1.0.0"),
            "activated",
        )
        self.history.record(
            make_version("2.0.0"),
            "activated",
        )

        result = self.history.for_version(
            "openai:test-model",
            "1.0.0",
        )

        self.assertEqual(
            len(result),
            1,
        )
        self.assertEqual(
            result[0].version,
            "1.0.0",
        )

    def test_latest(self):
        first = datetime(
            2026,
            1,
            1,
            tzinfo=timezone.utc,
        )
        second = datetime(
            2026,
            1,
            2,
            tzinfo=timezone.utc,
        )

        self.history.record(
            make_version("1.0.0"),
            "activated",
            timestamp=first,
        )
        self.history.record(
            make_version("2.0.0"),
            "activated",
            timestamp=second,
        )

        latest = self.history.latest(
            "openai:test-model"
        )

        self.assertIsNotNone(latest)
        self.assertEqual(
            latest.version,
            "2.0.0",
        )

    def test_latest_empty(self):
        self.assertIsNone(
            self.history.latest(
                "openai:test-model"
            )
        )

    def test_clear(self):
        self.history.record(
            make_version(),
            "activated",
        )

        self.history.clear()

        self.assertEqual(
            self.history.count(),
            0,
        )


class TestVersionMigrator(unittest.TestCase):

    def setUp(self):
        self.store = VersionStore(
            [
                make_version(
                    "1.0.0",
                    active=True,
                ),
                make_version(
                    "2.0.0",
                    active=False,
                ),
            ]
        )

        self.history = VersionHistory()

        self.migrator = VersionMigrator(
            self.store,
            self.history,
        )

    def test_migrate(self):
        result = self.migrator.migrate(
            "openai:test-model",
            "2.0.0",
        )

        self.assertTrue(
            result.migrated
        )
        self.assertEqual(
            result.from_version,
            "1.0.0",
        )
        self.assertEqual(
            result.to_version,
            "2.0.0",
        )

        old = self.store.get(
            "openai:test-model",
            "1.0.0",
        )
        new = self.store.get(
            "openai:test-model",
            "2.0.0",
        )

        self.assertFalse(old.active)
        self.assertTrue(new.active)

    def test_migration_history(self):
        self.migrator.migrate(
            "openai:test-model",
            "2.0.0",
        )

        entries = self.history.list_all()

        self.assertEqual(
            len(entries),
            3,
        )

        self.assertEqual(
            entries[-1].action,
            "migration",
        )

    def test_migrate_missing_target(self):
        with self.assertRaises(KeyError):
            self.migrator.migrate(
                "openai:test-model",
                "3.0.0",
            )

    def test_migrate_same_version(self):
        result = self.migrator.migrate(
            "openai:test-model",
            "1.0.0",
        )

        self.assertFalse(
            result.migrated
        )
        self.assertEqual(
            result.from_version,
            "1.0.0",
        )
        self.assertEqual(
            result.to_version,
            "1.0.0",
        )

        self.assertTrue(
            self.store.get(
                "openai:test-model",
                "1.0.0",
            ).active
        )

    def test_rollback(self):
        self.migrator.migrate(
            "openai:test-model",
            "2.0.0",
        )

        result = self.migrator.rollback(
            "openai:test-model",
            "1.0.0",
        )

        self.assertTrue(
            result.migrated
        )
        self.assertEqual(
            result.from_version,
            "2.0.0",
        )
        self.assertEqual(
            result.to_version,
            "1.0.0",
        )

        old = self.store.get(
            "openai:test-model",
            "1.0.0",
        )
        new = self.store.get(
            "openai:test-model",
            "2.0.0",
        )

        self.assertTrue(old.active)
        self.assertFalse(new.active)


class TestVersionUtils(unittest.TestCase):

    def setUp(self):
        self.versions = [
            make_version("1.0.0"),
            make_version("2.0.0"),
            make_version("1.5.0"),
        ]

    def test_normalize_version(self):
        self.assertEqual(
            normalize_version(" 1.2.3 "),
            "1.2.3",
        )

    def test_normalize_empty(self):
        with self.assertRaises(ValueError):
            normalize_version("")

    def test_normalize_invalid_type(self):
        with self.assertRaises(TypeError):
            normalize_version(123)

    def test_sort_versions(self):
        result = sort_versions(
            [
                make_version("10.0.0"),
                make_version("2.0.0"),
                make_version("1.5.0"),
            ]
        )

        self.assertEqual(
            [
                item.version
                for item in result
            ],
            [
                "1.5.0",
                "2.0.0",
                "10.0.0",
            ],
        )

    def test_latest_version(self):
        latest = latest_version(
            self.versions
        )

        self.assertEqual(
            latest.version,
            "2.0.0",
        )

    def test_latest_empty(self):
        self.assertIsNone(
            latest_version([])
        )

    def test_active_versions(self):
        result = active_versions(
            [
                make_version(
                    "1.0.0",
                    active=True,
                ),
                make_version(
                    "2.0.0",
                    active=False,
                ),
            ]
        )

        self.assertEqual(
            len(result),
            1,
        )
        self.assertEqual(
            result[0].version,
            "1.0.0",
        )

    def test_version_exists(self):
        self.assertTrue(
            version_exists(
                self.versions,
                "2.0.0",
            )
        )

        self.assertFalse(
            version_exists(
                self.versions,
                "3.0.0",
            )
        )


if __name__ == "__main__":
    unittest.main()
