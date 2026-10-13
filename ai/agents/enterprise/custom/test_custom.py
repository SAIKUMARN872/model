import unittest

from .agent import CustomEnterpriseAgent
from .schemas import CustomStatus
from .tools import CustomTools
from .workflows import CustomWorkflow


class CustomEnterpriseTests(unittest.TestCase):
    def setUp(self):
        self.tools = CustomTools()
        self.workflow = CustomWorkflow(self.tools)
        self.tools.define_workflow(
            "equipment_request",
            ["request_received", "manager_review", "fulfilled"],
        )

    def test_define_workflow(self):
        result = self.tools.define_workflow(
            "travel_request", ["submitted", "reviewed"]
        )
        self.assertEqual(result["steps"], ["submitted", "reviewed"])

    def test_duplicate_workflow_rejected(self):
        with self.assertRaisesRegex(ValueError, "already exists"):
            self.tools.define_workflow("equipment_request", ["another_step"])

    def test_empty_workflow_rejected(self):
        with self.assertRaisesRegex(ValueError, "at least one step"):
            self.tools.define_workflow("empty", [])

    def test_case_advances_and_completes(self):
        case = self.tools.create_case("equipment_request", "Laptop request")
        case_id = case["case_id"]
        self.assertEqual(
            self.tools.advance_case(case_id)["completed_steps"],
            ["request_received"],
        )
        self.tools.advance_case(case_id)
        result = self.tools.advance_case(case_id)
        self.assertEqual(result["status"], CustomStatus.COMPLETED.value)

    def test_approval_required_and_approved(self):
        self.tools.define_workflow(
            "sensitive_change", ["change_reviewed", "change_applied"],
            requires_approval=True,
        )
        case = self.tools.create_case("sensitive_change", "Access change")
        waiting = self.tools.advance_case(case["case_id"])
        self.assertEqual(waiting["status"], CustomStatus.AWAITING_APPROVAL.value)
        approved = self.tools.decide_approval(case["case_id"], True)
        self.assertEqual(approved["completed_steps"], ["change_reviewed"])
        self.assertEqual(approved["status"], CustomStatus.ACTIVE.value)

    def test_rejected_approval_cancels_case(self):
        self.tools.define_workflow(
            "sensitive_change", ["change_reviewed"], requires_approval=True
        )
        case = self.tools.create_case("sensitive_change", "Access change")
        self.tools.advance_case(case["case_id"])
        result = self.tools.decide_approval(case["case_id"], False)
        self.assertEqual(result["status"], CustomStatus.CANCELLED.value)

    def test_unknown_case_rejected(self):
        with self.assertRaisesRegex(ValueError, "Unknown case"):
            self.tools.get_case("missing")

    def test_cancel_case(self):
        case = self.tools.create_case("equipment_request", "Laptop request")
        result = self.tools.cancel_case(case["case_id"])
        self.assertEqual(result["status"], CustomStatus.CANCELLED.value)

    def test_agent_workflow_action(self):
        agent = CustomEnterpriseAgent(tools=self.tools)
        result = self.workflow.execute("create_case", {
            "workflow_name": "equipment_request",
            "title": "New monitor",
        })
        self.assertEqual(result["result"]["status"], CustomStatus.ACTIVE.value)


if __name__ == "__main__":
    unittest.main()
