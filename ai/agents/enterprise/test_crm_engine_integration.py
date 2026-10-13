import json
import unittest

from ai.agents.constants import AgentStatus
from ai.agents.models import AgentContext, AgentRequest
from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.integration import create_enterprise_platform


class CRMEngineIntegrationTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.platform = create_enterprise_platform()

    async def test_authorized_customer_creation_through_engine(self):
        request = AgentRequest(
            input="create_customer",
            task_id="crm-engine-customer-001",
            metadata={
                "payload": {
                    "workflow_id": "engine-integration-test",
                    "name": "Integration Test Customer",
                    "city": "Hyderabad",
                    "vehicle_interest": "Range Rover Sport",
                    "budget": 15000000,
                    "timeline_days": 30,
                    "phone": "9000000091",
                }
            },
            context=AgentContext(
                user_id="integration-test-user",
                permissions=("enterprise:crm:create_customer",),
            ),
        )

        response = await self.platform.execute(
            EnterpriseDomain.CRM,
            request,
        )

        self.assertEqual(response.status, AgentStatus.COMPLETED)
        self.assertIsNone(response.error)

        result = json.loads(response.output)
        customer = result["result"]

        self.assertEqual(customer["name"], "Integration Test Customer")
        self.assertEqual(customer["city"], "Hyderabad")
        self.assertEqual(customer["vehicle_interest"], "Range Rover Sport")
        self.assertTrue(customer["id"])

    async def test_unauthorized_customer_creation_does_not_succeed(self):
        request = AgentRequest(
            input="create_customer",
            task_id="crm-engine-denied-001",
            metadata={
                "payload": {
                    "name": "Unauthorized Test Customer",
                    "phone": "9000000092",
                }
            },
            context=AgentContext(
                user_id="integration-test-user",
                permissions=("enterprise:crm:read",),
            ),
        )

        response = await self.platform.execute(
            EnterpriseDomain.CRM,
            request,
        )

        self.assertEqual(response.status, AgentStatus.FAILED)
        self.assertIn("EnterprisePermissionError", response.error or "")


if __name__ == "__main__":
    unittest.main()
