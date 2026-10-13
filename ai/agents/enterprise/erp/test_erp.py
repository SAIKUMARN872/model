import asyncio
import json
import unittest

from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.models import EnterpriseTask
from ai.agents.enterprise.registry import EnterpriseAgentRegistry
from ai.agents.enterprise.router import EnterpriseRouter
from ai.agents.enterprise.erp import ERPAgent, ERPTools, ERPWorkflow


class ERPTests(unittest.TestCase):
    def setUp(self):
        self.tools = ERPTools()
        self.workflow = ERPWorkflow(self.tools)
        self.item = self.workflow.execute("create_item", {
            "sku": "SKU-001",
            "name": "Laptop",
            "quantity": 5,
            "reorder_level": 2,
        })["result"]
        self.supplier = self.workflow.execute("add_supplier", {
            "name": "Example Supplier",
        })["result"]

    def test_create_item(self):
        self.assertEqual(self.item["quantity"], 5)

    def test_duplicate_sku_rejected(self):
        with self.assertRaisesRegex(ValueError, "SKU already exists"):
            self.workflow.execute("create_item", {
                "sku": "SKU-001",
                "name": "Duplicate",
            })

    def test_requisition_requires_approval_before_order(self):
        req = self.workflow.execute("create_requisition", {
            "item_id": self.item["item_id"],
            "quantity": 3,
        })["result"]
        with self.assertRaisesRegex(ValueError, "must be approved"):
            self.workflow.execute("create_purchase_order", {
                "requisition_id": req["requisition_id"],
                "supplier_id": self.supplier["supplier_id"],
                "unit_price": 100,
            })

    def test_purchase_and_goods_receipt(self):
        req = self.workflow.execute("create_requisition", {
            "item_id": self.item["item_id"],
            "quantity": 3,
        })["result"]
        self.workflow.execute("approve_requisition", {
            "requisition_id": req["requisition_id"],
            "decision": "approve",
        })
        po = self.workflow.execute("create_purchase_order", {
            "requisition_id": req["requisition_id"],
            "supplier_id": self.supplier["supplier_id"],
            "unit_price": 100,
        })["result"]
        self.workflow.execute("approve_purchase_order", {
            "purchase_order_id": po["purchase_order_id"],
            "decision": "approve",
        })
        result = self.workflow.execute("receive_goods", {
            "purchase_order_id": po["purchase_order_id"],
            "quantity": 3,
        })["result"]
        self.assertEqual(result["status"], "completed")
        self.assertEqual(
            self.tools.items[self.item["item_id"]]["quantity"], 8
        )

    def test_receipt_cannot_exceed_order(self):
        req = self.workflow.execute("create_requisition", {
            "item_id": self.item["item_id"], "quantity": 2,
        })["result"]
        self.workflow.execute("approve_requisition", {
            "requisition_id": req["requisition_id"], "decision": "approve",
        })
        po = self.workflow.execute("create_purchase_order", {
            "requisition_id": req["requisition_id"],
            "supplier_id": self.supplier["supplier_id"], "unit_price": 10,
        })["result"]
        self.workflow.execute("approve_purchase_order", {
            "purchase_order_id": po["purchase_order_id"], "decision": "approve",
        })
        with self.assertRaisesRegex(ValueError, "exceeds outstanding"):
            self.workflow.execute("receive_goods", {
                "purchase_order_id": po["purchase_order_id"], "quantity": 3,
            })

    def test_stock_cannot_become_negative(self):
        with self.assertRaisesRegex(ValueError, "Insufficient stock"):
            self.workflow.execute("move_stock", {
                "item_id": self.item["item_id"],
                "quantity": 100,
                "direction": "out",
            })

    def test_registry_router_integration(self):
        registry = EnterpriseAgentRegistry()
        registry.register(ERPAgent())
        router = EnterpriseRouter(registry)
        task = EnterpriseTask(
            task_id="erp-integration",
            domain=EnterpriseDomain.ERP,
            action="create_item",
            payload={"sku": "ROUTE-1", "name": "Router Test Item"},
        )
        result = json.loads(asyncio.run(router.route(task)))
        self.assertEqual(result["domain"], "erp")
        self.assertEqual(result["result"]["sku"], "ROUTE-1")


if __name__ == "__main__":
    unittest.main()
