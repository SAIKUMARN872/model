"""Tests for browser page extraction."""

import unittest

from ai.browser_automation.extractor import PageExtractor, normalize_text


class FakeLocator:
    def __init__(self, selector):
        self.selector = selector

    async def inner_text(self):
        return "  ModelNow   browser\n\n automation  "

    async def evaluate_all(self, script):
        return [
            {"text": "Home", "href": "https://example.com/home"},
            {"text": "Duplicate", "href": "https://example.com/home"},
            {"text": "Unsafe", "href": "javascript:alert(1)"},
            {"text": "Relative", "href": "/docs"},
        ]

    async def get_attribute(self, name):
        if self.selector == 'meta[name="description"]':
            return "  Browser automation platform  "
        if self.selector == 'link[rel="canonical"]':
            return "https://example.com/canonical"
        return None


class FakePage:
    url = "https://example.com/start"

    async def title(self):
        return " Example Page "

    def locator(self, selector):
        return FakeLocator(selector)


class ExtractionTests(unittest.IsolatedAsyncioTestCase):
    async def test_extracts_content_metadata_and_links(self):
        result = await PageExtractor().extract(FakePage())

        self.assertEqual(result["metadata"]["title"], "Example Page")
        self.assertEqual(
            result["metadata"]["description"],
            "Browser automation platform",
        )
        self.assertEqual(
            result["content"]["text"],
            "ModelNow browser\n\n automation",
        )
        self.assertEqual(len(result["content"]["links"]), 2)
        self.assertFalse(result["truncated"])

    async def test_respects_link_limit(self):
        result = await PageExtractor(max_links=1).extract(FakePage())
        self.assertEqual(len(result["content"]["links"]), 1)

    async def test_reports_truncated_text(self):
        result = await PageExtractor(max_chars=8).extract(FakePage())
        self.assertTrue(result["truncated"])
        self.assertLessEqual(len(result["content"]["text"]), 8)

    async def test_rejects_missing_page(self):
        with self.assertRaises(ValueError):
            await PageExtractor().extract(None)

    def test_normalizes_and_limits_text(self):
        self.assertEqual(normalize_text("  hello   world  "), "hello world")
        self.assertEqual(normalize_text("abcdef", max_chars=3), "abc")

    def test_rejects_invalid_text(self):
        with self.assertRaises(TypeError):
            normalize_text(123)

    def test_rejects_invalid_limit(self):
        with self.assertRaises(ValueError):
            PageExtractor(max_chars=-1)


if __name__ == "__main__":
    unittest.main()
