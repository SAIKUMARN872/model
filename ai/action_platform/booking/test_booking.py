"""Unit tests for ModelNow booking actions."""

import unittest

from ai.action_platform.booking import (
    BookingCoordinator,
    BookingExecutor,
    BookingPlanner,
    BookingRequest,
    BookingVerifier,
)
from ai.action_platform.core.context import ActionContext


class BookingPlannerTests(unittest.TestCase):
    def test_creates_plan_requiring_approval(self):
        plan = BookingPlanner().plan({
            "task_id": "booking-1",
            "goal": "Book a hotel",
            "payload": {"city": "Hyderabad"},
        })

        self.assertEqual(plan.task_id, "booking-1")
        self.assertEqual(plan.details["city"], "Hyderabad")
        self.assertTrue(plan.requires_approval)
        self.assertIn("request_user_approval", plan.steps)

    def test_rejects_empty_goal(self):
        with self.assertRaises(ValueError):
            BookingPlanner().plan({
                "task_id": "booking-2",
                "goal": " ",
                "payload": {},
            })

    def test_ignores_untrusted_approval_flags_in_payload(self):
        plan = BookingPlanner().plan({
            "task_id": "booking-3",
            "goal": "Book a room",
            "payload": {"approved": True, "city": "Hyderabad"},
        })

        self.assertNotIn("approved", plan.details)
        self.assertTrue(plan.requires_approval)


class BookingCoordinatorTests(unittest.TestCase):
    def test_prepare_returns_awaiting_approval(self):
        result = BookingCoordinator().prepare(
            BookingRequest(
                task_id="booking-4",
                goal="Reserve a hotel",
                payload={"city": "Hyderabad"},
            )
        )

        self.assertEqual(result.status, "awaiting_approval")
        self.assertFalse(result.confirmed)

    def test_execute_without_approval_does_not_call_provider(self):
        class FakeProvider:
            def __init__(self):
                self.called = False

            async def create_booking(self, plan):
                self.called = True
                return {
                    "status": "confirmed",
                    "provider_confirmation_id": "CONF-1",
                }

        provider = FakeProvider()
        result = BookingCoordinator().execute(
            {"task_id": "booking-5", "goal": "Book a room"},
            provider=provider,
        )

        self.assertEqual(result.status, "awaiting_approval")
        self.assertFalse(provider.called)


class BookingExecutorTests(unittest.IsolatedAsyncioTestCase):
    async def test_requires_trusted_context(self):
        result = await BookingExecutor().execute({
            "task_id": "booking-6",
            "goal": "Book a hotel",
        })

        self.assertEqual(result.status, "denied")

    async def test_requires_booking_permission(self):
        context = ActionContext(user_id="user-1")
        result = await BookingExecutor().execute(
            {"task_id": "booking-7", "goal": "Book a hotel"},
            context,
        )

        self.assertEqual(result.status, "denied")
        self.assertIn("action:booking", result.error)

    async def test_requires_approval(self):
        context = ActionContext(
            user_id="user-1",
            permissions={"action:booking"},
        )
        result = await BookingExecutor().execute(
            {"task_id": "booking-8", "goal": "Book a hotel"},
            context,
        )

        self.assertEqual(result.status, "awaiting_approval")

    async def test_missing_provider_does_not_claim_success(self):
        context = ActionContext(
            user_id="user-1",
            permissions={"action:booking"},
            approved_actions={"booking-9"},
        )
        result = await BookingExecutor().execute(
            {"task_id": "booking-9", "goal": "Book a hotel"},
            context,
        )

        self.assertEqual(result.status, "not_executed")
        self.assertFalse(result.confirmed)

    async def test_provider_confirmation_is_required(self):
        class FakeProvider:
            async def create_booking(self, plan):
                return {"status": "confirmed"}

        context = ActionContext(
            user_id="user-1",
            permissions={"action:booking"},
            approved_actions={"booking-10"},
        )
        result = await BookingExecutor(FakeProvider()).execute(
            {"task_id": "booking-10", "goal": "Book a hotel"},
            context,
        )

        self.assertEqual(result.status, "unverified")
        self.assertFalse(result.confirmed)

    async def test_valid_provider_confirmation(self):
        class FakeProvider:
            async def create_booking(self, plan):
                return {
                    "status": "confirmed",
                    "provider_confirmation_id": "CONF-123",
                    "provider": "test-provider",
                }

        context = ActionContext(
            user_id="user-1",
            permissions={"action:booking"},
            approved_actions={"booking-11"},
        )
        result = await BookingExecutor(FakeProvider()).execute(
            {"task_id": "booking-11", "goal": "Book a hotel"},
            context,
        )

        self.assertEqual(result.status, "confirmed")
        self.assertTrue(result.confirmed)
        self.assertEqual(
            result.confirmation["provider_confirmation_id"],
            "CONF-123",
        )


class BookingVerifierTests(unittest.TestCase):
    def test_confirms_response_with_confirmation_id(self):
        result = BookingVerifier().verify({
            "status": "confirmed",
            "provider_confirmation_id": "CONF-123",
        })

        self.assertTrue(result.verified)
        self.assertEqual(result.status, "confirmed")

    def test_pending_response_is_not_verified(self):
        result = BookingVerifier().verify({"status": "pending"})

        self.assertFalse(result.verified)
        self.assertEqual(result.status, "pending")

    def test_missing_confirmation_id_is_rejected(self):
        result = BookingVerifier().verify({"status": "confirmed"})

        self.assertFalse(result.verified)
        self.assertEqual(result.status, "unverified")


if __name__ == "__main__":
    unittest.main()
