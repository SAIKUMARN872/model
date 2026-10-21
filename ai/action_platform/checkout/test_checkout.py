"""Unit tests for ModelNow checkout actions."""

import asyncio
import unittest

from ai.action_platform.checkout import (
    CheckoutConfirmationVerifier,
    CheckoutCoordinator,
    CheckoutVerifier,
    PaymentGateway,
    PaymentRequest,
)


class CheckoutCoordinatorTests(unittest.TestCase):
    def setUp(self):
        self.coordinator = CheckoutCoordinator()

    def test_prepares_checkout_awaiting_approval(self):
        result = self.coordinator.prepare_result({
            "task_id": "checkout-1",
            "goal": "Review cart",
            "payload": {
                "amount": "1499",
                "currency": "inr",
                "items": [{"product_id": "item-1", "quantity": 2}],
            },
        })

        self.assertEqual(result.status, "awaiting_approval")
        self.assertEqual(result.plan["amount"], "1499.00")
        self.assertTrue(result.plan["requires_approval"])

    def test_rejects_zero_amount(self):
        with self.assertRaises(ValueError):
            self.coordinator.prepare({
                "task_id": "checkout-2",
                "goal": "Purchase item",
                "payload": {"amount": "0"},
            })

    def test_rejects_invalid_quantity(self):
        with self.assertRaises(ValueError):
            self.coordinator.prepare({
                "task_id": "checkout-3",
                "goal": "Purchase item",
                "payload": {"items": [{"product_id": "item-1", "quantity": 0}],
                            },
            })

    def test_rejects_unsupported_currency(self):
        with self.assertRaises(ValueError):
            self.coordinator.prepare({
                "task_id": "checkout-4",
                "goal": "Purchase item",
                "payload": {"currency": "XYZ"},
            })


class PaymentTests(unittest.TestCase):
    def test_payment_request_normalizes_fields(self):
        request = PaymentRequest(
            task_id="payment-1",
            amount="1499",
            currency="inr",
            idempotency_key="key-1",
        )

        self.assertEqual(request.amount, "1499.00")
        self.assertEqual(request.currency, "INR")

    def test_gateway_without_provider_does_not_charge(self):
        request = PaymentRequest(
            task_id="payment-2",
            amount="100.00",
        )
        result = asyncio.run(PaymentGateway().pay(request))

        self.assertEqual(result.status, "not_configured")
        self.assertFalse(result.succeeded)


class CheckoutConfirmationTests(unittest.TestCase):
    def setUp(self):
        self.verifier = CheckoutConfirmationVerifier()

    def test_valid_order_confirmation(self):
        result = self.verifier.verify({
            "status": "placed",
            "provider_order_id": "ORDER-1",
        })

        self.assertTrue(result.confirmed)

    def test_missing_order_id_is_unverified(self):
        result = self.verifier.verify({"status": "confirmed"})

        self.assertFalse(result.confirmed)
        self.assertEqual(result.status, "unverified")

    def test_pending_order_is_not_confirmed(self):
        result = self.verifier.verify({"status": "pending"})

        self.assertFalse(result.confirmed)
        self.assertEqual(result.status, "pending")


class CheckoutVerificationTests(unittest.TestCase):
    def setUp(self):
        self.verifier = CheckoutVerifier()

    def test_matching_order_and_payment_are_verified(self):
        result = self.verifier.verify(
            "task-1",
            {
                "task_id": "task-1",
                "status": "confirmed",
                "provider_order_id": "ORDER-1",
            },
            {
                "task_id": "task-1",
                "status": "succeeded",
                "transaction_id": "TX-1",
            },
        )

        self.assertTrue(result.verified)

    def test_mismatched_task_is_rejected(self):
        result = self.verifier.verify(
            "task-1",
            {
                "task_id": "task-2",
                "status": "confirmed",
                "provider_order_id": "ORDER-1",
            },
            {
                "task_id": "task-1",
                "status": "succeeded",
                "transaction_id": "TX-1",
            },
        )

        self.assertFalse(result.verified)
        self.assertIn(
            "Order confirmation task ID does not match.",
            result.issues,
        )


if __name__ == "__main__":
    unittest.main()
