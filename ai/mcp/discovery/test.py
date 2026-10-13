"""Tests for MCP discovery."""
import unittest

from ai.mcp.discovery import (
    MCPDiscovery,
    MCPDiscoveryIndexer,
    normalize_query,
    scan_resources,
    scan_tools,
)
from ai.mcp.resources import MCPResource, MCPResourceManager
from ai.tool_platform.registry import ToolRegistry, ToolSpec


class DiscoveryUtilityTests(unittest.TestCase):
    def test_normalize_query(self):
        self.assertEqual(normalize_query("  Find   WEATHER "), "find weather")

    def test_non_string_query_rejected(self):
        with self.assertRaises(TypeError):
            normalize_query(None)

    def test_score_prefers_exact_name(self):
        from ai.mcp.discovery import score_match
        item = {"name": "weather", "description": "Weather lookup"}
        self.assertGreater(score_match("weather", item), score_match("weath", item))


class DiscoveryIndexerTests(unittest.TestCase):
    def setUp(self):
        self.indexer = MCPDiscoveryIndexer()
        self.indexer.rebuild([
            {"kind": "tool", "name": "weather_lookup",
             "description": "Current weather", "tags": ["weather", "utility"]},
            {"kind": "tool", "name": "currency_convert",
             "description": "Convert currencies", "tags": ["finance", "utility"]},
            {"kind": "resource", "name": "weather guide",
             "uri": "memory://weather", "description": "Weather reference",
             "tags": ["weather"]},
        ])

    def test_search_by_name_and_description(self):
        self.assertEqual(self.indexer.search("weather")[0]["name"], "weather_lookup")

    def test_filter_kind(self):
        results = self.indexer.search("weather", kind="resource")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["kind"], "resource")

    def test_filter_tags(self):
        results = self.indexer.search("", tags=["utility"])
        self.assertEqual(len(results), 2)

    def test_limit_validation(self):
        with self.assertRaises(ValueError):
            self.indexer.search("", limit=0)

    def test_unknown_kind_rejected(self):
        with self.assertRaises(ValueError):
            self.indexer.search("", kind="server")

    def test_rebuild_and_add(self):
        self.indexer.add({"kind": "tool", "name": "ping", "description": "Health check"})
        self.assertEqual(len(self.indexer.all_items()), 4)
        self.assertEqual(self.indexer.rebuild([]), 0)
        self.assertEqual(self.indexer.all_items(), [])

    def test_results_do_not_mutate_index(self):
        results = self.indexer.search("weather")
        results[0]["name"] = "modified"
        self.assertNotEqual(self.indexer.search("weather")[0]["name"], "modified")


class DiscoveryScannerTests(unittest.TestCase):
    def test_scan_tool_registry(self):
        registry = ToolRegistry()
        registry.register(ToolSpec(
            name="weather_lookup",
            description="Get weather",
            handler=lambda: None,
            tags=("weather",),
        ))
        items = scan_tools(registry)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["name"], "weather_lookup")

    def test_scan_resource_manager(self):
        manager = MCPResourceManager()
        manager.register(MCPResource(
            "memory://guide", "Guide", text="Content", description="Helpful guide"
        ))
        items = scan_resources(manager)
        self.assertEqual(items[0]["uri"], "memory://guide")

    def test_none_sources_are_empty(self):
        self.assertEqual(scan_tools(None), [])
        self.assertEqual(scan_resources(None), [])


class DiscoveryServiceTests(unittest.TestCase):
    def test_refresh_search_and_get_resource(self):
        registry = ToolRegistry()
        registry.register(ToolSpec(
            name="weather_lookup",
            description="Get current weather",
            handler=lambda: None,
            tags=("weather",),
        ))
        resources = MCPResourceManager()
        resource = MCPResource("memory://guide", "Weather guide", text="Weather help")
        resources.register(resource)

        discovery = MCPDiscovery(registry, resources)
        self.assertEqual(discovery.refresh(), 2)
        self.assertEqual(len(discovery.list_tools("weather")), 1)
        self.assertEqual(len(discovery.list_resources("weather")), 1)
        self.assertEqual(discovery.get_resource(resource.uri)["name"], "Weather guide")
        self.assertIsNone(discovery.get_resource("memory://missing"))


if __name__ == "__main__":
    unittest.main()
