import unittest

from ai.browser_automation.credentials import (
    CredentialAccessDeniedError,
    CredentialManager,
    CredentialNotFoundError,
    CredentialValidationError,
)


class CredentialManagerTests(unittest.TestCase):
    def setUp(self):
        self.manager = CredentialManager()
        self.record = self.manager.register(
            service="example",
            domain="example.com",
            username="test-user",
            password="test-password",
        )

    def test_register_and_authorized_retrieval(self):
        secret = self.manager.get(
            self.record.credential_id,
            domain="EXAMPLE.COM",
            authorized=True,
        )
        self.assertEqual(secret.username, "test-user")
        self.assertEqual(secret.password, "test-password")

    def test_retrieval_requires_authorization(self):
        with self.assertRaises(CredentialAccessDeniedError):
            self.manager.get(
                self.record.credential_id,
                domain="example.com",
            )

    def test_domain_mismatch_is_denied(self):
        with self.assertRaises(CredentialAccessDeniedError):
            self.manager.get(
                self.record.credential_id,
                domain="attacker.example",
                authorized=True,
            )

    def test_update_password(self):
        self.manager.update(
            self.record.credential_id,
            domain="example.com",
            authorized=True,
            password="updated-password",
        )
        secret = self.manager.get(
            self.record.credential_id,
            domain="example.com",
            authorized=True,
        )
        self.assertEqual(secret.password, "updated-password")
        self.assertEqual(secret.username, "test-user")

    def test_delete_removes_secret(self):
        self.assertTrue(self.manager.delete(
            self.record.credential_id,
            authorized=True,
        ))
        with self.assertRaises(CredentialNotFoundError):
            self.manager.get(
                self.record.credential_id,
                domain="example.com",
                authorized=True,
            )

    def test_metadata_does_not_expose_password(self):
        metadata = self.manager.metadata(self.record.credential_id)
        self.assertEqual(metadata.domain, "example.com")
        self.assertFalse(hasattr(metadata, "password"))

    def test_invalid_domain_is_rejected(self):
        with self.assertRaises(CredentialValidationError):
            self.manager.register(
                service="example",
                domain="https://example.com/login",
                password="test-password",
            )


if __name__ == "__main__":
    unittest.main(verbosity=2)
