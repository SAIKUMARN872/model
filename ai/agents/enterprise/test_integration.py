import unittest

from ai.agents.constants import AgentStatus
from ai.agents.models import AgentContext, AgentRequest
from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.integration import create_enterprise_platform


class EnterpriseIntegrationTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.platform = create_enterprise_platform()

    def test_all_seven_departments_are_registered(self):
        self.assertEqual(len(self.platform.registry.list_agents()), 7)

        expected = {
            "business_support",
            "crm",
            "custom",
            "erp",
            "finance",
            "hr",
            "sales",
        }
        actual = {agent.domain.value for agent in self.platform.registry.list_agents()}
        self.assertEqual(actual, expected)

    def test_all_seven_gateways_are_registered_in_engine(self):
        expected = {
            f"enterprise-gateway-{domain.value}"
            for domain in EnterpriseDomain
        }
        self.assertEqual(set(self.platform.engine.list_agents()), expected)

    async def test_missing_permission_is_denied_by_router(self):
        request = AgentRequest(
            input="qualify_lead",
            task_id="integration-permission-denied",
            context=AgentContext(
                user_id="integration-test-user",
                permissions=(),
            ),
        )

        response = await self.platform.execute(EnterpriseDomain.CRM, request)

        self.assertEqual(response.status, AgentStatus.FAILED)
        self.assertIn("EnterprisePermissionError", response.error or "")

    async def test_wrong_domain_task_is_rejected_by_gateway(self):
        request = AgentRequest(
            input="review_leave",
            task_id="integration-wrong-domain",
            metadata={
                "enterprise_task": {
                    "task_id": "integration-wrong-domain",
                    "domain": "hr",
                    "action": "review_leave",
                }
            },
            context=AgentContext(
                user_id="integration-test-user",
                permissions=("enterprise:crm:*",),
            ),
        )

        response = await self.platform.execute(EnterpriseDomain.CRM, request)

        self.assertEqual(response.status, AgentStatus.FAILED)
        self.assertIn("EnterpriseRoutingError", response.error or "")


if __name__ == "__main__":
    unittest.main()
