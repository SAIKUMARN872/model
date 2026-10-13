import asyncio
import json
import unittest

from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.models import EnterpriseTask
from ai.agents.enterprise.registry import EnterpriseAgentRegistry
from ai.agents.enterprise.router import EnterpriseRouter
from ai.agents.enterprise.sales import SalesAgent, SalesTools, SalesWorkflow


class SalesTests(unittest.TestCase):
    def setUp(self):
        self.tools = SalesTools()
        self.workflow = SalesWorkflow(self.tools)
        self.product = self.workflow.execute("add_product", {
            "sku": "PROD-001",
            "name": "Enterprise License",
            "unit_price": 1000,
            "unit_cost": 600,
        })["result"]

    def create_quote(self, discount=10):
        return self.workflow.execute("create_quote", {
            "product_id": self.product["product_id"],
            "customer_id": "customer-1",
            "quantity": 2,
            "discount_percent": discount,
        })["result"]

    def test_product_creation(self):
        self.assertEqual(self.product["unit_price"], 1000)

    def test_duplicate_sku_rejected(self):
        with self.assertRaisesRegex(ValueError, "SKU already exists"):
            self.workflow.execute("add_product", {
                "sku": "PROD-001", "name": "Duplicate",
                "unit_price": 100, "unit_cost": 50,
            })

    def test_quote_totals_and_margin(self):
        quote = self.create_quote()
        self.assertEqual(quote["gross_amount"], 2000)
        self.assertEqual(quote["discount_amount"], 200)
        self.assertEqual(quote["total"], 1800)
        self.assertEqual(quote["estimated_margin_percent"], 33.33)

    def test_discount_cap(self):
        with self.assertRaisesRegex(ValueError, "discount exceeds maximum"):
            self.create_quote(30)

    def test_margin_floor(self):
        low_margin_product = self.workflow.execute("add_product", {
            "sku": "LOW-MARGIN-001",
            "name": "Low Margin Product",
            "unit_price": 100,
            "unit_cost": 99,
        })["result"]
        with self.assertRaisesRegex(ValueError, "below minimum"):
            self.workflow.execute("create_quote", {
                "product_id": low_margin_product["product_id"],
                "customer_id": "customer-1",
                "quantity": 1,
                "discount_percent": 0,
            })

    def test_order_requires_approved_quote(self):
        quote = self.create_quote()
        with self.assertRaisesRegex(ValueError, "must be approved"):
            self.workflow.execute("create_order", {
                "quote_id": quote["quote_id"],
            })

    def test_order_created_after_approval(self):
        quote = self.create_quote()
        self.workflow.execute("decide_quote", {
            "quote_id": quote["quote_id"], "decision": "approve",
        })
        order = self.workflow.execute("create_order", {
            "quote_id": quote["quote_id"],
        })["result"]
        self.assertEqual(order["total"], 1800)
        self.assertFalse(order["external_system_updated"])

    def test_quote_cannot_be_ordered_twice(self):
        quote = self.create_quote()
        self.workflow.execute("decide_quote", {
            "quote_id": quote["quote_id"], "decision": "approve",
        })
        self.workflow.execute("create_order", {"quote_id": quote["quote_id"]})
        with self.assertRaisesRegex(ValueError, "already exists"):
            self.workflow.execute("create_order", {"quote_id": quote["quote_id"]})

    def test_pipeline_summary(self):
        self.create_quote()
        summary = self.workflow.execute("pipeline_summary", {})["result"]
        self.assertEqual(summary["quote_count"], 1)
        self.assertEqual(summary["quote_count_by_status"]["pending_approval"], 1)

    def test_registry_router_integration(self):
        registry = EnterpriseAgentRegistry()
        registry.register(SalesAgent())
        router = EnterpriseRouter(registry)
        task = EnterpriseTask(
            task_id="sales-integration",
            domain=EnterpriseDomain.SALES,
            action="add_product",
            payload={
                "sku": "ROUTE-1", "name": "Router Product",
                "unit_price": 100, "unit_cost": 50,
            },
        )
        result = json.loads(asyncio.run(router.route(task)))
        self.assertEqual(result["domain"], "sales")
        self.assertEqual(result["result"]["sku"], "ROUTE-1")


if __name__ == "__main__":
    unittest.main()


