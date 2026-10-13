"""End-to-end tests for enterprise operations exposed through MCP."""

import json
import unittest

from ai.agents.enterprise.audit import InMemoryEnterpriseAuditLog
from ai.agents.enterprise.constants import EnterpriseDomain, EnterpriseTaskStatus
from ai.agents.enterprise.integration import create_enterprise_platform
from ai.agents.enterprise.mcp_integration import (
    create_enterprise_mcp_engine,
    register_enterprise_mcp_tools,
)
from ai.mcp.client import MCPClient
from ai.tool_platform.permissions import PermissionContext
from ai.tool_platform.registry import ToolRegistry


class EnterpriseMCPIntegrationTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.audit_log = InMemoryEnterpriseAuditLog()
        self.platform = create_enterprise_platform(audit_log=self.audit_log)
        self.context = PermissionContext(
            user_id="enterprise-mcp-test-user",
            permissions=frozenset({
                "enterprise:crm:qualify_lead",
                "enterprise:crm:*",
                "enterprise:hr:review_leave",
            }),
        )
        self.engine = create_enterprise_mcp_engine(
            permission_context=self.context,
            platform=self.platform,
        )
        self.client = MCPClient(self.engine.server)

    async def asyncTearDown(self):
        await self.client.close()

    async def test_discovers_all_seven_enterprise_tools(self):
        tools = await self.client.list_tools()
        names = {item["name"] for item in tools}
        expected = {
            f"enterprise_{domain.value}_execute"
            for domain in EnterpriseDomain
        }
        self.assertTrue(expected.issubset(names))

    async def test_authorized_operation_runs_through_mcp_and_is_audited(self):
        customer_result = await self.client.call_tool(
            "enterprise_crm_execute",
            {
                "action": "create_customer",
                "payload": {
                    "workflow_id": "mcp-crm-authorized-test",
                    "name": "MCP Integration Test Customer",
                    "city": "Hyderabad",
                    "vehicle_interest": "Range Rover Sport",
                    "budget": 15000000,
                    "timeline_days": 30,
                },
                "task_id": "mcp-crm-customer-test",
            },
        )
        self.assertFalse(customer_result.get("isError", False), customer_result)
        customer_response = json.loads(customer_result["content"][0]["text"])
        customer = json.loads(customer_response["output"])
        customer_id = customer["result"]["id"]

        lead_result = await self.client.call_tool(
            "enterprise_crm_execute",
            {
                "action": "create_lead",
                "payload": {
                    "workflow_id": "mcp-crm-authorized-test",
                    "customer_id": customer_id,
                },
                "task_id": "mcp-crm-lead-test",
            },
        )
        self.assertFalse(lead_result.get("isError", False), lead_result)
        lead_response = json.loads(lead_result["content"][0]["text"])
        lead = json.loads(lead_response["output"])
        lead_id = lead["result"]["id"]

        task_id = "mcp-crm-authorized-test"
        result = await self.client.call_tool(
            "enterprise_crm_execute",
            {
                "action": "qualify_lead",
                "payload": {"lead_id": lead_id},
                "task_id": task_id,
            },
        )

        self.assertFalse(result.get("isError", False), result)
        events = self.audit_log.list_events(task_id)
        self.assertEqual(
            [event.status for event in events],
            [
                EnterpriseTaskStatus.PENDING,
                EnterpriseTaskStatus.RUNNING,
                EnterpriseTaskStatus.COMPLETED,
            ],
        )
        self.assertTrue(all(event.actor_id == self.context.user_id for event in events))

        content = result.get("content", [])
        self.assertTrue(content, result)
        parsed = json.loads(content[0]["text"])
        self.assertEqual(parsed["task_id"], task_id)
        self.assertEqual(parsed["domain"], "crm")
        self.assertEqual(parsed["status"], "completed")
        crm_output = json.loads(parsed["output"])
        self.assertTrue(crm_output["result"]["qualified"])

    async def test_missing_action_permission_is_denied_before_execution(self):
        restricted_context = PermissionContext(
            user_id="restricted-enterprise-user",
            permissions=frozenset({"enterprise:crm:read_only"}),
        )
        registry = ToolRegistry()
        register_enterprise_mcp_tools(
            registry,
            permission_context=restricted_context,
            platform=self.platform,
        )
        from ai.mcp.engine import MCPEngine

        client = MCPClient(
            MCPEngine(registry, permission_context=restricted_context).server
        )
        task_id = "mcp-crm-denied-test"
        try:
            result = await client.call_tool(
                "enterprise_crm_execute",
                {"action": "qualify_lead", "task_id": task_id},
            )
            self.assertTrue(result.get("isError", False), result)
            self.assertEqual(self.audit_log.list_events(task_id), ())
        finally:
            await client.close()

    async def test_client_cannot_supply_trusted_identity_or_permissions(self):
        with self.assertRaisesRegex(
            RuntimeError, "Unexpected arguments: permissions, user_id"
        ):
            await self.client.call_tool(
                "enterprise_crm_execute",
                {
                    "action": "qualify_lead",
                    "user_id": "forged-user",
                    "permissions": ["enterprise:crm:*"],
                },
            )

    async def test_all_departments_use_the_existing_platform(self):
        self.assertEqual(len(self.platform.registry.list_agents()), 7)
        self.assertEqual(len(self.platform.engine.list_agents()), 7)


if __name__ == "__main__":
    unittest.main(verbosity=2)


