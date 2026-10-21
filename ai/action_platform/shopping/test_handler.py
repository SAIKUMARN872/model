import unittest

from decimal import Decimal

from ai.action_platform.core.action import ActionDomain, ActionStatus
from ai.action_platform.core.context import ActionContext
from ai.action_platform.core.models import ActionRequest
from ai.action_platform.shopping.cart import ShoppingCart
from ai.action_platform.shopping.handler import ShoppingActionHandler
from ai.action_platform.shopping.product import Product
from ai.action_platform.shopping.shopping import ShoppingManager


class ShoppingActionHandlerTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        product = Product(
            product_id="laptop-1",
            name="Test Laptop",
            price=Decimal("49999.00"),
            currency="INR",
            retailer="test-retailer",
        )
        self.manager = ShoppingManager(ShoppingCart("handler-test-cart"))
        self.handler = ShoppingActionHandler(
            self.manager,
            catalog={"laptop-1": product},
        )
        self.context = ActionContext(
            user_id="test-user",
            permissions={"action:shopping"},
        )

    async def run_action(self, operation, payload=None, task_id="test-task"):
        request = ActionRequest(
            domain=ActionDomain.SHOPPING,
            goal=f"Test {operation}",
            payload={"operation": operation, **(payload or {})},
            task_id=task_id,
        )
        return await self.handler.execute(request, self.context)

    async def test_add_product_uses_trusted_catalog(self):
        result = await self.run_action(
            "add_product",
            {"product_id": "laptop-1", "quantity": 2},
        )
        self.assertEqual(result.status, ActionStatus.COMPLETED)
        self.assertEqual(result.data["cart"]["item_count"], 2)

    async def test_unknown_product_is_not_added(self):
        result = await self.run_action(
            "add_product",
            {"product_id": "untrusted-product"},
        )
        self.assertEqual(result.status, ActionStatus.FAILED)
        self.assertEqual(result.data["cart"] if "cart" in result.data else None, None)

    async def test_view_cart(self):
        result = await self.run_action("view_cart")
        self.assertEqual(result.status, ActionStatus.COMPLETED)
        self.assertEqual(result.data["cart"]["item_count"], 0)

    async def test_prepare_checkout_waits_for_approval(self):
        await self.run_action(
            "add_product",
            {"product_id": "laptop-1"},
        )
        result = await self.run_action("prepare_checkout")
        self.assertEqual(result.status, ActionStatus.AWAITING_APPROVAL)
        self.assertIn("checkout", result.data)
        self.assertIn("No order has been submitted", result.data["message"])

    async def test_unsupported_operation_fails(self):
        result = await self.run_action("unknown_operation")
        self.assertEqual(result.status, ActionStatus.FAILED)


if __name__ == "__main__":
    unittest.main()
