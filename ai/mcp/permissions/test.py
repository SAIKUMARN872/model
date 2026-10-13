"""Regression tests for MCP role and permission utilities."""

import unittest

from ai.mcp.permissions.roles import (
    MCPRole,
    permissions_for_role,
    role_allows,
)
from ai.mcp.permissions.utils import (
    combine_role_permissions,
    has_required_permissions,
    normalize_permissions,
)


class MCPRoleTests(unittest.TestCase):
    def test_reader_can_list_tools(self):
        self.assertTrue(role_allows(MCPRole.READER, "tools:list"))

    def test_reader_cannot_execute_tools(self):
        self.assertFalse(role_allows(MCPRole.READER, "tools:execute"))

    def test_operator_can_execute_tools(self):
        self.assertTrue(role_allows(MCPRole.OPERATOR, "tools:execute"))

    def test_admin_has_admin_permission(self):
        self.assertTrue(role_allows(MCPRole.ADMIN, "mcp:admin"))

    def test_unknown_role_rejected(self):
        with self.assertRaises(ValueError):
            permissions_for_role("unknown")

    def test_role_permissions_are_immutable(self):
        self.assertIsInstance(permissions_for_role("reader"), frozenset)

    def test_normalize_permissions(self):
        self.assertEqual(
            normalize_permissions(["tools:list", "tools:execute"]),
            frozenset({"tools:list", "tools:execute"}),
        )

    def test_duplicate_permissions_removed(self):
        self.assertEqual(
            normalize_permissions(["tools:list", "tools:list"]),
            frozenset({"tools:list"}),
        )

    def test_string_input_rejected(self):
        with self.assertRaises(TypeError):
            normalize_permissions("tools:list")

    def test_empty_permission_rejected(self):
        with self.assertRaises(ValueError):
            normalize_permissions([""])

    def test_combine_roles(self):
        permissions = combine_role_permissions("reader", "operator")
        self.assertIn("tools:list", permissions)
        self.assertIn("tools:execute", permissions)

    def test_required_permissions_check(self):
        self.assertTrue(
            has_required_permissions(
                {"tools:list", "tools:execute"},
                {"tools:list"},
            )
        )

    def test_missing_permission_detected(self):
        self.assertFalse(
            has_required_permissions(
                {"tools:list"},
                {"tools:list", "tools:execute"},
            )
        )


if __name__ == "__main__":
    unittest.main()
