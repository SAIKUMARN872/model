"""Tests for ModelNow tool versioning."""

import unittest

from ai.tool_platform.registry.models import ToolSpec
from ai.tool_platform.registry.registry import ToolNotFoundError, ToolRegistry
from ai.tool_platform.versioning import (
    ToolVersionResolver,
    bump_version,
    compare_versions,
    compatible_versions,
    is_compatible,
    parse_version,
)


def handler(**kwargs):
    return kwargs


class VersionUtilityTests(unittest.TestCase):
    def test_parse_version(self):
        self.assertEqual(parse_version("1.10.3"), (1, 10, 3))

    def test_rejects_invalid_version(self):
        for version in ("1.2", "v1.2.3", "1.02.3", "1.2.3-beta"):
            with self.subTest(version=version):
                with self.assertRaises(ValueError):
                    parse_version(version)

    def test_numeric_comparison(self):
        self.assertEqual(compare_versions("1.10.0", "1.2.0"), 1)
        self.assertEqual(compare_versions("1.2.0", "1.2.0"), 0)
        self.assertEqual(compare_versions("1.2.0", "1.3.0"), -1)

    def test_bump_patch(self):
        self.assertEqual(bump_version("1.2.3"), "1.2.4")

    def test_bump_minor(self):
        self.assertEqual(bump_version("1.2.3", "minor"), "1.3.0")

    def test_bump_major(self):
        self.assertEqual(bump_version("1.2.3", "major"), "2.0.0")

    def test_rejects_invalid_bump_part(self):
        with self.assertRaises(ValueError):
            bump_version("1.2.3", "build")


class CompatibilityTests(unittest.TestCase):
    def test_stable_versions_with_same_major_are_compatible(self):
        self.assertTrue(is_compatible("1.9.0", "1.2.0"))

    def test_different_major_versions_are_incompatible(self):
        self.assertFalse(is_compatible("2.0.0", "1.9.0"))

    def test_zero_major_requires_same_minor(self):
        self.assertTrue(is_compatible("0.2.1", "0.2.9"))
        self.assertFalse(is_compatible("0.3.0", "0.2.9"))

    def test_compatible_versions_are_sorted_and_unique(self):
        self.assertEqual(
            compatible_versions(
                ["1.10.0", "2.0.0", "1.2.0", "1.2.0"],
                "1.5.0",
            ),
            ["1.2.0", "1.10.0"],
        )


class ResolverTests(unittest.TestCase):
    def setUp(self):
        self.registry = ToolRegistry()
        for version in ("1.2.0", "1.10.0", "2.0.0"):
            self.registry.register(
                ToolSpec(
                    name="document.search",
                    description="Search documents",
                    handler=handler,
                    version=version,
                    tags=("search",),
                )
            )
        self.resolver = ToolVersionResolver(self.registry)

    def test_rejects_invalid_registry(self):
        with self.assertRaises(TypeError):
            ToolVersionResolver(object())

    def test_resolves_exact_version(self):
        tool = self.resolver.resolve("document.search", "1.2.0")
        self.assertEqual(tool.version, "1.2.0")

    def test_resolves_latest_version(self):
        tool = self.resolver.resolve("document.search")
        self.assertEqual(tool.version, "2.0.0")

    def test_resolves_latest_compatible_version(self):
        tool = self.resolver.resolve(
            "document.search",
            compatible_with="1.5.0",
        )
        self.assertEqual(tool.version, "1.10.0")

    def test_missing_exact_version_raises(self):
        with self.assertRaises(ToolNotFoundError):
            self.resolver.resolve("document.search", "3.0.0")

    def test_unknown_tool_raises(self):
        with self.assertRaises(ToolNotFoundError):
            self.resolver.resolve("missing.tool")

    def test_disabled_tools_are_excluded_by_default(self):
        self.registry.register(
            ToolSpec(
                name="document.archive",
                description="Archive documents",
                handler=handler,
                version="1.0.0",
                enabled=False,
            )
        )
        with self.assertRaises(ToolNotFoundError):
            self.resolver.resolve("document.archive")

    def test_can_include_disabled_tools_explicitly(self):
        self.registry.register(
            ToolSpec(
                name="document.archive",
                description="Archive documents",
                handler=handler,
                version="1.0.0",
                enabled=False,
            )
        )
        tool = self.resolver.resolve(
            "document.archive",
            enabled_only=False,
        )
        self.assertEqual(tool.version, "1.0.0")


if __name__ == "__main__":
    unittest.main()
