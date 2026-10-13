"""Tests for universal automation intent classification and planning."""

import unittest

from . import AutomationDomain, plan_automation


class UniversalAutomationTests(unittest.TestCase):
    def test_shopping_prompt(self):
        plan = plan_automation(
            "Find running shoes under 4000 and buy after my approval"
        )
        self.assertEqual(plan.intent.domain, AutomationDomain.SHOPPING)
        self.assertEqual(plan.intent.constraints["budget"], 4000.0)
        self.assertTrue(plan.requires_user_approval)
        self.assertFalse(plan.execution_ready)

    def test_food_prompt_requests_location_when_missing(self):
        plan = plan_automation("Order biryani for me")
        self.assertEqual(plan.intent.domain, AutomationDomain.FOOD)
        self.assertTrue(plan.intent.needs_clarification)

    def test_travel_prompt_extracts_route(self):
        plan = plan_automation(
            "Find flights from Hyderabad to Delhi tomorrow"
        )
        self.assertEqual(plan.intent.domain, AutomationDomain.TRAVEL)
        self.assertEqual(plan.intent.constraints["origin"], "Hyderabad")
        self.assertEqual(plan.intent.constraints["destination"], "Delhi")
        self.assertFalse(plan.intent.needs_clarification)

    def test_hotel_prompt_requests_dates(self):
        plan = plan_automation("Find a hotel in Goa")
        self.assertEqual(plan.intent.domain, AutomationDomain.HOTEL)
        self.assertTrue(plan.intent.needs_clarification)

    def test_movie_prompt(self):
        plan = plan_automation("Find movie tickets for tonight")
        self.assertEqual(plan.intent.domain, AutomationDomain.MOVIE)
        self.assertFalse(plan.intent.needs_clarification)

    def test_unknown_prompt_is_general(self):
        plan = plan_automation("Inspect a public product information page")
        self.assertEqual(plan.intent.domain, AutomationDomain.GENERAL)
        self.assertFalse(plan.execution_ready)
        self.assertTrue(plan.to_dict()["steps"])

    def test_exam_application_prompt(self):
        plan = plan_automation("Apply for AP EAMCET")
        self.assertEqual(
            plan.intent.domain,
            AutomationDomain.EXAM_APPLICATION,
        )
        self.assertTrue(plan.requires_user_approval)
        self.assertFalse(plan.execution_ready)

    def test_generic_product_page_is_not_shopping(self):
        plan = plan_automation(
            "Inspect a public product information page"
        )
        self.assertEqual(plan.intent.domain, AutomationDomain.GENERAL)

    def test_shopping_and_food_prompt_uses_deterministic_classification(self):
        plan = plan_automation(
            "Compare pizza prices and buy a laptop"
        )
        self.assertIn(
            plan.intent.domain,
            {AutomationDomain.FOOD, AutomationDomain.SHOPPING},
        )

    def test_empty_prompt_rejected(self):
        with self.assertRaises(ValueError):
            plan_automation("  ")


if __name__ == "__main__":
    unittest.main()
