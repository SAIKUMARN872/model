"""Tests for MCP JSON-RPC constructors and serialization."""

import unittest
from unittest.mock import patch

from ai.mcp.protocol import (
    decode_message,
    encode_message,
    error_response,
    notification,
    request,
    success_response,
)


class MCPProtocolTests(unittest.TestCase):
    def test_request_round_trip(self):
        message = request("tools/list", {"filter": "enabled"}, 7)
        self.assertEqual(decode_message(encode_message(message)), message)

    def test_notification_round_trip(self):
        message = notification("notifications/initialized")
        self.assertEqual(decode_message(encode_message(message)), message)
        self.assertNotIn("id", message)

    def test_success_response_round_trip(self):
        message = success_response(7, {"tools": []})
        self.assertEqual(decode_message(encode_message(message)), message)

    def test_error_response_round_trip(self):
        message = error_response(8, -32601, "Method not found", {"method": "x"})
        self.assertEqual(decode_message(encode_message(message)), message)

    def test_null_response_id_is_valid(self):
        message = error_response(None, -32603, "Internal error")
        self.assertEqual(decode_message(encode_message(message)), message)

    def test_invalid_messages_rejected(self):
        invalid = [
            None,
            [],
            {},
            {"jsonrpc": "1.0", "method": "ping"},
            {"jsonrpc": "2.0", "method": ""},
            {"jsonrpc": "2.0", "method": "ping", "id": True},
            {"jsonrpc": "2.0", "method": "ping", "params": "invalid"},
            {"jsonrpc": "2.0", "id": 1},
            {"jsonrpc": "2.0", "id": 1, "result": {}, "error": {}},
            {"jsonrpc": "2.0", "id": 1, "error": {"code": "bad", "message": "x"}},
        ]
        for message in invalid:
            with self.subTest(message=message):
                with self.assertRaises(ValueError):
                    encode_message(message)

    def test_decode_rejects_invalid_jsonrpc_message(self):
        with self.assertRaises(ValueError):
            decode_message(b'{"jsonrpc":"2.0","id":1}')

    def test_decode_accepts_text_payload(self):
        payload = '{"jsonrpc":"2.0","id":1,"result":{"ok":true}}'
        self.assertEqual(decode_message(payload)["result"], {"ok": True})

    def test_oversized_encode_rejected(self):
        with patch("ai.mcp.protocol.serialization.MAX_MESSAGE_BYTES", 8):
            with self.assertRaises(ValueError):
                encode_message(request("ping"))

    def test_oversized_decode_rejected(self):
        with patch("ai.mcp.protocol.serialization.MAX_MESSAGE_BYTES", 4):
            with self.assertRaises(ValueError):
                decode_message(b'12345')


if __name__ == "__main__":
    unittest.main()