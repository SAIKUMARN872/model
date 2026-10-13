"""Offline tests for the ModelNow scraper."""

import unittest
from unittest.mock import MagicMock, patch

from ai.browser_automation.scraper.extractor import extract_html
from ai.browser_automation.scraper.parser import parse_html
from ai.browser_automation.scraper.scraper import Scraper, ScraperError
from ai.browser_automation.scraper.utils import normalize_text, validate_url


SAMPLE_HTML = """
<html>
<head>
  <title>Example Page</title>
  <meta name="description" content="A sample page">
  <meta property="og:title" content="Example">
  <script>secret_script_text()</script>
  <style>.hidden { display: none; }</style>
</head>
<body>
  <h1>Welcome</h1>
  <h2>Documentation</h2>
  <p>Hello   from ModelNow.</p>
  <a href="/docs">Read docs</a>
  <a href="javascript:alert(1)">Unsafe link</a>
</body>
</html>
"""


class TestScraperUtils(unittest.TestCase):
    def test_normalize_text(self):
        self.assertEqual(normalize_text("  hello \n world  "), "hello world")
        self.assertEqual(normalize_text(None), "")

    def test_rejects_unsupported_schemes(self):
        with self.assertRaises(ValueError):
            validate_url("file:///etc/passwd")

    def test_rejects_localhost(self):
        with self.assertRaises(ValueError):
            validate_url("http://localhost:8000")

    def test_rejects_private_ip(self):
        with self.assertRaises(ValueError):
            validate_url("http://127.0.0.1")


class TestExtractor(unittest.TestCase):
    def test_extracts_page_content(self):
        result = extract_html(
            SAMPLE_HTML,
            base_url="https://example.com/start",
        )

        self.assertEqual(result["title"], "Example Page")
        self.assertIn("Welcome", [h["text"] for h in result["headings"]])
        self.assertEqual(result["metadata"]["description"], "A sample page")
        self.assertEqual(result["links"][0]["url"], "https://example.com/docs")
        self.assertNotIn("javascript:alert(1)", [link["url"] for link in result["links"]])
        self.assertNotIn("secret_script_text", result["text"])

    def test_rejects_non_string_html(self):
        with self.assertRaises(TypeError):
            extract_html(None)


class TestParser(unittest.TestCase):
    def test_normalized_schema(self):
        result = parse_html(SAMPLE_HTML, "https://example.com")

        self.assertEqual(result["url"], "https://example.com")
        self.assertEqual(result["title"], "Example Page")
        self.assertEqual(result["description"], "A sample page")
        self.assertGreater(result["word_count"], 0)
        self.assertIsInstance(result["links"], list)
        self.assertIsInstance(result["headings"], list)


class TestScraper(unittest.TestCase):
    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_rejects_oversized_streamed_response(
        self, mock_validate, mock_build_opener
    ):
        mock_validate.side_effect = lambda url: url

        response = MagicMock()
        response.geturl.return_value = "https://example.com/"
        response.headers.get_content_type.return_value = "text/html"
        response.headers.get_content_charset.return_value = "utf-8"
        response.headers.get.return_value = None
        response.read.return_value = b"12345"
        response.__enter__.return_value = response

        opener = MagicMock()
        opener.open.return_value = response
        mock_build_opener.return_value = opener

        with self.assertRaisesRegex(ScraperError, "size limit"):
            Scraper(max_bytes=4).scrape("https://example.com/")

        response.read.assert_called_once_with(5)

    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_rejects_oversized_content_length(
        self, mock_validate, mock_build_opener
    ):
        mock_validate.side_effect = lambda url: url

        response = MagicMock()
        response.geturl.return_value = "https://example.com/"
        response.headers.get_content_type.return_value = "text/html"
        response.headers.get.return_value = "100"
        response.__enter__.return_value = response

        opener = MagicMock()
        opener.open.return_value = response
        mock_build_opener.return_value = opener

        with self.assertRaisesRegex(ScraperError, "size limit"):
            Scraper(max_bytes=4).scrape("https://example.com/")

        response.read.assert_not_called()

    def test_rejects_redirect_to_private_destination(self):
        from urllib.request import Request

        from ai.browser_automation.scraper.scraper import (
            _SafeRedirectHandler,
        )

        handler = _SafeRedirectHandler()
        request = Request("https://example.com/")
        response = MagicMock()

        with self.assertRaisesRegex(ScraperError, "Unsafe redirect rejected"):
            handler.redirect_request(
                request,
                response,
                302,
                "Found",
                {},
                "http://127.0.0.1/",
            )

    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_reports_http_errors(self, mock_validate, mock_build_opener):
        from urllib.error import HTTPError

        mock_validate.side_effect = lambda url: url

        opener = MagicMock()
        opener.open.side_effect = HTTPError(
            "https://example.com/",
            503,
            "Service Unavailable",
            {},
            None,
        )
        mock_build_opener.return_value = opener

        with self.assertRaisesRegex(ScraperError, "HTTP error: 503"):
            Scraper().scrape("https://example.com/")

    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_reports_network_timeout(self, mock_validate, mock_build_opener):
        mock_validate.side_effect = lambda url: url

        opener = MagicMock()
        opener.open.side_effect = TimeoutError("timed out")
        mock_build_opener.return_value = opener

        with self.assertRaisesRegex(ScraperError, "timed out"):
            Scraper().scrape("https://example.com/")

    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_rejects_unsupported_content_type(
        self, mock_validate, mock_build_opener
    ):
        mock_validate.side_effect = lambda url: url

        response = MagicMock()
        response.geturl.return_value = "https://example.com/data.json"
        response.headers.get_content_type.return_value = "application/json"
        response.__enter__.return_value = response

        opener = MagicMock()
        opener.open.return_value = response
        mock_build_opener.return_value = opener

        with self.assertRaisesRegex(
            ScraperError, "Unsupported content type: application/json"
        ):
            Scraper().scrape("https://example.com/data.json")

        response.read.assert_not_called()

    def test_scrape_many_continues_after_failure(self):
        scraper = Scraper()

        with patch.object(
            scraper,
            "scrape",
            side_effect=[
                ScraperError("first page failed"),
                {"title": "Second page", "word_count": 2},
            ],
        ) as mock_scrape:
            results = scraper.scrape_many([
                "https://example.com/first",
                "https://example.com/second",
            ])

        self.assertEqual(len(results), 2)
        self.assertFalse(results[0]["success"])
        self.assertEqual(results[0]["url"], "https://example.com/first")
        self.assertEqual(results[0]["error"], "first page failed")
        self.assertTrue(results[1]["success"])
        self.assertEqual(results[1]["result"]["title"], "Second page")
        self.assertEqual(mock_scrape.call_count, 2)
    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_scrapes_mocked_html(self, mock_validate, mock_build_opener):
        mock_validate.side_effect = lambda url: url

        response = MagicMock()
        response.geturl.return_value = "https://example.com/"
        response.status = 200
        response.headers.get_content_type.return_value = "text/html"
        response.headers.get_content_charset.return_value = "utf-8"
        response.headers.get.return_value = str(len(SAMPLE_HTML))
        response.read.return_value = SAMPLE_HTML.encode("utf-8")
        response.__enter__.return_value = response

        opener = MagicMock()
        opener.open.return_value = response
        mock_build_opener.return_value = opener

        result = Scraper().scrape("https://example.com/")

        self.assertEqual(result["title"], "Example Page")
        self.assertEqual(result["status"], 200)
        self.assertEqual(result["content_type"], "text/html")

    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_rejects_oversized_streamed_response(
        self, mock_validate, mock_build_opener
    ):
        mock_validate.side_effect = lambda url: url

        response = MagicMock()
        response.geturl.return_value = "https://example.com/"
        response.headers.get_content_type.return_value = "text/html"
        response.headers.get_content_charset.return_value = "utf-8"
        response.headers.get.return_value = None
        response.read.return_value = b"12345"
        response.__enter__.return_value = response

        opener = MagicMock()
        opener.open.return_value = response
        mock_build_opener.return_value = opener

        with self.assertRaisesRegex(ScraperError, "size limit"):
            Scraper(max_bytes=4).scrape("https://example.com/")

        response.read.assert_called_once_with(5)

    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_rejects_oversized_content_length(
        self, mock_validate, mock_build_opener
    ):
        mock_validate.side_effect = lambda url: url

        response = MagicMock()
        response.geturl.return_value = "https://example.com/"
        response.headers.get_content_type.return_value = "text/html"
        response.headers.get.return_value = "100"
        response.__enter__.return_value = response

        opener = MagicMock()
        opener.open.return_value = response
        mock_build_opener.return_value = opener

        with self.assertRaisesRegex(ScraperError, "size limit"):
            Scraper(max_bytes=4).scrape("https://example.com/")

        response.read.assert_not_called()

    def test_rejects_redirect_to_private_destination(self):
        from urllib.request import Request

        from ai.browser_automation.scraper.scraper import (
            _SafeRedirectHandler,
        )

        handler = _SafeRedirectHandler()
        request = Request("https://example.com/")
        response = MagicMock()

        with self.assertRaisesRegex(ScraperError, "Unsafe redirect rejected"):
            handler.redirect_request(
                request,
                response,
                302,
                "Found",
                {},
                "http://127.0.0.1/",
            )

    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_reports_http_errors(self, mock_validate, mock_build_opener):
        from urllib.error import HTTPError

        mock_validate.side_effect = lambda url: url

        opener = MagicMock()
        opener.open.side_effect = HTTPError(
            "https://example.com/",
            503,
            "Service Unavailable",
            {},
            None,
        )
        mock_build_opener.return_value = opener

        with self.assertRaisesRegex(ScraperError, "HTTP error: 503"):
            Scraper().scrape("https://example.com/")

    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_reports_network_timeout(self, mock_validate, mock_build_opener):
        mock_validate.side_effect = lambda url: url

        opener = MagicMock()
        opener.open.side_effect = TimeoutError("timed out")
        mock_build_opener.return_value = opener

        with self.assertRaisesRegex(ScraperError, "timed out"):
            Scraper().scrape("https://example.com/")

    @patch("ai.browser_automation.scraper.scraper.build_opener")
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_rejects_unsupported_content_type(
        self, mock_validate, mock_build_opener
    ):
        mock_validate.side_effect = lambda url: url

        response = MagicMock()
        response.geturl.return_value = "https://example.com/data.json"
        response.headers.get_content_type.return_value = "application/json"
        response.__enter__.return_value = response

        opener = MagicMock()
        opener.open.return_value = response
        mock_build_opener.return_value = opener

        with self.assertRaisesRegex(
            ScraperError, "Unsupported content type: application/json"
        ):
            Scraper().scrape("https://example.com/data.json")

        response.read.assert_not_called()

    def test_scrape_many_continues_after_failure(self):
        scraper = Scraper()

        with patch.object(
            scraper,
            "scrape",
            side_effect=[
                ScraperError("first page failed"),
                {"title": "Second page", "word_count": 2},
            ],
        ) as mock_scrape:
            results = scraper.scrape_many([
                "https://example.com/first",
                "https://example.com/second",
            ])

        self.assertEqual(len(results), 2)
        self.assertFalse(results[0]["success"])
        self.assertEqual(results[0]["url"], "https://example.com/first")
        self.assertEqual(results[0]["error"], "first page failed")
        self.assertTrue(results[1]["success"])
        self.assertEqual(results[1]["result"]["title"], "Second page")
        self.assertEqual(mock_scrape.call_count, 2)
    @patch("ai.browser_automation.scraper.scraper.validate_url")
    def test_rejects_invalid_url(self, mock_validate):
        mock_validate.side_effect = ValueError("blocked destination")

        with self.assertRaises(ScraperError):
            Scraper().scrape("http://127.0.0.1")

    def test_rejects_invalid_limits(self):
        with self.assertRaises(ValueError):
            Scraper(timeout=0)

        with self.assertRaises(ValueError):
            Scraper(max_bytes=0)


if __name__ == "__main__":
    unittest.main(verbosity=2)




