from __future__ import annotations

import unittest

from ..exceptions import (
    AgentNotFoundError,
    AgentRegistrationError,
    AgentValidationError,
)
from ..models import AgentMetadata
from .discovery import AgentDiscovery
from .metadata import create_metadata
from .registry import AgentRegistry
from .validator import validate_metadata


class FakeAgent:
    def execute(self, request):
        return {"received": request}


class AgentRegistryTests(unittest.TestCase):
    def setUp(self):
        self.registry = AgentRegistry()
        self.agent = FakeAgent()
        self.metadata = create_metadata(
            "chat-agent",
            "Chat Agent",
            capabilities=["chat", "summarize"],
            tags=["general"],
        )
        self.registry.register(self.metadata, self.agent)

    def test_register_and_get_agent(self):
        self.assertIs(self.registry.get("chat-agent"), self.agent)
        self.assertEqual(len(self.registry), 1)

    def test_duplicate_registration_rejected(self):
        with self.assertRaises(AgentRegistrationError):
            self.registry.register(self.metadata, FakeAgent())

    def test_agent_without_execute_rejected(self):
        with self.assertRaises(AgentRegistrationError):
            self.registry.register(
                AgentMetadata(agent_id="bad", name="Bad Agent"),
                object(),
            )

    def test_missing_agent_raises(self):
        with self.assertRaises(AgentNotFoundError):
            self.registry.get("missing")

    def test_metadata_lookup(self):
        result = self.registry.get_metadata("chat-agent")
        self.assertEqual(result.name, "Chat Agent")

    def test_capability_discovery_is_case_insensitive(self):
        found = self.registry.find_by_capability("CHAT")
        self.assertEqual([item.agent_id for item in found], ["chat-agent"])

    def test_disabled_agents_are_not_discovered(self):
        self.registry.set_enabled("chat-agent", False)
        self.assertEqual(self.registry.find_by_capability("chat"), [])
        self.assertEqual(self.registry.list_metadata(enabled_only=True), [])
        self.assertTrue(self.registry.contains("chat-agent"))

    def test_discovery_by_tag(self):
        discovery = AgentDiscovery(self.registry)
        self.assertEqual(
            [item.agent_id for item in discovery.by_tag("GENERAL")],
            ["chat-agent"],
        )

    def test_unregister_agent(self):
        removed = self.registry.unregister("chat-agent")
        self.assertEqual(removed.agent_id, "chat-agent")
        self.assertFalse(self.registry.contains("chat-agent"))
        self.assertEqual(len(self.registry), 0)

    def test_unregister_missing_agent_raises(self):
        with self.assertRaises(AgentNotFoundError):
            self.registry.unregister("missing")

    def test_metadata_validation(self):
        validate_metadata(self.metadata)

    def test_metadata_validation_rejects_wrong_type(self):
        with self.assertRaises(AgentValidationError):
            validate_metadata({"agent_id": "bad"})


if __name__ == "__main__":
    unittest.main()
