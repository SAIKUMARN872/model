"""Tests for ModelNow shopping and checkout operations."""

import unittest
from decimal import Decimal

from ai.action_platform.shopping import (
    CheckoutManager,
    Product,
    ShoppingCart,
    ShoppingManager,
)


def make_product(
    product_id="p1",
    price="100.00",
    currency="INR",
    retailer="store-a",
    available=True,
):
    return Product(
        product_id=product_id,
        name=f"Product {product_id}",
        price=price,
        currency=currency,
        retailer=retailer,
        available=available,
    )


class ShoppingTests(unittest.TestCase):
    def setUp(self):
        self.cart = ShoppingCart("cart-1")
        self.checkout_manager = CheckoutManager()
        self.manager = ShoppingManager(self.cart, self.checkout_manager)

    def test_product_price_is_decimal(self):
        self.assertEqual(make_product(price="12.50").price, Decimal("12.50"))

    def test_negative_product_price_rejected(self):
        with self.assertRaises(ValueError):
            make_product(price="-1")

    def test_invalid_quantity_rejected(self):
        with self.assertRaises(ValueError):
            self.cart.add(make_product(), 0)

    def test_cart_quantity_and_subtotal(self):
        self.cart.add(make_product(price="12.50"), 2)
        snapshot = self.cart.add(
            make_product(product_id="p2", price="5.00"), 3
        )
        self.assertEqual(snapshot.subtotal, Decimal("40.00"))
        self.assertEqual(sum(item.quantity for item in snapshot.items), 5)

    def test_unavailable_product_rejected(self):
        with self.assertRaises(ValueError):
            self.cart.add(make_product(available=False))
        self.assertEqual(self.cart.snapshot().items, ())

    def test_mixed_currency_rejected_without_mutating_cart(self):
        self.cart.add(make_product(currency="INR"))
        before = self.cart.snapshot()

        with self.assertRaises(ValueError):
            self.cart.add(make_product(product_id="usd-item", currency="USD"))

        after = self.cart.snapshot()
        self.assertEqual(after.items, before.items)
        self.assertEqual(after.subtotal, before.subtotal)

    def test_product_details_change_rejected(self):
        self.cart.add(make_product(price="100"))
        with self.assertRaises(ValueError):
            self.cart.add(make_product(price="200"))
        self.assertEqual(self.cart.snapshot().subtotal, Decimal("100"))

    def test_empty_cart_checkout_rejected(self):
        with self.assertRaises(ValueError):
            self.checkout_manager.prepare(self.cart)

    def test_checkout_total_includes_shipping(self):
        self.cart.add(make_product(price="100"))
        checkout = self.checkout_manager.prepare(
            self.cart, shipping_cost=Decimal("20")
        )
        self.assertEqual(checkout.subtotal, Decimal("100"))
        self.assertEqual(checkout.shipping_cost, Decimal("20"))
        self.assertEqual(checkout.total, Decimal("120"))

    def test_submission_requires_approval(self):
        self.cart.add(make_product())
        checkout = self.checkout_manager.prepare(self.cart)
        calls = []
        self.checkout_manager.register_handler(
            "store-a",
            lambda payload: calls.append(payload)
            or {"status": "submitted", "provider_reference": "order-1"},
        )

        result = self.checkout_manager.submit(
            checkout.checkout_id, retailer="store-a"
        )
        self.assertFalse(result.submitted)
        self.assertEqual(calls, [])

    def test_submission_requires_registered_handler(self):
        self.cart.add(make_product())
        checkout = self.checkout_manager.prepare(self.cart)
        self.checkout_manager.approve(
            checkout.checkout_id, approver_id="test-user"
        )

        result = self.checkout_manager.submit(
            checkout.checkout_id, retailer="unknown-store"
        )
        self.assertFalse(result.submitted)

    def test_approved_checkout_can_be_submitted(self):
        self.cart.add(make_product())
        checkout = self.checkout_manager.prepare(self.cart)
        self.checkout_manager.approve(
            checkout.checkout_id, approver_id="test-user"
        )
        self.checkout_manager.register_handler(
            "store-a",
            lambda payload: {
                "status": "submitted",
                "provider_reference": "order-123",
            },
        )

        result = self.checkout_manager.submit(
            checkout.checkout_id, retailer="store-a"
        )
        self.assertTrue(result.submitted)
        self.assertEqual(result.provider_reference, "order-123")

    def test_duplicate_submission_does_not_call_handler_twice(self):
        self.cart.add(make_product())
        checkout = self.checkout_manager.prepare(self.cart)
        self.checkout_manager.approve(
            checkout.checkout_id, approver_id="test-user"
        )
        calls = []

        def handler(payload):
            calls.append(payload)
            return {
                "status": "submitted",
                "provider_reference": "order-456",
            }

        self.checkout_manager.register_handler("store-a", handler)
        first = self.checkout_manager.submit(
            checkout.checkout_id, retailer="store-a"
        )
        second = self.checkout_manager.submit(
            checkout.checkout_id, retailer="store-a"
        )

        self.assertTrue(first.submitted)
        self.assertEqual(len(calls), 1)
        self.assertFalse(second.submitted)

    def test_invalid_provider_response_is_not_success(self):
        self.cart.add(make_product())
        checkout = self.checkout_manager.prepare(self.cart)
        self.checkout_manager.approve(
            checkout.checkout_id, approver_id="test-user"
        )
        self.checkout_manager.register_handler(
            "store-a", lambda payload: {"status": "failed"}
        )

        result = self.checkout_manager.submit(
            checkout.checkout_id, retailer="store-a"
        )
        self.assertFalse(result.submitted)

    def test_provider_exception_is_not_success(self):
        self.cart.add(make_product())
        checkout = self.checkout_manager.prepare(self.cart)
        self.checkout_manager.approve(
            checkout.checkout_id, approver_id="test-user"
        )

        def failing_handler(payload):
            raise RuntimeError("Simulated provider failure")

        self.checkout_manager.register_handler("store-a", failing_handler)
        result = self.checkout_manager.submit(
            checkout.checkout_id, retailer="store-a"
        )
        self.assertFalse(result.submitted)

    def test_manager_add_and_view_cart(self):
        result = self.manager.add_product(make_product(), quantity=2)
        self.assertTrue(result.success)
        viewed = self.manager.view_cart()
        self.assertTrue(viewed.success)
        self.assertEqual(viewed.cart["subtotal"], "200.00")


if __name__ == "__main__":
    unittest.main()
