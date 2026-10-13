from unittest import TestCase
from unittest.mock import patch

from ai.browser_automation.exceptions import UnsafeUrlError
from ai.browser_automation.security.permissions import (
    BrowserPermissionError,
    require_browser_permission,
)
from ai.browser_automation.security.sandbox import (
    SandboxPolicy,
    validate_sandbox_destination,
)


class PermissionHardeningTests(TestCase):
    def test_rejects_string_instead_of_permission_collection(self):
        with self.assertRaises(BrowserPermissionError):
            require_browser_permission("user-1", "browser:execute")

    def test_rejects_non_iterable_permissions(self):
        with self.assertRaises(BrowserPermissionError):
            require_browser_permission("user-1", 123)

    def test_rejects_malformed_permission_entries(self):
        with self.assertRaises(BrowserPermissionError):
            require_browser_permission(
                "user-1", ["browser:execute", None]
            )

    def test_rejects_blank_required_permission(self):
        with self.assertRaises(BrowserPermissionError):
            require_browser_permission("user-1", {"browser:execute"}, " ")

    def test_accepts_exact_permission_grant(self):
        require_browser_permission(
            "user-1", {"browser:execute", "browser:read"}
        )


class SandboxHardeningTests(TestCase):
    def test_rejects_private_ip_destination(self):
        with self.assertRaises((ValueError, UnsafeUrlError)):
            validate_sandbox_destination("http://127.0.0.1")

    def test_http_policy_rejects_before_network_validation(self):
        policy = SandboxPolicy(allow_http=False)

        with patch(
            "ai.browser_automation.security.sandbox.validate_url"
        ) as mock_validate:
            with self.assertRaisesRegex(ValueError, "HTTP destinations"):
                policy.validate_destination("http://example.com")

            mock_validate.assert_not_called()

    def test_https_policy_rejects_before_network_validation(self):
        policy = SandboxPolicy(allow_https=False)

        with patch(
            "ai.browser_automation.security.sandbox.validate_url"
        ) as mock_validate:
            with self.assertRaisesRegex(ValueError, "HTTPS destinations"):
                policy.validate_destination("https://example.com")

            mock_validate.assert_not_called()


if __name__ == "__main__":
    import unittest
    unittest.main(verbosity=2)
