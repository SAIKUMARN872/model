"""Unit tests for ModelNow travel actions."""

import unittest
from datetime import date
from decimal import Decimal

from ai.action_platform.travel import (
    TravelBooking,
    TravelBookingManager,
    TravelBookingRequest,
    TravelBookingVerifier,
    TravelManager,
    TravelOption,
    TravelSearchRequest,
)


def make_search_request():
    return TravelSearchRequest(
        origin="HYD",
        destination="DEL",
        departure_date=date(2026, 11, 1),
        passengers=1,
        currency="INR",
    )


def make_option():
    return TravelOption(
        option_id="option-1",
        provider="test-provider",
        travel_type="flight",
        origin="HYD",
        destination="DEL",
        departure_at="2026-11-01T08:00:00+05:30",
        arrival_at="2026-11-01T10:00:00+05:30",
        price=Decimal("4500.00"),
        currency="INR",
        booking_url="https://example.com/book",
    )


def make_booking_request(booking_id="booking-1"):
    return TravelBookingRequest(
        option=make_option(),
        search_request=make_search_request(),
        passenger_names=("Test Passenger",),
        contact_email="test@example.com",
        booking_id=booking_id,
    )


class TravelSearchTests(unittest.TestCase):
    def test_valid_search_request(self):
        request = make_search_request()
        self.assertEqual(request.origin, "HYD")
        self.assertEqual(request.destination, "DEL")
        self.assertEqual(request.passengers, 1)

    def test_invalid_passenger_count_rejected(self):
        with self.assertRaises((ValueError, TypeError)):
            TravelSearchRequest(
                origin="HYD",
                destination="DEL",
                departure_date=date(2026, 11, 1),
                passengers=0,
            )

    def test_return_date_before_departure_rejected(self):
        with self.assertRaises(ValueError):
            TravelSearchRequest(
                origin="HYD",
                destination="DEL",
                departure_date=date(2026, 11, 2),
                return_date=date(2026, 11, 1),
            )

    def test_insecure_booking_url_rejected(self):
        with self.assertRaises(ValueError):
            TravelOption(
                option_id="option-http",
                provider="test-provider",
                travel_type="flight",
                origin="HYD",
                destination="DEL",
                departure_at="2026-11-01T08:00:00+05:30",
                arrival_at="2026-11-01T10:00:00+05:30",
                price=Decimal("4500"),
                currency="INR",
                booking_url="http://example.com/book",
            )


class TravelBookingTests(unittest.TestCase):
    def setUp(self):
        self.manager = TravelBookingManager()
        self.request = make_booking_request()
        self.manager.prepare(self.request)

    def test_prepare_requires_approval_before_submission(self):
        with self.assertRaises(PermissionError):
            self.manager.submit("booking-1")

    def test_approved_booking_can_be_submitted(self):
        self.manager.register_handler(
            "test-provider",
            lambda request: {
                "status": "confirmed",
                "provider_reference": "provider-ref-123",
                "message": "Confirmed by test provider",
            },
        )
        self.manager.approve("booking-1", approver_id="test-approver")
        result = self.manager.submit("booking-1")
        self.assertEqual(result.status, "confirmed")
        self.assertEqual(result.provider_reference, "provider-ref-123")

    def test_submission_is_not_repeated(self):
        calls = []

        def handler(request):
            calls.append(request.booking_id)
            return {
                "status": "confirmed",
                "provider_reference": "provider-ref-456",
            }

        self.manager.register_handler("test-provider", handler)
        self.manager.approve("booking-1", approver_id="test-approver")
        first = self.manager.submit("booking-1")
        second = self.manager.submit("booking-1")

        self.assertEqual(first.status, "confirmed")
        self.assertEqual(second.status, "confirmed")
        self.assertEqual(len(calls), 1)

    def test_missing_provider_handler_rejected(self):
        self.manager.approve("booking-1", approver_id="test-approver")
        with self.assertRaises(LookupError):
            self.manager.submit("booking-1")

    def test_unconfirmed_provider_response_is_not_success(self):
        self.manager.register_handler(
            "test-provider",
            lambda request: {
                "status": "failed",
                "message": "Provider could not confirm",
            },
        )
        self.manager.approve("booking-1", approver_id="test-approver")
        result = self.manager.submit("booking-1")
        self.assertEqual(result.status, "unknown")

    def test_route_mismatch_rejected_during_prepare(self):
        manager = TravelBookingManager()
        original = make_booking_request()
        wrong_option = TravelOption(
            option_id="wrong-route",
            provider="test-provider",
            travel_type="flight",
            origin="BLR",
            destination="DEL",
            departure_at="2026-11-01T08:00:00+05:30",
            arrival_at="2026-11-01T10:00:00+05:30",
            price=Decimal("4500"),
            currency="INR",
            booking_url="https://example.com/book",
        )
        wrong_request = TravelBookingRequest(
            option=wrong_option,
            search_request=original.search_request,
            passenger_names=original.passenger_names,
            contact_email=original.contact_email,
            booking_id="booking-wrong-route",
        )
        with self.assertRaises(ValueError):
            manager.prepare(wrong_request)


class TravelVerificationTests(unittest.TestCase):
    def test_confirmed_booking_with_reference_verifies(self):
        request = make_booking_request()
        booking = TravelBooking(
            booking_id="booking-1",
            option_id="option-1",
            provider="test-provider",
            status="confirmed",
            price=Decimal("4500.00"),
            currency="INR",
            created_at="2026-10-11T10:00:00+05:30",
            provider_reference="provider-ref-123",
            message="Confirmed",
        )
        result = TravelBookingVerifier().verify(request, booking)
        self.assertTrue(result.valid)

    def test_option_id_mismatch_fails_verification(self):
        request = make_booking_request()
        booking = TravelBooking(
            booking_id="booking-1",
            option_id="different-option",
            provider="test-provider",
            status="confirmed",
            price=Decimal("4500.00"),
            currency="INR",
            created_at="2026-10-11T10:00:00+05:30",
            provider_reference="provider-ref-123",
            message="Confirmed",
        )
        result = TravelBookingVerifier().verify(request, booking)
        self.assertFalse(result.valid)

    def test_confirmed_booking_without_reference_fails_verification(self):
        request = make_booking_request()
        booking = TravelBooking(
            booking_id="booking-1",
            option_id="option-1",
            provider="test-provider",
            status="confirmed",
            price=Decimal("4500.00"),
            currency="INR",
            created_at="2026-10-11T10:00:00+05:30",
            provider_reference=None,
            message="Confirmation reference missing",
        )
        result = TravelBookingVerifier().verify(request, booking)
        self.assertFalse(result.valid)


class TravelManagerTests(unittest.TestCase):
    def test_search_without_provider_returns_failure(self):
        result = TravelManager().search(make_search_request())
        self.assertFalse(result.success)
        self.assertEqual(result.action, "search")

    def test_registered_provider_returns_options(self):
        manager = TravelManager()
        manager.register_search_provider(
            "test-search",
            lambda request: [make_option()],
        )
        result = manager.search(make_search_request())
        self.assertTrue(result.success)
        self.assertEqual(len(result.options), 1)

    def test_search_provider_duplicate_rejected(self):
        manager = TravelManager()
        manager.register_search_provider(
            "test-search",
            lambda request: [make_option()],
        )
        with self.assertRaises(ValueError):
            manager.register_search_provider(
                "TEST-SEARCH",
                lambda request: [make_option()],
            )

    def test_search_rejects_option_with_wrong_route(self):
        manager = TravelManager()
        wrong_option = TravelOption(
            option_id="wrong-route",
            provider="test-provider",
            travel_type="flight",
            origin="BLR",
            destination="DEL",
            departure_at="2026-11-01T08:00:00+05:30",
            arrival_at="2026-11-01T10:00:00+05:30",
            price=Decimal("4500"),
            currency="INR",
            booking_url="https://example.com/book",
        )
        manager.register_search_provider(
            "test-search",
            lambda request: [wrong_option],
        )
        result = manager.search(make_search_request())
        self.assertFalse(result.success)


if __name__ == "__main__":
    unittest.main(verbosity=2)
