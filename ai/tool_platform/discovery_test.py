import unittest

from ai.tool_platform.discovery import ToolDiscovery, ToolResolver, ToolScanner
from ai.tool_platform.registry.models import ToolSpec
from ai.tool_platform.registry.registry import ToolRegistry


def handler(**kwargs):
    return kwargs


class ToolDiscoveryTests(unittest.TestCase):
    def setUp(self):
        self.registry = ToolRegistry()
        self.weather = ToolSpec(
            name="weather",
            description="Get current weather",
            handler=handler,
            tags=("information", "weather"),
        )
        self.search = ToolSpec(
            name="web_search",
            description="Search the web",
            handler=handler,
            tags=("information", "web"),
        )
        self.disabled = ToolSpec(
            name="private_tool",
            description="Disabled private operation",
            handler=handler,
            enabled=False,
            tags=("private",),
        )

        for tool in (self.weather, self.search, self.disabled):
            self.registry.register(tool)

    def test_scanner_lists_enabled_tools_by_default(self):
        tools = ToolScanner(self.registry).scan()
        self.assertEqual({tool.name for tool in tools}, {"weather", "web_search"})

    def test_scanner_can_include_disabled_tools(self):
        tools = ToolScanner(self.registry).scan(enabled_only=False)
        self.assertEqual(len(tools), 3)

    def test_resolver_returns_registered_tool(self):
        tool = ToolResolver(self.registry).resolve("weather")
        self.assertEqual(tool.name, "weather")

    def test_resolver_rejects_disabled_tool(self):
        with self.assertRaises(ValueError):
            ToolResolver(self.registry).resolve("private_tool")

    def test_search_matches_name_or_description_case_insensitively(self):
        tools = ToolDiscovery(self.registry).search("WEATHER")
        self.assertEqual([tool.name for tool in tools], ["weather"])

    def test_search_requires_all_requested_tags(self):
        tools = ToolDiscovery(self.registry).search(
            tags=("information", "web")
        )
        self.assertEqual([tool.name for tool in tools], ["web_search"])

    def test_search_excludes_disabled_tools_by_default(self):
        self.assertEqual(
            ToolDiscovery(self.registry).search("private"),
            [],
        )

    def test_search_can_include_disabled_tools(self):
        tools = ToolDiscovery(self.registry).search(
            "private", enabled_only=False
        )
        self.assertEqual([tool.name for tool in tools], ["private_tool"])

    def test_empty_query_returns_all_enabled_tools(self):
        tools = ToolDiscovery(self.registry).search()
        self.assertEqual(len(tools), 2)


if __name__ == "__main__":
    unittest.main()
