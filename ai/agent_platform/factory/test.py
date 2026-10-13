from __future__ import annotations

import unittest

from ..exceptions import AgentRegistrationError
from ..models import AgentMetadata
from .builder import AgentBuilder
from .factory import AgentFactory
from .loader import load_agent_class, load_symbol


class FakeAgent:
    def __init__(self, greeting="hello"):
        self.greeting = greeting

    def execute(self, request):
        return {"greeting": self.greeting, "request": request}


class InvalidAgent:
    pass


MODULE_LEVEL_VALUE = "not a class"


class AgentFactoryTests(unittest.TestCase):
    def setUp(self):
        self.factory = AgentFactory()
        self.metadata = AgentMetadata(
            agent_id="chat-agent",
            name="Chat Agent",
        )
        self.factory.register_builder("chat-agent", FakeAgent)

    def test_create_agent(self):
        agent = self.factory.create(self.metadata)
        self.assertIsInstance(agent, FakeAgent)
        self.assertEqual(agent.greeting, "hello")

    def test_forward_constructor_arguments(self):
        agent = self.factory.create(self.metadata, greeting="welcome")
        self.assertEqual(agent.greeting, "welcome")

    def test_duplicate_builder_rejected(self):
        with self.assertRaises(AgentRegistrationError):
            self.factory.register_builder("chat-agent", FakeAgent)

    def test_replace_builder_explicitly(self):
        class AlternateAgent:
            def execute(self, request):
                return "alternate"

        self.factory.register_builder(
            "chat-agent", AlternateAgent, replace=True
        )
        self.assertIsInstance(
            self.factory.create(self.metadata), AlternateAgent
        )

    def test_unknown_builder_rejected(self):
        unknown = AgentMetadata(agent_id="unknown", name="Unknown")
        with self.assertRaises(AgentRegistrationError):
            self.factory.create(unknown)

    def test_disabled_agent_rejected(self):
        disabled = AgentMetadata(
            agent_id="chat-agent",
            name="Chat Agent",
            enabled=False,
        )
        with self.assertRaises(AgentRegistrationError):
            self.factory.create(disabled)

    def test_invalid_created_agent_rejected(self):
        builder = AgentBuilder(InvalidAgent)
        with self.assertRaises(AgentRegistrationError):
            builder.build()

    def test_builder_requires_callable(self):
        with self.assertRaises(TypeError):
            AgentBuilder(object())

    def test_builder_listing(self):
        self.factory.register_builder("research-agent", FakeAgent)
        self.assertEqual(
            self.factory.list_builder_keys(),
            ["chat-agent", "research-agent"],
        )

    def test_load_existing_symbol(self):
        symbol = load_symbol("ai.agent_platform.factory.test:FakeAgent")
        self.assertIs(symbol, FakeAgent)

    def test_load_agent_class(self):
        self.assertIs(
            load_agent_class("ai.agent_platform.factory.test:FakeAgent"),
            FakeAgent,
        )

    def test_invalid_import_path_rejected(self):
        with self.assertRaises(ValueError):
            load_symbol("invalid-import-path")

    def test_missing_symbol_rejected(self):
        with self.assertRaises(ImportError):
            load_symbol(
                "ai.agent_platform.factory.test:SymbolThatDoesNotExist"
            )

    def test_non_class_symbol_rejected(self):
        with self.assertRaises(TypeError):
            load_agent_class(
                "ai.agent_platform.factory.test:MODULE_LEVEL_VALUE"
            )


if __name__ == "__main__":
    unittest.main()
