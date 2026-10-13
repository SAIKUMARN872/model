import json
import unittest

from ai.agents.enterprise.crm import CRMTools, CRMWorkflow


class CRMWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.tools = CRMTools()
        self.workflow = CRMWorkflow(self.tools)
        self.customer = self.workflow.execute("create_customer", {
            "workflow_id": "rahul",
            "name": "Rahul Sharma",
            "city": "Hyderabad",
            "vehicle_interest": "Range Rover Sport",
            "budget": 15000000,
            "timeline_days": 30,
            "phone": "9000000001",
        })["result"]

    def test_customer_created(self):
        self.assertEqual(self.customer["name"], "Rahul Sharma")
        self.assertEqual(self.customer["city"], "Hyderabad")

    def test_duplicate_phone_rejected(self):
        with self.assertRaises(ValueError):
            self.workflow.execute("create_customer", {
                "name": "Another Customer",
                "phone": "9000000001",
            })

    def test_lead_requires_existing_customer(self):
        with self.assertRaises(ValueError):
            self.workflow.execute("create_lead", {"customer_id": "missing"})

    def test_lead_qualification_and_opportunity(self):
        lead = self.workflow.execute("create_lead", {
            "workflow_id": "rahul",
            "customer_id": self.customer["id"],
        })["result"]
        qualified = self.workflow.execute("qualify_lead", {
            "workflow_id": "rahul",
            "lead_id": lead["id"],
        })["result"]
        self.assertTrue(qualified["qualified"])
        opportunity = self.workflow.execute("create_opportunity", {
            "workflow_id": "rahul",
            "lead_id": lead["id"],
        })["result"]
        self.assertEqual(opportunity["vehicle"], "Range Rover Sport")

    def test_unqualified_lead_cannot_create_opportunity(self):
        lead = self.workflow.execute("create_lead", {
            "customer_id": self.customer["id"],
        })["result"]
        with self.assertRaises(ValueError):
            self.workflow.execute("create_opportunity", {"lead_id": lead["id"]})

    def test_booking_blocked_until_approval(self):
        lead = self.workflow.execute("create_lead", {
            "customer_id": self.customer["id"],
        })["result"]
        self.workflow.execute("qualify_lead", {"lead_id": lead["id"]})
        opportunity = self.workflow.execute("create_opportunity", {
            "lead_id": lead["id"],
        })["result"]
        with self.assertRaisesRegex(ValueError, "approval is not approved"):
            self.workflow.execute("booking", {
                "opportunity_id": opportunity["id"],
            })

    def test_booking_is_handoff_after_approval(self):
        lead = self.workflow.execute("create_lead", {
            "customer_id": self.customer["id"],
        })["result"]
        self.workflow.execute("qualify_lead", {"lead_id": lead["id"]})
        opportunity = self.workflow.execute("create_opportunity", {
            "lead_id": lead["id"],
        })["result"]
        self.workflow.execute("record_approval_decision", {
            "opportunity_id": opportunity["id"],
            "decision": "approved",
        })
        result = self.workflow.execute("booking", {
            "opportunity_id": opportunity["id"],
        })["result"]
        self.assertEqual(result["status"], "pending_integration")
        self.assertIn("No real booking", result["note"])

    def test_unknown_action_rejected(self):
        with self.assertRaises(ValueError):
            self.workflow.execute("delete_everything", {})


if __name__ == "__main__":
    unittest.main()
