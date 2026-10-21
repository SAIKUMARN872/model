"""Regression tests for MCP authentication helpers."""
import unittest

from ai.mcp.authentication import (
    AuthenticationError,
    MCPAuthenticator,
    TokenStore,
    generate_state,
    parse_bearer_header,
    pkce_code_challenge,
    pkce_code_verifier,
    token_response,
    verify_state,
)


class AuthenticationTests(unittest.TestCase):
    def setUp(self):
        self.store = TokenStore(default_ttl_seconds=60)
        self.auth = MCPAuthenticator(self.store)

    def test_issue_and_authenticate(self):
        token = self.store.issue("user-1", {"tools:read", "tools:call"})
        principal = self.auth.authenticate_token(token)
        self.assertEqual(principal.subject, "user-1")
        self.assertIn("tools:call", principal.scopes)

    def test_raw_token_not_used_as_storage_key(self):
        token = self.store.issue("user-1")
        self.assertNotIn(token, self.store._records)

    def test_revoke_token(self):
        token = self.store.issue("user-1")
        self.assertTrue(self.store.revoke(token))
        with self.assertRaises(AuthenticationError):
            self.auth.authenticate_token(token)

    def test_unknown_token_rejected(self):
        with self.assertRaises(AuthenticationError):
            self.auth.authenticate_token("not-a-valid-token")

    def test_bearer_header_case_insensitive(self):
        token = self.store.issue("user-2")
        principal = self.auth.authenticate_headers(
            {"aUtHoRiZaTiOn": f"bEaReR {token}"}
        )
        self.assertEqual(principal.subject, "user-2")

    def test_missing_header_rejected(self):
        with self.assertRaises(AuthenticationError):
            self.auth.authenticate_headers({})

    def test_scope_enforcement(self):
        token = self.store.issue("user-3", {"tools:read"})
        principal = self.auth.authenticate_token(token)
        self.auth.require_scopes(principal, {"tools:read"})
        with self.assertRaises(AuthenticationError):
            self.auth.require_scopes(principal, {"tools:call"})

    def test_invalid_ttl_rejected(self):
        with self.assertRaises(ValueError):
            self.store.issue("user-4", ttl_seconds=0)

    def test_oauth_state_and_pkce(self):
        state = generate_state()
        self.assertTrue(verify_state(state, state))
        self.assertFalse(verify_state(state, "different"))
        verifier = pkce_code_verifier()
        self.assertEqual(len(pkce_code_challenge(verifier)), 43)

    def test_oauth_response(self):
        response = token_response(
            "opaque-token", expires_in=300, scopes={"tools:read"}
        )
        self.assertEqual(response["token_type"], "Bearer")
        self.assertEqual(response["scope"], "tools:read")

    def test_bearer_parser(self):
        self.assertEqual(parse_bearer_header("Bearer abc"), "abc")
        self.assertIsNone(parse_bearer_header("Basic abc"))
        self.assertIsNone(parse_bearer_header("Bearer "))


if __name__ == "__main__":
    unittest.main()
