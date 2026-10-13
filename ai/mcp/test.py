"""Integration tests for the public MCP foundation APIs."""

import unittest

from ai.mcp.events import MCPEvent
from ai.mcp.events.utils import event_from_dict, event_to_dict, validate_event_name
from ai.mcp.protocol import decode_message, encode_message, request
from ai.mcp.protocol.utils import normalize_params, validate_request_id
from ai.mcp.tools.tool import MCPTool
from ai.mcp.tools.validator import validate_arguments, validate_tool_definition
from ai.mcp.validation.rules import (
    require_boolean,
    require_mapping,
    require_non_empty_string,
    require_string_list,
)
from ai.mcp.validation.utils import (
    check_max_size,
    ensure_json_serializable,
    normalize_optional_object,
)


class MCPFoundationIntegrationTests(unittest.TestCase):
    def test_protocol_round_trip(self):
        message = request("tools/list", request_id="integration-1")
        self.assertEqual(decode_message(encode_message(message)), message)

    def test_protocol_rejects_invalid_method(self):
        from ai.mcp.protocol.utils import validate_method
        with self.assertRaises(ValueError):
            validate_method("  ")

    def test_request_id_rejects_boolean(self):
        with self.assertRaises(ValueError):
            validate_request_id(True)

    def test_normalize_params(self):
        self.assertEqual(normalize_params(), {})
        self.assertEqual(normalize_params(["x"]), ["x"])
        with self.assertRaises(ValueError):
            normalize_params("invalid")

    def test_event_round_trip(self):
        event = MCPEvent(
            name="tool.completed",
            payload={"tool": "demo"},
            metadata={"source": "test"},
        )
        restored = event_from_dict(event_to_dict(event))
        self.assertEqual(restored.name, event.name)
        self.assertEqual(dict(restored.payload), dict(event.payload))
        self.assertEqual(dict(restored.metadata), dict(event.metadata))

    def test_event_name_normalization(self):
        self.assertEqual(validate_event_name("  ready  "), "ready")
        with self.assertRaises(ValueError):
            validate_event_name(" ")

    def test_tool_definition_and_arguments(self):
        tool = MCPTool(
            name="greet",
            description="Create a greeting",
            input_schema={
                "type": "object",
                "properties": {"name": {"type": "string"}},
                "required": ["name"],
                "additionalProperties": False,
            },
        )
        self.assertIs(validate_tool_definition(tool), tool)
        self.assertEqual(
            validate_arguments(tool, {"name": "ModelNow"}),
            {"name": "ModelNow"},
        )

    def test_tool_argument_validation(self):
        tool = MCPTool(
            name="count",
            input_schema={
                "type": "object",
                "properties": {"count": {"type": "integer"}},
                "required": ["count"],
            },
        )
        with self.assertRaises(ValueError):
            validate_arguments(tool, {})
        with self.assertRaises(ValueError):
            validate_arguments(tool, {"count": True})

    def test_validation_rules(self):
        self.assertEqual(require_non_empty_string(" hello "), "hello")
        self.assertEqual(dict(require_mapping({"a": 1})), {"a": 1})
        self.assertEqual(require_string_list([" a "]), ["a"])
        self.assertTrue(require_boolean(True))
        with self.assertRaises(ValueError):
            require_boolean(1)

    def test_validation_utilities(self):
        self.assertEqual(normalize_optional_object(), {})
        self.assertEqual(
            ensure_json_serializable({"ok": True}),
            {"ok": True},
        )
        self.assertEqual(check_max_size("abc", 3), 3)
        with self.assertRaises(ValueError):
            check_max_size("four", 3)
        with self.assertRaises(ValueError):
            ensure_json_serializable(float("nan"))


if __name__ == "__main__":
    unittest.main()
