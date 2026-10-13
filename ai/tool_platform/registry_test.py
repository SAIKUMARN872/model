import unittest

from ai.tool_platform.registry.models import ToolSpec
from ai.tool_platform.registry.registry import ToolNotFoundError, ToolRegistry
from ai.tool_platform.registry.schemas import (
    validate_input_schema,
    validate_tool_name,
    validate_version,
)


def handler(**kwargs):
    return kwargs


class SchemaTests(unittest.TestCase):
    def test_valid_schema(self):
        schema = {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        }
        self.assertIs(validate_input_schema(schema), schema)

    def test_rejects_required_field_not_declared(self):
        with self.assertRaises(ValueError):
            validate_input_schema({
                "properties": {},
                "required": ["missing"],
            })

    def test_validates_name_and_version(self):
        self.assertEqual(validate_tool_name("weather.lookup"), "weather.lookup")
        self.assertEqual(validate_version("1.2.3"), "1.2.3")
        with self.assertRaises(ValueError):
            validate_tool_name("bad name")


class ToolSpecTests(unittest.TestCase):
    def test_rejects_missing_name(self):
        with self.assertRaises(ValueError):
            ToolSpec("", "Description", handler)

    def test_rejects_invalid_version(self):
        with self.assertRaises(ValueError):
            ToolSpec("sample", "Description", handler, version="1.0")

    def test_rejects_non_callable_handler(self):
        with self.assertRaises(ValueError):
            ToolSpec("sample", "Description", "not callable")


class ToolRegistryTests(unittest.TestCase):
    def setUp(self):
        self.registry = ToolRegistry()

    def make_tool(self, name="weather", version="1.0.0", **kwargs):
        return ToolSpec(
            name=name,
            description="Weather lookup",
            handler=handler,
            version=version,
            **kwargs,
        )

    def test_register_and_get(self):
        tool = self.make_tool()
        self.registry.register(tool)
        self.assertIs(self.registry.get("weather"), tool)

    def test_rejects_duplicate_name_and_version(self):
        self.registry.register(self.make_tool())
        with self.assertRaises(ValueError):
            self.registry.register(self.make_tool())

    def test_unknown_tool_raises_clear_error(self):
        with self.assertRaises(ToolNotFoundError):
            self.registry.get("missing")

    def test_unregister(self):
        self.registry.register(self.make_tool())
        self.assertTrue(self.registry.unregister("weather", "1.0.0"))
        self.assertFalse(self.registry.unregister("weather", "1.0.0"))
        with self.assertRaises(ToolNotFoundError):
            self.registry.get("weather")

    def test_filters_disabled_tools(self):
        self.registry.register(self.make_tool())
        self.registry.register(
            self.make_tool("disabled", enabled=False)
        )
        self.assertEqual(
            [tool.name for tool in self.registry.list_tools(enabled_only=True)],
            ["weather"],
        )

    def test_allows_multiple_versions_and_selects_highest(self):
        older = self.make_tool(version="1.2.0")
        newer = self.make_tool(version="1.10.0")
        self.registry.register(older)
        self.registry.register(newer)
        self.assertIs(self.registry.get("weather"), newer)
        self.assertIs(self.registry.get("weather", "1.2.0"), older)


if __name__ == "__main__":
    unittest.main()
