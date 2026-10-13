"""Unit tests for ModelNow payment safeguards."""

import unittest
from decimal import Decimal

from .authorization import PaymentAuthorizationManager
from .payment import PaymentRequest, PaymentResult, PaymentStatus
from .processor import PaymentProcessor
from .verification import verify_payment_result


class PaymentTests(unittest.TestCase):
    def setUp(self):
        self.manager = PaymentAuthorizationManager()
        self.request = PaymentRequest(
            amount=Decimal("125.50"),
            currency="INR",
            order_id="order-001",
            payment_id="payment-001",
            provider="fake",
            requires_approval=True,
        )
        self.processor = PaymentProcessor(self.manager)

    def approve(self, request=None):
        request = request or self.request
        return self.manager.authorize(
            request,
            approved=True,
            approver_id="test-approver",
        )

    def test_request_rejects_nonpositive_amount(self):
        with self.assertRaises(ValueError):
            PaymentRequest(
                amount=Decimal("0"),
                currency="INR",
                order_id="order-002",
                payment_id="payment-002",
            )

    def test_request_rejects_invalid_currency(self):
        with self.assertRaises(ValueError):
            PaymentRequest(
                amount=Decimal("10"),
                currency="IN",
                order_id="order-003",
                payment_id="payment-003",
            )

    def test_approval_requires_approver_id(self):
        with self.assertRaises(ValueError):
            self.manager.authorize(self.request, approved=True)

    def test_approved_request_is_authorized(self):
        self.approve()
        self.assertTrue(self.manager.is_authorized(self.request))

    def test_unapproved_payment_does_not_call_provider(self):
        called = []
        self.processor.register_provider("fake", lambda request: called.append(request))
        result = self.processor.process(self.request)
        self.assertEqual(result.status, PaymentStatus.AWAITING_APPROVAL)
        self.assertEqual(called, [])

    def test_payment_with_no_provider_handler_fails_closed(self):
        self.approve()
        result = self.processor.process(self.request)
        self.assertEqual(result.status, PaymentStatus.FAILED)

    def test_successful_fake_provider_result(self):
        self.approve()
        self.processor.register_provider(
            "fake",
            lambda request: {
                "status": "succeeded",
                "provider_reference": "fake-ref-001",
            },
        )
        result = self.processor.process(self.request)
        self.assertEqual(result.status, PaymentStatus.SUCCEEDED)
        self.assertEqual(result.provider_reference, "fake-ref-001")

    def test_success_without_provider_reference_is_unknown(self):
        self.approve()
        self.processor.register_provider(
            "fake",
            lambda request: {"status": "succeeded"},
        )
        result = self.processor.process(self.request)
        self.assertEqual(result.status, PaymentStatus.UNKNOWN)

    def test_provider_exception_is_not_reported_as_success(self):
        self.approve()

        def failing_provider(request):
            raise RuntimeError("simulated provider error")

        self.processor.register_provider("fake", failing_provider)
        result = self.processor.process(self.request)
        self.assertEqual(result.status, PaymentStatus.UNKNOWN)
        self.assertIsNotNone(result.error)

    def test_duplicate_payment_id_does_not_call_provider_twice(self):
        self.approve()
        calls = []

        def fake_provider(request):
            calls.append(request.payment_id)
            return {
                "status": "succeeded",
                "provider_reference": "fake-ref-002",
            }

        self.processor.register_provider("fake", fake_provider)
        first = self.processor.process(self.request)
        second = self.processor.process(self.request)

        self.assertEqual(first, second)
        self.assertEqual(len(calls), 1)

    def test_verification_accepts_matching_success_result(self):
        result = PaymentResult(
            payment_id=self.request.payment_id,
            order_id=self.request.order_id,
            status=PaymentStatus.SUCCEEDED,
            amount=self.request.amount,
            currency="INR",
            provider_reference="fake-ref-003",
        )
        verification = verify_payment_result(self.request, result)
        self.assertTrue(verification.verified)
        self.assertEqual(verification.issues, ())

    def test_verification_rejects_amount_mismatch(self):
        result = PaymentResult(
            payment_id=self.request.payment_id,
            order_id=self.request.order_id,
            status=PaymentStatus.SUCCEEDED,
            amount=Decimal("1.00"),
            currency="INR",
            provider_reference="fake-ref-004",
        )
        verification = verify_payment_result(self.request, result)
        self.assertFalse(verification.verified)
        self.assertTrue(
            any("amount" in issue.lower() for issue in verification.issues)
        )

    def test_revoked_approval_blocks_payment(self):
        self.approve()
        self.assertTrue(self.manager.revoke(self.request.payment_id))
        self.assertFalse(self.manager.is_authorized(self.request))

        called = []
        self.processor.register_provider("fake", lambda request: called.append(request))
        result = self.processor.process(self.request)

        self.assertEqual(result.status, PaymentStatus.AWAITING_APPROVAL)
        self.assertEqual(called, [])


if __name__ == "__main__":
    unittest.main()
