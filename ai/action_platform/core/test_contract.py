import unittest

from ai.action_platform.core.action import ActionDomain, ActionStatus
from ai.action_platform.core.models import ActionRequest, ActionResult
from ai.action_platform.core.schemas import validate_request
from ai.action_platform.exceptions import InvalidActionRequestError


class ActionPlatformContractTests(unittest.TestCase):
    def test_valid_shopping_request(self):
        request = ActionRequest(
            domain=ActionDomain.SHOPPING,
            goal="Find a laptop under my budget",
            payload={"budget": 60000},
        )
        validate_request(request)

    def test_empty_goal_rejected(self):
        request = ActionRequest(domain=ActionDomain.FOOD, goal="  ")
        with self.assertRaises(InvalidActionRequestError):
            validate_request(request)

    def test_invalid_domain_rejected(self):
        request = ActionRequest(
            domain="unknown",
            goal="Do a task",
        )
        with self.assertRaises(InvalidActionRequestError):
            validate_request(request)

    def test_non_dictionary_payload_rejected(self):
        request = ActionRequest(
            domain=ActionDomain.TRAVEL,
            goal="Search flights",
            payload=["not", "a", "dictionary"],
        )
        with self.assertRaises(InvalidActionRequestError):
            validate_request(request)

    def test_result_serialization(self):
        result = ActionResult(
            task_id="task-test",
            domain=ActionDomain.BOOKING,
            status=ActionStatus.AWAITING_APPROVAL,
            goal="Book movie tickets",
        )
        output = result.to_dict()
        self.assertEqual(output["domain"], "booking")
        self.assertEqual(output["status"], "awaiting_approval")
        self.assertEqual(output["task_id"], "task-test")

    def test_non_string_task_id_rejected(self):
        request = ActionRequest(
            domain=ActionDomain.FOOD,
            goal="Find restaurants",
            task_id=123,
        )
        with self.assertRaises(InvalidActionRequestError):
            validate_request(request)

    def test_long_task_id_rejected(self):
        request = ActionRequest(
            domain=ActionDomain.FOOD,
            goal="Find restaurants",
            task_id="x" * 201,
        )
        with self.assertRaises(InvalidActionRequestError):
            validate_request(request)

    def test_non_string_metadata_key_rejected(self):
        request = ActionRequest(
            domain=ActionDomain.FOOD,
            goal="Find restaurants",
            metadata={123: "invalid key"},
        )
        with self.assertRaises(InvalidActionRequestError):
            validate_request(request)


if __name__ == "__main__":
    unittest.main()
