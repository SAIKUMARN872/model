"""Regression tests for MCP HTTP transport and authentication."""
import json
import unittest

from ai.mcp.authentication import MCPAuthenticator, TokenStore
from ai.mcp.constants import MAX_MESSAGE_BYTES
from ai.mcp.transport.http import MCPHTTPTransport


class FakeServer:
    def __init__(self):
        self.calls = 0

    async def handle(self, message):
        self.calls += 1
        return {
            "jsonrpc": "2.0",
            "id": message.get("id"),
            "result": {"ok": True},
        }


class HTTPTransportTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.server = FakeServer()
        self.body = json.dumps({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "ping",
            "params": {},
        })

    async def test_open_mode(self):
        transport = MCPHTTPTransport(self.server)
        status, _, body = await transport.handle_request(self.body)
        self.assertEqual(status, 200)
        self.assertTrue(json.loads(body)["result"]["ok"])

    async def test_auth_required_without_token(self):
        transport = MCPHTTPTransport(
            self.server,
            authenticator=MCPAuthenticator(TokenStore()),
        )
        status, _, _ = await transport.handle_request(self.body)
        self.assertEqual(status, 401)
        self.assertEqual(self.server.calls, 0)

    async def test_invalid_token_rejected(self):
        transport = MCPHTTPTransport(
            self.server,
            authenticator=MCPAuthenticator(TokenStore()),
        )
        status, _, _ = await transport.handle_request(
            self.body,
            headers={"Authorization": "Bearer invalid-token"},
        )
        self.assertEqual(status, 401)
        self.assertEqual(self.server.calls, 0)

    async def test_valid_token_accepted(self):
        store = TokenStore()
        token = store.issue("test-user", {"mcp:access"})
        transport = MCPHTTPTransport(
            self.server,
            authenticator=MCPAuthenticator(store),
            required_scopes={"mcp:access"},
        )
        status, _, _ = await transport.handle_request(
            self.body,
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(self.server.calls, 1)

    async def test_insufficient_scope_rejected(self):
        store = TokenStore()
        token = store.issue("test-user", {"tools:read"})
        transport = MCPHTTPTransport(
            self.server,
            authenticator=MCPAuthenticator(store),
            required_scopes={"mcp:admin"},
        )
        status, _, _ = await transport.handle_request(
            self.body,
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(status, 403)
        self.assertEqual(self.server.calls, 0)

    async def test_authentication_can_be_required_explicitly(self):
        with self.assertRaises(ValueError):
            MCPHTTPTransport(self.server, require_auth=True)

    async def test_unsupported_content_type(self):
        transport = MCPHTTPTransport(self.server)
        status, _, _ = await transport.handle_request(
            self.body, content_type="text/plain"
        )
        self.assertEqual(status, 415)
        self.assertEqual(self.server.calls, 0)

    async def test_invalid_json_rejected(self):
        transport = MCPHTTPTransport(self.server)
        status, _, _ = await transport.handle_request("{invalid")
        self.assertEqual(status, 400)
        self.assertEqual(self.server.calls, 0)

    async def test_oversized_body_rejected(self):
        transport = MCPHTTPTransport(self.server)
        body = " " * (MAX_MESSAGE_BYTES + 1)
        status, _, _ = await transport.handle_request(body)
        self.assertEqual(status, 413)
        self.assertEqual(self.server.calls, 0)


if __name__ == "__main__":
    unittest.main()
