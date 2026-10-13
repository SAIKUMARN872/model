"""Automated tests for ModelNow commerce actions."""

import unittest
from decimal import Decimal

from ai.action_platform.commerce import (
    CartManager,
    CommerceCoordinator,
    CommerceVerifier,
    OrderManager,
)


class CommerceCoordinatorTests(unittest.TestCase):
    def setUp(self):
        self.coordinator = CommerceCoordinator()

    def test_checkout_requires_approval(self):
        result = self.coordinator.prepare_result({
            "task_id": "commerce-1",
            "goal": "Review cart",
            "operation": "checkout",
            "payload": {
                "items": [{"product_id": "item-1", "quantity": 2}],
                "amount": "1499",
                "currency": "inr",
            },
        })
        self.assertEqual(result.status, "awaiting_approval")
        self.assertEqual(result.plan["amount"], "1499.00")
        self.assertTrue(result.plan["requires_approval"])

    def test_rejects_invalid_operation(self):
        with self.assertRaises(ValueError):
            self.coordinator.prepare({
                "task_id": "commerce-2",
                "goal": "Do something",
                "operation": "unknown_operation",
            })

    def test_rejects_invalid_quantity(self):
        result = self.coordinator.prepare_result({
            "task_id": "commerce-3",
            "goal": "Review cart",
            "payload": {
                "items": [{"product_id": "item-1", "quantity": 0}],
            },
        })
        self.assertEqual(result.status, "failed")


class CartManagerTests(unittest.TestCase):
    def setUp(self):
        self.manager = CartManager()

    def test_calculates_cart_total(self):
        summary = self.manager.summarize([
            {"product_id": "item-1", "quantity": 2, "unit_price": "100"},
            {"product_id": "item-2", "quantity": 1, "unit_price": "49.50"},
        ], "inr")
        self.assertEqual(summary.subtotal, Decimal("249.50"))
        self.assertEqual(summary.item_count, 3)
        self.assertEqual(summary.currency, "INR")

    def test_rejects_negative_price(self):
        with self.assertRaises(ValueError):
            self.manager.summarize([
                {"product_id": "item-1", "quantity": 1, "unit_price": "-1"}
            ])

    def test_rejects_boolean_quantity(self):
        with self.assertRaises(ValueError):
            self.manager.summarize([
                {"product_id": "item-1", "quantity": True, "unit_price": "10"}
            ])


class OrderManagerTests(unittest.TestCase):
    def setUp(self):
        self.manager = OrderManager()

    def test_order_starts_awaiting_approval(self):
        order = self.manager.prepare({
            "task_id": "order-1",
            "items": [{"product_id": "item-1", "quantity": 1}],
            "currency": "INR",
            "requires_approval": True,
        })
        self.assertEqual(order.status, "awaiting_approval")
        self.assertIsNone(order.order_id)

    def test_confirmation_requires_provider_id(self):
        order = self.manager.prepare({
            "task_id": "order-2",
            "items": [],
            "requires_approval": True,
        })
        with self.assertRaises(ValueError):
            self.manager.record_provider_status(order, "confirmed")

    def test_terminal_order_cannot_be_changed(self):
        order = self.manager.prepare({
            "task_id": "order-3",
            "items": [],
            "requires_approval": True,
        })
        self.manager.record_provider_status(order, "confirmed", "ORDER-3")
        with self.assertRaises(ValueError):
            self.manager.record_provider_status(order, "pending")


class CommerceVerifierTests(unittest.TestCase):
    def setUp(self):
        self.verifier = CommerceVerifier()

    def test_valid_confirmation(self):
        result = self.verifier.verify("task-1", {
            "task_id": "task-1",
            "status": "confirmed",
            "provider_order_id": "ORDER-1",
        })
        self.assertTrue(result.verified)

    def test_pending_confirmation_is_not_verified(self):
        result = self.verifier.verify("task-1", {"status": "pending"})
        self.assertFalse(result.verified)
        self.assertEqual(result.status, "pending")

    def test_task_id_mismatch_is_rejected(self):
        result = self.verifier.verify("task-1", {
            "task_id": "task-2",
            "status": "confirmed",
            "provider_order_id": "ORDER-2",
        })
        self.assertFalse(result.verified)
        self.assertIn(
            "Confirmation task ID does not match.",
            result.issues,
        )


if __name__ == "__main__":
    unittest.main()
