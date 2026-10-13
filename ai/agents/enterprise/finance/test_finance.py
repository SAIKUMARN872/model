import asyncio
import json
import unittest

from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.models import EnterpriseTask
from ai.agents.enterprise.registry import EnterpriseAgentRegistry
from ai.agents.enterprise.router import EnterpriseRouter
from ai.agents.enterprise.finance import FinanceAgent, FinanceTools, FinanceWorkflow


class FinanceTests(unittest.TestCase):
    def setUp(self):
        self.tools = FinanceTools()
        self.workflow = FinanceWorkflow(self.tools)

    def test_budget_and_expense_commitment(self):
        budget = self.workflow.execute("create_budget", {
            "name": "Travel", "department": "Sales", "amount": 1000,
        })["result"]
        expense = self.workflow.execute("submit_expense", {
            "employee_id": "emp-1", "description": "Taxi", "amount": 200,
            "budget_id": budget["budget_id"],
        })["result"]
        updated = self.workflow.execute("get_budget", {
            "budget_id": budget["budget_id"],
        })["result"]
        self.assertEqual(updated["remaining"], 800)
        self.assertEqual(expense["status"], "pending_approval")

    def test_budget_overrun_rejected(self):
        budget = self.workflow.execute("create_budget", {
            "name": "Travel", "department": "Sales", "amount": 100,
        })["result"]
        with self.assertRaisesRegex(ValueError, "exceeds remaining budget"):
            self.workflow.execute("submit_expense", {
                "employee_id": "emp-1", "description": "Taxi", "amount": 101,
                "budget_id": budget["budget_id"],
            })

    def test_rejected_expense_releases_budget(self):
        budget = self.workflow.execute("create_budget", {
            "name": "Travel", "department": "Sales", "amount": 100,
        })["result"]
        expense = self.workflow.execute("submit_expense", {
            "employee_id": "emp-1", "description": "Taxi", "amount": 40,
            "budget_id": budget["budget_id"],
        })["result"]
        self.workflow.execute("decide_expense", {
            "expense_id": expense["expense_id"], "decision": "reject",
        })
        result = self.workflow.execute("get_budget", {
            "budget_id": budget["budget_id"],
        })["result"]
        self.assertEqual(result["remaining"], 100)

    def test_invoice_approval_and_partial_payment(self):
        invoice = self.workflow.execute("create_invoice", {
            "supplier": "Supplier A", "invoice_number": "INV-001",
            "amount": 500,
        })["result"]
        self.workflow.execute("decide_invoice", {
            "invoice_id": invoice["invoice_id"], "decision": "approve",
        })
        payment = self.workflow.execute("record_payment", {
            "invoice_id": invoice["invoice_id"], "amount": 200,
            "reference": "PAY-REF-1",
        })["result"]
        self.assertTrue(payment["recorded_only"])
        updated = self.workflow.execute("get_invoice", {
            "invoice_id": invoice["invoice_id"],
        })["result"]
        self.assertEqual(updated["status"], "partially_paid")
        self.assertEqual(updated["paid_amount"], 200)

    def test_invoice_duplicate_number_rejected(self):
        payload = {
            "supplier": "Supplier A", "invoice_number": "INV-002",
            "amount": 50,
        }
        self.workflow.execute("create_invoice", payload)
        with self.assertRaisesRegex(ValueError, "already exists"):
            self.workflow.execute("create_invoice", payload)

    def test_payment_cannot_exceed_outstanding(self):
        invoice = self.workflow.execute("create_invoice", {
            "supplier": "Supplier A", "invoice_number": "INV-003",
            "amount": 100,
        })["result"]
        self.workflow.execute("decide_invoice", {
            "invoice_id": invoice["invoice_id"], "decision": "approve",
        })
        with self.assertRaisesRegex(ValueError, "exceeds outstanding"):
            self.workflow.execute("record_payment", {
                "invoice_id": invoice["invoice_id"], "amount": 101,
                "reference": "PAY-REF-2",
            })

    def test_unapproved_invoice_payment_rejected(self):
        invoice = self.workflow.execute("create_invoice", {
            "supplier": "Supplier A", "invoice_number": "INV-004",
            "amount": 100,
        })["result"]
        with self.assertRaisesRegex(ValueError, "Only approved"):
            self.workflow.execute("record_payment", {
                "invoice_id": invoice["invoice_id"], "amount": 10,
                "reference": "PAY-REF-3",
            })

    def test_registry_router_integration(self):
        registry = EnterpriseAgentRegistry()
        registry.register(FinanceAgent())
        router = EnterpriseRouter(registry)
        task = EnterpriseTask(
            task_id="finance-integration",
            domain=EnterpriseDomain.FINANCE,
            action="create_budget",
            payload={
                "name": "Test Budget",
                "department": "Engineering",
                "amount": 500,
            },
        )
        result = json.loads(asyncio.run(router.route(task)))
        self.assertEqual(result["domain"], "finance")
        self.assertEqual(result["result"]["limit"], 500)


if __name__ == "__main__":
    unittest.main()
