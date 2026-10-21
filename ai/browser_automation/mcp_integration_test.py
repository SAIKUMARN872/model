"""End-to-end tests for the browser automation MCP adapter."""

import asyncio
import unittest

from ai.browser_automation.constants import BrowserTaskStatus
from ai.browser_automation.engine import BrowserAutomationEngine
from ai.browser_automation.mcp_integration import (
    TOOL_NAME,
    _build_task,
    register_browser_automation_tool,
)
from ai.browser_automation.exceptions import UnsafeUrlError
from ai.tool_platform.permissions import PermissionContext
from ai.tool_platform.registry import ToolRegistry
from ai.mcp.engine import MCPEngine
from ai.mcp.client import MCPClient


class BrowserMCPAdapterTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.context = PermissionContext(
            user_id="browser-mcp-test-user",
            permissions=frozenset({"browser:execute"}),
        )
        self.registry = ToolRegistry()

    def test_build_task_rejects_unknown_action(self):
        with self.assertRaises(ValueError):
            _build_task({
                "goal": "Invalid action",
                "actions": [{"action_type": "delete_everything"}],
            })

    def test_build_task_rejects_private_navigation(self):
        with self.assertRaises(UnsafeUrlError):
            _build_task({
                "goal": "Visit local service",
                "start_url": "http://127.0.0.1:8765/",
            })

    async def test_mcp_discovers_registered_browser_tool(self):
        register_browser_automation_tool(
            self.registry,
            permission_context=self.context,
        )
        engine = MCPEngine(
            self.registry,
            permission_context=self.context,
        )
        client = MCPClient(engine.server)
        try:
            await client.connect()
            tools = await client.list_tools()
            names = [
                item.get("name") if isinstance(item, dict)
                else getattr(item, "name", None)
                for item in tools
            ]
            self.assertIn(TOOL_NAME, names)
        finally:
            await client.close()

    async def test_real_chromium_task_through_mcp(self):
        try:
            from playwright.async_api import async_playwright
        except ImportError:
            self.skipTest("Playwright is not installed.")

        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            try:
                await page.set_content(
                    "<html><head><title>ModelNow MCP Test</title></head>"
                    "<body><input id='name' />"
                    "<button id='submit' onclick=\"document.title="
                    "'Submitted'\">Submit</button></body></html>"
                )

                register_browser_automation_tool(
                    self.registry,
                    permission_context=self.context,
                    engine=BrowserAutomationEngine(page=page),
                )
                engine = MCPEngine(
                    self.registry,
                    permission_context=self.context,
                )
                client = MCPClient(engine.server)
                try:
                    await client.connect()
                    response = await client.call_tool(
                        TOOL_NAME,
                        {
                            "goal": "Fill and submit the test form",
                            "actions": [
                                {
                                    "action_type": "fill",
                                    "selector": "#name",
                                    "value": "ModelNow",
                                },
                                {
                                    "action_type": "click",
                                    "selector": "#submit",
                                },
                            ],
                        },
                    )

                    self.assertEqual(
                        await page.locator("#name").input_value(),
                        "ModelNow",
                    )
                    self.assertEqual(await page.title(), "Submitted")
                    self.assertIsNotNone(response)
                finally:
                    await client.close()
            finally:
                await context.close()
                await browser.close()

    async def test_sensitive_action_waits_for_trusted_approval(self):
        class FakePage:
            url = "about:blank"

            def __init__(self):
                self.clicked = False

            async def title(self):
                return "Approval test"

            def locator(self, selector):
                page = self

                class Locator:
                    async def click(self, **kwargs):
                        page.clicked = True

                return Locator()

        page = FakePage()
        register_browser_automation_tool(
            self.registry,
            permission_context=self.context,
            engine=BrowserAutomationEngine(page=page),
        )
        engine = MCPEngine(
            self.registry,
            permission_context=self.context,
        )
        client = MCPClient(engine.server)
        try:
            await client.connect()
            await client.call_tool(
                TOOL_NAME,
                {
                    "goal": "Buy an item",
                    "actions": [{
                        "action_type": "click",
                        "selector": "#buy-now",
                    }],
                },
            )
            self.assertFalse(page.clicked)
        finally:
            await client.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
