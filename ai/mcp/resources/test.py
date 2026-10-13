"""Tests for MCP resources."""
import tempfile
import unittest
from pathlib import Path

from ai.mcp.resources import (
    MCPResource,
    MCPResourceLoader,
    MCPResourceManager,
    resource_content,
    resource_to_dict,
    validate_resource_uri,
)


class ResourceModelTests(unittest.TestCase):
    def test_text_resource(self):
        item = MCPResource("memory://notes/1", "Notes", text="Hello")
        self.assertEqual(item.to_content()["text"], "Hello")
        self.assertEqual(item.to_dict()["name"], "Notes")

    def test_binary_resource_is_base64_encoded(self):
        item = MCPResource("memory://files/1", "File", blob=b"\x00\xff")
        self.assertEqual(item.to_content()["blob"], "AP8=")

    def test_both_content_types_rejected(self):
        with self.assertRaises(ValueError):
            MCPResource("memory://x", "X", text="x", blob=b"x")

    def test_invalid_uri_rejected(self):
        with self.assertRaises(ValueError):
            validate_resource_uri("no-scheme")

    def test_invalid_name_rejected(self):
        with self.assertRaises(ValueError):
            MCPResource("memory://x", " ")


class ResourceManagerTests(unittest.TestCase):
    def setUp(self):
        self.manager = MCPResourceManager()
        self.item = MCPResource("memory://notes/1", "Notes", text="Hello")

    def test_register_get_list(self):
        self.manager.register(self.item)
        self.assertIs(self.manager.get(self.item.uri), self.item)
        self.assertEqual(self.manager.list_resources(), [self.item])
        self.assertEqual(len(self.manager), 1)

    def test_duplicate_rejected_and_replace_supported(self):
        self.manager.register(self.item)
        with self.assertRaises(ValueError):
            self.manager.register(self.item)
        replacement = MCPResource(self.item.uri, "Updated", text="New")
        self.manager.register(replacement, replace=True)
        self.assertEqual(self.manager.require(self.item.uri).name, "Updated")

    def test_missing_and_remove(self):
        self.assertIsNone(self.manager.get("memory://missing"))
        with self.assertRaises(KeyError):
            self.manager.require("memory://missing")
        self.manager.register(self.item)
        self.assertTrue(self.manager.remove(self.item.uri))
        self.assertFalse(self.manager.remove(self.item.uri))

    def test_wrong_type_rejected(self):
        with self.assertRaises(TypeError):
            self.manager.register(object())


class ResourceLoaderTests(unittest.TestCase):
    def test_load_text_file(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "hello.txt"
            path.write_text("Hello MCP", encoding="utf-8")
            resource = MCPResourceLoader(allowed_root=folder).load_file(path)
            self.assertEqual(resource.text, "Hello MCP")
            self.assertEqual(resource.name, "hello.txt")

    def test_load_binary_file(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "data.bin"
            path.write_bytes(b"\x00\xff")
            resource = MCPResourceLoader(allowed_root=folder).load_file(path)
            self.assertEqual(resource.blob, b"\x00\xff")

    def test_path_outside_root_rejected(self):
        with tempfile.TemporaryDirectory() as allowed, tempfile.TemporaryDirectory() as other:
            path = Path(other) / "secret.txt"
            path.write_text("secret", encoding="utf-8")
            with self.assertRaises(PermissionError):
                MCPResourceLoader(allowed_root=allowed).load_file(path)

    def test_size_limit(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "large.txt"
            path.write_text("123456", encoding="utf-8")
            with self.assertRaises(ValueError):
                MCPResourceLoader(allowed_root=folder, max_bytes=5).load_file(path)

    def test_missing_file_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(FileNotFoundError):
                MCPResourceLoader(allowed_root=folder).load_file(Path(folder) / "missing.txt")

    def test_remote_file_uri_rejected(self):
        with self.assertRaises(PermissionError):
            MCPResourceLoader().load_uri("file://remote-host/secret.txt")

    def test_helpers(self):
        item = MCPResource("memory://notes/1", "Notes", text="Hello")
        self.assertEqual(resource_to_dict(item)["uri"], item.uri)
        self.assertEqual(resource_content(item)["text"], "Hello")


if __name__ == "__main__":
    unittest.main()
