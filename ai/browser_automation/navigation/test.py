"""Navigation module unit tests."""

import unittest
from unittest.mock import AsyncMock

from ai.browser_automation.navigation import (
    NavigationPlanner,
    NavigationRoute,
    SafeNavigator,
    normalize_url,
    validate_routes,
    validate_url,
)


class URLValidationTests(unittest.TestCase):
    def test_accepts_https_url(self):
        self.assertEqual(
            validate_url("https://example.com"),
            "https://example.com/",
        )

    def test_normalizes_scheme_case(self):
        self.assertEqual(
            normalize_url("HTTPS://example.com/path"),
            "https://example.com/path",
        )

    def test_rejects_unsupported_schemes(self):
        for url in ("file:///etc/passwd", "javascript:alert(1)", "ftp://example.com"):
            with self.subTest(url=url), self.assertRaises(ValueError):
                validate_url(url)

    def test_rejects_credentials(self):
        with self.assertRaises(ValueError):
            validate_url("https://user:password@example.com")

    def test_rejects_local_or_private_destinations(self):
        for url in (
            "http://localhost",
            "http://127.0.0.1",
            "http://192.168.1.10",
            "http://169.254.169.254",
        ):
            with self.subTest(url=url), self.assertRaises(ValueError):
                validate_url(url)

    def test_https_only_mode(self):
        with self.assertRaises(ValueError):
            validate_url("http://example.com", allow_http=False)


class PlannerTests(unittest.TestCase):
    def test_plans_and_deduplicates_routes(self):
        routes = [
            NavigationRoute("home", "https://example.com"),
            NavigationRoute("duplicate", "https://example.com/"),
            NavigationRoute("docs", "https://example.org/docs"),
        ]
        plan = NavigationPlanner().plan("Visit documentation", routes)
        self.assertEqual(len(plan.routes), 2)
        self.assertEqual(plan.routes[0].name, "home")

    def test_limits_route_count(self):
        routes = [
            NavigationRoute("one", "https://one.example"),
            NavigationRoute("two", "https://two.example"),
        ]
        self.assertEqual(
            len(NavigationPlanner().plan("visit", routes, max_routes=1).routes),
            1,
        )

    def test_rejects_invalid_plan(self):
        with self.assertRaises(ValueError):
            NavigationPlanner().plan(" ", [])
        with self.assertRaises(ValueError):
            NavigationPlanner().plan("visit", [], max_routes=0)

    def test_rejects_invalid_route_type(self):
        with self.assertRaises(TypeError):
            validate_routes(["https://example.com"])


class NavigatorTests(unittest.IsolatedAsyncioTestCase):
    async def test_navigates_and_reports_final_url(self):
        page = type("FakePage", (), {})()
        page.goto = AsyncMock(return_value=type("Response", (), {"status": 200})())
        page.url = "https://example.com/"
        result = await SafeNavigator().navigate(page, "https://example.com")
        self.assertEqual(result["http_status"], 200)
        self.assertFalse(result["redirected"])

    async def test_rejects_blocked_redirect_destination(self):
        page = type("FakePage", (), {})()
        page.goto = AsyncMock(return_value=None)
        page.url = "http://127.0.0.1/"
        with self.assertRaises(RuntimeError):
            await SafeNavigator().navigate(page, "https://example.com")

    async def test_rejects_invalid_url_before_navigation(self):
        page = type("FakePage", (), {})()
        page.goto = AsyncMock(return_value=None)
        page.url = "https://example.com/"
        with self.assertRaises(ValueError):
            await SafeNavigator().navigate(page, "file:///etc/passwd")
        page.goto.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
