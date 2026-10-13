import asyncio
import json
import unittest

from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.models import EnterpriseTask
from ai.agents.enterprise.registry import EnterpriseAgentRegistry
from ai.agents.enterprise.router import EnterpriseRouter
from ai.agents.enterprise.crm import CRMAgent


class CRMRouterIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.registry = EnterpriseAgentRegistry()
        self.agent = CRMAgent()
        self.registry.register(self.agent)
        self.router = EnterpriseRouter(self.registry)

    def route(self, action, payload):
        task = EnterpriseTask(
            task_id="crm-integration-test",
            domain=EnterpriseDomain.CRM,
            action=action,
            payload=payload,
        )
        return json.loads(asyncio.run(self.router.route(task)))

    def test_router_creates_customer(self):
        result = self.route("create_customer", {
            "name": "Rahul Sharma",
            "city": "Hyderabad",
            "vehicle_interest": "Range Rover Sport",
            "budget": 15000000,
            "timeline_days": 30,
        })
        self.assertEqual(result["domain"], "crm")
        self.assertEqual(result["action"], "create_customer")
        self.assertEqual(result["result"]["name"], "Rahul Sharma")

    def test_router_preserves_workflow_across_actions(self):
        customer = self.route("create_customer", {
            "workflow_id": "router-flow",
            "name": "Rahul Sharma",
            "city": "Hyderabad",
            "vehicle_interest": "Range Rover Sport",
            "budget": 15000000,
        })["result"]

        lead = self.route("create_lead", {
            "workflow_id": "router-flow",
            "customer_id": customer["id"],
        })["result"]

        qualified = self.route("qualify_lead", {
            "workflow_id": "router-flow",
            "lead_id": lead["id"],
        })["result"]

        self.assertTrue(qualified["qualified"])

        opportunity = self.route("create_opportunity", {
            "workflow_id": "router-flow",
            "lead_id": lead["id"],
        })["result"]

        self.assertEqual(opportunity["vehicle"], "Range Rover Sport")

    def test_crm_is_registered_under_correct_domain(self):
        self.assertIs(
            self.registry.get(EnterpriseDomain.CRM),
            self.agent,
        )


if __name__ == "__main__":
    unittest.main()
