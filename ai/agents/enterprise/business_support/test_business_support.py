import asyncio
import json
import unittest

from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.models import EnterpriseTask
from ai.agents.enterprise.registry import EnterpriseAgentRegistry
from ai.agents.enterprise.router import EnterpriseRouter
from ai.agents.enterprise.business_support import (
    BusinessSupportAgent,
    BusinessSupportTools,
    BusinessSupportWorkflow,
)


class BusinessSupportTests(unittest.TestCase):
    def setUp(self):
        self.tools = BusinessSupportTools()
        self.workflow = BusinessSupportWorkflow(self.tools)
        self.ticket = self.workflow.execute("create_ticket", {
            "subject": "Cannot access account",
            "description": "Login fails after password reset",
            "category": "account_access",
            "priority": "high",
            "customer_id": "customer-1",
        })["result"]

    def test_ticket_creation(self):
        self.assertEqual(self.ticket["status"], "open")
        self.assertEqual(self.ticket["priority"], "high")

    def test_invalid_priority_rejected(self):
        with self.assertRaisesRegex(ValueError, "priority"):
            self.workflow.execute("create_ticket", {
                "subject": "Issue",
                "description": "Details",
                "category": "general",
                "priority": "urgent-ish",
            })

    def test_assignment(self):
        result = self.workflow.execute("assign_ticket", {
            "ticket_id": self.ticket["ticket_id"],
            "assignee": "support-agent-1",
        })["result"]
        self.assertEqual(result["status"], "assigned")

    def test_response_is_draft_not_sent(self):
        result = self.workflow.execute("draft_response", {
            "ticket_id": self.ticket["ticket_id"],
            "draft": "Please try resetting your password again.",
        })["result"]
        self.assertIn("not sent", result["history"][-1]["note"])

    def test_escalation(self):
        result = self.workflow.execute("escalate_ticket", {
            "ticket_id": self.ticket["ticket_id"],
            "reason": "Customer cannot access a critical service",
        })["result"]
        self.assertEqual(result["status"], "escalated")
        self.assertEqual(result["priority"], "high")

    def test_close_requires_resolution(self):
        with self.assertRaisesRegex(ValueError, "must be resolved"):
            self.workflow.execute("update_status", {
                "ticket_id": self.ticket["ticket_id"],
                "status": "closed",
            })

    def test_resolved_ticket_cannot_be_assigned(self):
        ticket_id = self.ticket["ticket_id"]
        self.workflow.execute("resolve_ticket", {
            "ticket_id": ticket_id,
            "resolution": "Access restored",
        })
        with self.assertRaisesRegex(ValueError, "Resolved or closed"):
            self.workflow.execute("assign_ticket", {
                "ticket_id": ticket_id,
                "assignee": "support-agent-2",
            })

    def test_unknown_ticket_rejected(self):
        with self.assertRaisesRegex(ValueError, "Ticket not found"):
            self.workflow.execute("get_ticket", {"ticket_id": "missing"})

    def test_registry_router_integration(self):
        registry = EnterpriseAgentRegistry()
        registry.register(BusinessSupportAgent())
        router = EnterpriseRouter(registry)
        task = EnterpriseTask(
            task_id="support-integration",
            domain=EnterpriseDomain.BUSINESS_SUPPORT,
            action="create_ticket",
            payload={
                "subject": "Test issue",
                "description": "Router integration test",
                "category": "general",
            },
        )
        response = json.loads(asyncio.run(router.route(task)))
        self.assertEqual(response["domain"], "business_support")
        self.assertEqual(response["result"]["status"], "open")


if __name__ == "__main__":
    unittest.main()
