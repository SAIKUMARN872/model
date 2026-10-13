import unittest
from types import SimpleNamespace

from ai.browser_automation.verification import (
    VerificationResult,
    VerificationStatus,
    VerificationValidationError,
    validate_expectation,
    verify_action,
    verify_result,
)
from ai.browser_automation.verification.checks.page_check import verify_page


class FakeLocator:
    def __init__(self, page, selector):
        self.page = page
        self.selector = selector

    async def inner_text(self):
        return self.page.body_text

    async def is_visible(self):
        return self.selector in self.page.visible_selectors


class FakePage:
    def __init__(self):
        self.url = "https://example.com/confirmation"
        self.body_text = "Order received. Reference ABC123."
        self.visible_selectors = {"h1", "#confirmation"}

    async def title(self):
        return "Order Confirmation"

    def locator(self, selector):
        return FakeLocator(self, selector)


class VerificationResultTests(unittest.TestCase):
    def test_result_serializes_status_and_evidence(self):
        result = VerificationResult(
            VerificationStatus.PASSED,
            "page",
            "Verified",
            [{"check": "title", "matched": True}],
        )
        payload = result.to_dict()
        self.assertEqual(payload["status"], "passed")
        self.assertTrue(result.passed)
        self.assertEqual(payload["evidence"][0]["check"], "title")

    def test_rejects_invalid_status(self):
        with self.assertRaises(ValueError):
            VerificationResult("passed", "page", "Verified")

    def test_rejects_invalid_evidence(self):
        with self.assertRaises(ValueError):
            VerificationResult(
                VerificationStatus.PASSED, "page", "Verified", ["invalid"]
            )

    def test_validates_expectations(self):
        self.assertEqual(
            validate_expectation({"title_contains": "Confirmation"}),
            {"title_contains": "Confirmation"},
        )

    def test_rejects_empty_or_unknown_expectations(self):
        for value in ({}, {"unexpected": "value"}, {"text_contains": " "}):
            with self.subTest(value=value):
                with self.assertRaises(VerificationValidationError):
                    validate_expectation(value)

    def test_rejects_conflicting_selector_expectations(self):
        with self.assertRaises(VerificationValidationError):
            validate_expectation({
                "selector_visible": "#status",
                "selector_hidden": "#status",
            })


class ActionVerificationTests(unittest.TestCase):
    def test_matching_action_passes(self):
        result = verify_action("click", {"action": "click", "selector": "#submit"})
        self.assertEqual(result.status, VerificationStatus.PASSED)

    def test_mismatched_action_fails(self):
        result = verify_action("click", {"action": "fill"})
        self.assertEqual(result.status, VerificationStatus.FAILED)

    def test_missing_action_is_inconclusive(self):
        result = verify_action("click", None)
        self.assertEqual(result.status, VerificationStatus.INCONCLUSIVE)


class ResultVerificationTests(unittest.TestCase):
    def test_completed_execution_metadata_passes(self):
        result = verify_result(SimpleNamespace(
            status=SimpleNamespace(value="completed"),
            completed_actions=2,
        ), require_actions=2)
        self.assertEqual(result.status, VerificationStatus.PASSED)
        self.assertIn("does not prove", result.message)

    def test_failed_status_fails(self):
        result = verify_result(SimpleNamespace(
            status="failed", completed_actions=2
        ))
        self.assertEqual(result.status, VerificationStatus.FAILED)

    def test_missing_result_is_inconclusive(self):
        result = verify_result(None)
        self.assertEqual(result.status, VerificationStatus.INCONCLUSIVE)

    def test_invalid_required_action_count_rejected(self):
        with self.assertRaises(ValueError):
            verify_result(object(), require_actions=-1)


class PageVerificationTests(unittest.IsolatedAsyncioTestCase):
    async def test_all_expected_conditions_pass(self):
        page = FakePage()
        result = await verify_page(page, {
            "url_contains": "/confirmation",
            "title_contains": "Confirmation",
            "text_contains": "ABC123",
            "selector_visible": "#confirmation",
            "selector_hidden": "#error",
        })
        self.assertEqual(result.status, VerificationStatus.PASSED)
        self.assertEqual(len(result.evidence), 5)

    async def test_mismatched_condition_fails(self):
        result = await verify_page(FakePage(), {
            "text_contains": "Payment failed",
        })
        self.assertEqual(result.status, VerificationStatus.FAILED)

    async def test_invalid_expectation_is_inconclusive(self):
        result = await verify_page(FakePage(), {})
        self.assertEqual(result.status, VerificationStatus.INCONCLUSIVE)

    async def test_missing_page_is_inconclusive(self):
        result = await verify_page(None, {"title_contains": "Confirmation"})
        self.assertEqual(result.status, VerificationStatus.INCONCLUSIVE)

    async def test_inspection_error_is_inconclusive(self):
        class BrokenPage:
            url = "https://example.com"

            async def title(self):
                raise RuntimeError("private browser detail")

        result = await verify_page(BrokenPage(), {
            "title_contains": "Confirmation",
        })
        self.assertEqual(result.status, VerificationStatus.INCONCLUSIVE)
        self.assertNotIn("private browser detail", result.message)


if __name__ == "__main__":
    unittest.main(verbosity=2)
