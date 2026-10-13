"""Tests for the ModelNow tool selector."""

import unittest

from ai.tool_platform.permissions.policy import PermissionContext
from ai.tool_platform.registry.models import ToolSpec
from ai.tool_platform.registry.registry import ToolRegistry
from ai.tool_platform.selector import (
    ToolSelectionRequest,
    ToolSelector,
)


def handler(**kwargs):
    return kwargs


class ToolSelectorTests(unittest.TestCase):
    def setUp(self):
        self.registry = ToolRegistry()
        self.selector = ToolSelector(self.registry)

        self.registry.register(ToolSpec(
            name="search_documents",
            description="Search internal documents and knowledge bases",
            handler=handler,
            tags=("search", "documents", "knowledge"),
        ))
        self.registry.register(ToolSpec(
            name="send_email",
            description="Send an email message to a recipient",
            handler=handler,
            tags=("email", "communication"),
            required_permissions=("email.send",),
        ))
        self.registry.register(ToolSpec(
            name="disabled_search",
            description="Search archived records",
            handler=handler,
            tags=("search",),
            enabled=False,
        ))

    def test_selects_relevant_tool(self):
        result = self.selector.select(
            ToolSelectionRequest("search documents")
        )
        self.assertTrue(result.success)
        self.assertEqual(result.selected_tool.name, "search_documents")

    def test_required_tags_are_enforced(self):
        result = self.selector.select(
            ToolSelectionRequest(
                "search documents",
                required_tags=("knowledge",),
            )
        )
        self.assertEqual(result.selected_tool.name, "search_documents")

    def test_missing_required_tag_returns_no_match(self):
        result = self.selector.select(
            ToolSelectionRequest(
                "search documents",
                required_tags=("payments",),
            )
        )
        self.assertFalse(result.success)
        self.assertIsNone(result.selected_tool)

    def test_disabled_tools_are_ignored(self):
        result = self.selector.select(
            ToolSelectionRequest("archived records")
        )
        self.assertFalse(result.success)

    def test_permission_restrictions_are_enforced(self):
        result = self.selector.select(
            ToolSelectionRequest("send email")
        )
        self.assertFalse(result.success)

    def test_authorized_tool_can_be_selected(self):
        context = PermissionContext(
            user_id="test-user",
            permissions=frozenset({"email.send"}),
        )
        result = self.selector.select(
            ToolSelectionRequest(
                "send email",
                permission_context=context,
            )
        )
        self.assertEqual(result.selected_tool.name, "send_email")

    def test_unrelated_request_returns_no_match(self):
        result = self.selector.select(
            ToolSelectionRequest("calculate planetary orbit")
        )
        self.assertFalse(result.success)
        self.assertEqual(result.candidates, ())

    def test_ranking_is_deterministic(self):
        self.registry.register(ToolSpec(
            name="search_archive",
            description="Search documents in an archive",
            handler=handler,
            tags=("archive",),
        ))
        first = self.selector.select(
            ToolSelectionRequest("search documents")
        )
        second = self.selector.select(
            ToolSelectionRequest("search documents")
        )
        self.assertEqual(
            [(c.tool.name, c.score) for c in first.candidates],
            [(c.tool.name, c.score) for c in second.candidates],
        )

    def test_top_k_limits_alternatives(self):
        self.registry.register(ToolSpec(
            name="document_search",
            description="Search and retrieve documents",
            handler=handler,
            tags=("search", "documents"),
        ))
        result = self.selector.select(
            ToolSelectionRequest("search documents", top_k=1)
        )
        self.assertEqual(len(result.candidates), 1)

    def test_result_serializes(self):
        result = self.selector.select(
            ToolSelectionRequest("search documents")
        )
        data = result.to_dict()
        self.assertTrue(data["success"])
        self.assertEqual(data["selected_tool"]["name"], "search_documents")
        self.assertGreaterEqual(data["candidates"][0]["score"], 0.0)

    def test_empty_request_is_rejected(self):
        with self.assertRaises(ValueError):
            ToolSelectionRequest(" ")

    def test_invalid_top_k_is_rejected(self):
        with self.assertRaises(ValueError):
            ToolSelectionRequest("search documents", top_k=0)

    def test_invalid_registry_is_rejected(self):
        with self.assertRaises(TypeError):
            ToolSelector(object())


if __name__ == "__main__":
    unittest.main()
