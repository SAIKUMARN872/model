"""Regression tests for safe download handling."""

import tempfile
import unittest
from pathlib import Path

from ai.browser_automation.downloads import (
    DownloadHandler,
    DownloadManager,
    DownloadValidationError,
    DownloadValidator,
)


class DownloadValidatorTests(unittest.TestCase):
    def test_accepts_https_url(self):
        validator = DownloadValidator()
        self.assertEqual(
            validator.validate_url("https://example.com/file.pdf"),
            "https://example.com/file.pdf",
        )

    def test_rejects_http_url(self):
        with self.assertRaises(DownloadValidationError):
            DownloadValidator().validate_url("http://example.com/file.pdf")

    def test_rejects_url_with_credentials(self):
        with self.assertRaises(DownloadValidationError):
            DownloadValidator().validate_url("https://user:pass@example.com/file.pdf")

    def test_rejects_localhost(self):
        with self.assertRaises(DownloadValidationError):
            DownloadValidator().validate_url("https://localhost/file.pdf")

    def test_rejects_disallowed_extension(self):
        validator = DownloadValidator(allowed_extensions=(".pdf",))
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(DownloadValidationError):
                validator.validate_destination(Path(directory) / "payload.exe")

    def test_rejects_existing_destination(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "file.txt"
            destination.write_text("existing", encoding="utf-8")
            with self.assertRaises(DownloadValidationError):
                DownloadValidator().validate_destination(destination)

    def test_rejects_oversized_content(self):
        handler = DownloadHandler(DownloadValidator(max_bytes=4))
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(DownloadValidationError):
                handler.save_bytes(b"12345", Path(directory) / "file.txt")


class DownloadManagerTests(unittest.TestCase):
    def test_saves_content_and_returns_metadata(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "file.txt"
            manager = DownloadManager(
                validator=DownloadValidator(allowed_extensions=(".txt",))
            )

            result = manager.save_response(
                "https://example.com/file.txt",
                b"ModelNow",
                destination,
                declared_size=8,
            )

            self.assertTrue(result["success"])
            self.assertEqual(result["size_bytes"], 8)
            self.assertEqual(destination.read_bytes(), b"ModelNow")

    def test_rejects_declared_size_mismatch(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "file.txt"
            manager = DownloadManager()

            with self.assertRaises(ValueError):
                manager.save_response(
                    "https://example.com/file.txt",
                    b"abc",
                    destination,
                    declared_size=10,
                )

            self.assertFalse(destination.exists())

    def test_rejects_existing_file_without_overwrite(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "file.txt"
            destination.write_bytes(b"original")
            manager = DownloadManager()

            with self.assertRaises(DownloadValidationError):
                manager.save_response(
                    "https://example.com/file.txt",
                    b"replacement",
                    destination,
                )

            self.assertEqual(destination.read_bytes(), b"original")


if __name__ == "__main__":
    unittest.main()
