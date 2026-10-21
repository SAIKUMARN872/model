"""Tests for the MCP JSON registry loader and validation helpers."""

import json
import tempfile
import unittest
from pathlib import Path

from ai.mcp.registry import MCPRegistry
from ai.mcp.registry.loader import MCPRegistryLoader, MCPRegistryLoadError
from ai.mcp.registry.utils import (
    validate_registry_document,
    validate_tool_definition,
)
from ai.tool_platform.registry import ToolRegistry, ToolSpec


def sample_handler(arguments=None, **kwargs):
    return {"ok": True}


def sample_document():
    return {
        "tools": [
            {
                "name": "weather_lookup",
                "description": "Look up weather.",
                "version": "1.0.0",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string"}
                    },
                    "required": ["city"],
                },
                "required_permissions": ["weather:read"],
                "tags": ["weather"],
                "enabled": True,
            }
        ]
    }


class RegistryUtilsTests(unittest.TestCase):
    def test_valid_definition_defaults(self):
        result = validate_tool_definition({
            "name": "hello",
            "description": "Say hello.",
        })
        self.assertEqual(result["version"], "1.0.0")
        self.assertEqual(result["required_permissions"], ())
        self.assertTrue(result["enabled"])

    def test_rejects_non_object_definition(self):
        with self.assertRaises(ValueError):
            validate_tool_definition("hello")

    def test_rejects_missing_description(self):
        with self.assertRaises(ValueError):
            validate_tool_definition({"name": "hello"})

    def test_rejects_unknown_fields(self):
        with self.assertRaises(ValueError):
            validate_tool_definition({
                "name": "hello",
                "description": "Hello.",
                "handler": "module.function",
            })

    def test_rejects_duplicate_tools(self):
        document = sample_document()
        document["tools"].append(dict(document["tools"][0]))
        with self.assertRaises(ValueError):
            validate_registry_document(document)

    def test_rejects_invalid_document_shape(self):
        with self.assertRaises(ValueError):
            validate_registry_document([])


class RegistryLoaderTests(unittest.TestCase):
    def setUp(self):
        self.registry = MCPRegistry()
        self.loader = MCPRegistryLoader(self.registry)
        self.handlers = {"weather_lookup": sample_handler}

    def test_loads_valid_document(self):
        result = self.loader.load_data(sample_document(), self.handlers)
        self.assertIs(result, self.registry)
        tool = result.get("weather_lookup")
        self.assertIs(tool.handler, sample_handler)
        self.assertEqual(tool.required_permissions, ("weather:read",))
        self.assertEqual(len(result), 1)

    def test_missing_handler_rejected_without_partial_registration(self):
        document = sample_document()
        document["tools"].append({
            "name": "second_tool",
            "description": "Another tool.",
        })
        with self.assertRaises(MCPRegistryLoadError):
            self.loader.load_data(document, self.handlers)
        self.assertEqual(len(self.registry), 0)

    def test_existing_collision_rejected(self):
        self.registry.register(ToolSpec(
            name="weather_lookup",
            description="Already registered.",
            handler=sample_handler,
        ))
        with self.assertRaises(MCPRegistryLoadError):
            self.loader.load_data(sample_document(), self.handlers)
        self.assertEqual(len(self.registry), 1)

    def test_malformed_document_rejected_without_partial_registration(self):
        document = sample_document()
        document["tools"].append({"name": "invalid"})
        with self.assertRaises(MCPRegistryLoadError):
            self.loader.load_data(document, self.handlers)
        self.assertEqual(len(self.registry), 0)

    def test_loads_json_file(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "registry.json"
            path.write_text(json.dumps(sample_document()), encoding="utf-8")
            self.loader.load_file(path, self.handlers)
        self.assertEqual(len(self.registry), 1)

    def test_missing_file_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "missing.json"
            with self.assertRaises(MCPRegistryLoadError):
                self.loader.load_file(path, self.handlers)

    def test_invalid_json_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "registry.json"
            path.write_text("{invalid", encoding="utf-8")
            with self.assertRaises(MCPRegistryLoadError):
                self.loader.load_file(path, self.handlers)

    def test_file_size_limit(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "registry.json"
            path.write_text(json.dumps(sample_document()), encoding="utf-8")
            loader = MCPRegistryLoader(max_bytes=4)
            with self.assertRaises(MCPRegistryLoadError):
                loader.load_file(path, self.handlers)

    def test_accepts_tool_platform_registry(self):
        raw_registry = ToolRegistry()
        loader = MCPRegistryLoader(raw_registry)
        result = loader.load_data(sample_document(), self.handlers)
        self.assertIs(result.registry, raw_registry)


if __name__ == "__main__":
    unittest.main()
