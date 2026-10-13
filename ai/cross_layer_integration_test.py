"""Cross-layer integration tests for ModelNow MCP bridges."""

import unittest

from ai.action_platform.core.action import ActionDomain
from ai.action_platform.core.models import ActionRequest
from ai.action_platform.mcp_integration import (
    TOOL_NAME as ACTION_TOOL_NAME,
    register_action_platform_tool,
)
from ai.action_platform.registry import ActionRegistry
from ai.agents.enterprise.mcp_integration import register_enterprise_mcp_tools
from ai.browser_automation.mcp_integration import (
    TOOL_NAME as BROWSER_TOOL_NAME,
    register_browser_automation_tool,
)
from ai.mcp.client import MCPClient
from ai.mcp.engine import MCPEngine
from ai.tool_platform.permissions import PermissionContext
from ai.tool_platform.registry import ToolRegistry


class FakeActionHandler:
    """Records calls without performing external actions."""

    def __init__(self):
        self.calls = []

    async def execute(self, request: ActionRequest, context=None):
        self.calls.append((request, context))
        return {"message": "test action executed"}


class CrossLayerIntegrationTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.permissions = PermissionContext(
            user_id="cross-layer-test-user",
            permissions=frozenset({
                "browser:execute",
                "action:shopping",
                "enterprise:crm:read_only",
            }),
        )

        self.registry = ToolRegistry()
        self.action_registry = ActionRegistry()
        self.action_handler = FakeActionHandler()
        self.action_registry.register(
            ActionDomain.SHOPPING,
            self.action_handler,
        )

        register_browser_automation_tool(
            self.registry,
            permission_context=self.permissions,
        )
        register_enterprise_mcp_tools(
            self.registry,
            permission_context=self.permissions,
        )
        register_action_platform_tool(
            self.registry,
            action_registry=self.action_registry,
            permission_context=self.permissions,
        )

        self.engine = MCPEngine(
            self.registry,
            permission_context=self.permissions,
        )
        self.client = MCPClient(self.engine.server)

    async def asyncSetUp(self):
        await self.client.connect()

    async def asyncTearDown(self):
        await self.client.close()

    async def test_all_bridges_share_one_mcp_registry(self):
        tools = await self.client.list_tools()
        names = {
            item["name"] if isinstance(item, dict) else item.name
            for item in tools
        }

        self.assertIn(BROWSER_TOOL_NAME, names)
        self.assertIn(ACTION_TOOL_NAME, names)
        self.assertIn("enterprise_crm_execute", names)
        self.assertIn("enterprise_hr_execute", names)
        self.assertIn("enterprise_erp_execute", names)
        self.assertIn("enterprise_finance_execute", names)
        self.assertIn("enterprise_sales_execute", names)
        self.assertIn("enterprise_business_support_execute", names)
        self.assertIn("enterprise_custom_execute", names)

    async def test_purchase_waits_for_explicit_approval(self):
        result = await self.client.call_tool(
            ACTION_TOOL_NAME,
            {
                "domain": "shopping",
                "goal": "Buy a laptop",
                "payload": {"operation": "purchase"},
                "task_id": "cross-layer-purchase-test",
            },
        )

        self.assertFalse(result.get("isError", False), result)
        self.assertEqual(self.action_handler.calls, [])
        self.assertIn(
            "awaiting_approval",
            result["content"][0]["text"],
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
