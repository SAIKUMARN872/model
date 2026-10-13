"""Unit tests for the browser task planner."""

import unittest

from ai.browser_automation.models import BrowserAction
from ai.browser_automation.planner import (
    BrowserGoal,
    BrowserTaskPlanner,
    validate_actions,
)


class GoalTests(unittest.TestCase):
    def test_accepts_valid_goal(self):
        goal = BrowserGoal(
            description="Find a product",
            start_url="https://example.com",
            success_criteria=("Product found",),
        )
        self.assertEqual(goal.start_url, "https://example.com/")

    def test_rejects_empty_goal(self):
        with self.assertRaises(ValueError):
            BrowserGoal(description=" ")

    def test_rejects_unsafe_start_url(self):
        with self.assertRaises(ValueError):
            BrowserGoal(description="Visit local service", start_url="http://127.0.0.1")


class PlannerTests(unittest.TestCase):
    def test_creates_plan(self):
        goal = BrowserGoal("Search for a product")
        actions = [
            BrowserAction(action_type="click", selector="#search"),
            BrowserAction(action_type="fill", selector="#query", value="laptop"),
        ]
        plan = BrowserTaskPlanner().plan(goal, actions)
        self.assertEqual(len(plan.actions), 2)
        self.assertEqual(plan.metadata["action_count"], 2)
        self.assertTrue(plan.plan_id)

    def test_approval_flag_is_preserved(self):
        goal = BrowserGoal("Submit an order")
        action = BrowserAction(
            action_type="click",
            selector="#submit",
            requires_approval=True,
        )
        plan = BrowserTaskPlanner().plan(goal, [action])
        self.assertTrue(plan.requires_approval)

    def test_explicit_approval_is_preserved(self):
        plan = BrowserTaskPlanner().plan(
            BrowserGoal("Continue"),
            [],
            requires_approval=True,
        )
        self.assertTrue(plan.requires_approval)

    def test_enforces_action_limit(self):
        planner = BrowserTaskPlanner(max_actions=1)
        actions = [
            BrowserAction(action_type="wait", value="100"),
            BrowserAction(action_type="wait", value="200"),
        ]
        with self.assertRaises(ValueError):
            planner.plan(BrowserGoal("Wait"), actions)

    def test_rejects_invalid_action(self):
        action = BrowserAction(action_type="click")
        with self.assertRaises(ValueError):
            validate_actions([action])

    def test_rejects_unsafe_navigation_action(self):
        action = BrowserAction(action_type="navigate", url="file:///etc/passwd")
        with self.assertRaises(ValueError):
            validate_actions([action])

    def test_plan_does_not_execute_actions(self):
        action = BrowserAction(action_type="wait", value="100")
        plan = BrowserTaskPlanner().plan(BrowserGoal("Wait briefly"), [action])
        self.assertIs(plan.actions[0], action)


if __name__ == "__main__":
    unittest.main()
