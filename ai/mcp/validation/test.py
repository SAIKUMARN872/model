"""Tests for MCP request and tool argument validation."""

import unittest

from ai.mcp.validation import validate_request, validate_tool_arguments
from ai.mcp.schemas import validate_jsonrpc_message
from ai.mcp.protocol.messages import request, notification, success_response


class MCPValidationTests(unittest.TestCase):
    def test_valid_request(self):
        message = request("tools/list", request_id=1)
        self.assertEqual(validate_request(message), message)

    def test_valid_notification(self):
        message = notification("notifications/initialized")
        self.assertEqual(validate_request(message), message)

    def test_request_without_id_rejected(self):
        with self.assertRaisesRegex(ValueError, "include an id"):
            validate_request({"jsonrpc": "2.0", "method": "tools/list"})

    def test_notification_without_id_accepted(self):
        message = {"jsonrpc": "2.0", "method": "notifications/initialized"}
        self.assertEqual(validate_request(message), message)

    def test_malformed_request_rejected(self):
        invalid = [
            None,
            [],
            {"jsonrpc": "1.0", "method": "ping", "id": 1},
            {"jsonrpc": "2.0", "method": "", "id": 1},
            {"jsonrpc": "2.0", "method": "ping", "id": True},
            {"jsonrpc": "2.0", "method": "ping", "params": "invalid", "id": 1},
        ]
        for message in invalid:
            with self.subTest(message=message):
                with self.assertRaises(ValueError):
                    validate_request(message)

    def test_general_jsonrpc_validator_accepts_success_response(self):
        message = success_response(1, {"ok": True})
        self.assertEqual(validate_jsonrpc_message(message), message)

    def test_tool_arguments_valid(self):
        self.assertEqual(
            validate_tool_arguments({
                "name": "echo",
                "arguments": {"value": "hello"},
            }),
            ("echo", {"value": "hello"}),
        )

    def test_tool_arguments_default_to_empty_object(self):
        self.assertEqual(
            validate_tool_arguments({"name": "ping"}),
            ("ping", {}),
        )

    def test_invalid_tool_arguments_rejected(self):
        invalid = [
            None,
            [],
            {},
            {"name": ""},
            {"name": "echo", "arguments": []},
            {"name": 123},
        ]
        for params in invalid:
            with self.subTest(params=params):
                with self.assertRaises(ValueError):
                    validate_tool_arguments(params)


if __name__ == "__main__":
    unittest.main()