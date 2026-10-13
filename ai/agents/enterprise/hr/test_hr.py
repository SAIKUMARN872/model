import asyncio
import json
import unittest

from ai.agents.enterprise.constants import EnterpriseDomain
from ai.agents.enterprise.models import EnterpriseTask
from ai.agents.enterprise.registry import EnterpriseAgentRegistry
from ai.agents.enterprise.router import EnterpriseRouter
from ai.agents.enterprise.hr import HRAgent, HRWorkflow, HRTools


class HRWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.tools = HRTools()
        self.workflow = HRWorkflow(self.tools)

    def test_create_employee(self):
        result = self.workflow.execute("create_employee", {
            "name": "Ananya Rao",
            "email": "ananya@example.com",
            "department": "Engineering",
            "job_title": "Software Engineer",
        })["result"]
        self.assertEqual(result["name"], "Ananya Rao")

    def test_duplicate_employee_email_rejected(self):
        payload = {
            "name": "Ananya Rao",
            "email": "ananya@example.com",
            "department": "Engineering",
            "job_title": "Engineer",
        }
        self.workflow.execute("create_employee", payload)
        with self.assertRaisesRegex(ValueError, "already exists"):
            self.workflow.execute("create_employee", payload)

    def test_candidate_must_be_shortlisted_before_interview(self):
        candidate = self.workflow.execute("create_candidate", {
            "name": "Ravi Kumar",
            "email": "ravi@example.com",
            "role": "Python Developer",
        })["result"]
        with self.assertRaisesRegex(ValueError, "Only shortlisted"):
            self.workflow.execute("schedule_interview", {
                "candidate_id": candidate["id"],
                "interview_at": "2026-10-20T10:00:00+05:30",
                "interviewer": "Engineering Manager",
            })

    def test_shortlisted_candidate_can_be_scheduled(self):
        candidate = self.workflow.execute("create_candidate", {
            "name": "Ravi Kumar",
            "email": "ravi@example.com",
            "role": "Python Developer",
        })["result"]
        self.workflow.execute("screen_candidate", {
            "candidate_id": candidate["id"],
            "decision": "shortlisted",
        })
        interview = self.workflow.execute("schedule_interview", {
            "candidate_id": candidate["id"],
            "interview_at": "2026-10-20T10:00:00+05:30",
            "interviewer": "Engineering Manager",
        })["result"]
        self.assertEqual(interview["status"], "scheduled")

    def test_leave_requires_review(self):
        employee = self.workflow.execute("create_employee", {
            "name": "Ananya Rao",
            "email": "ananya@example.com",
            "department": "Engineering",
            "job_title": "Engineer",
        })["result"]
        leave = self.workflow.execute("submit_leave_request", {
            "employee_id": employee["id"],
            "start_date": "2026-11-01",
            "end_date": "2026-11-02",
            "reason": "Personal leave",
        })["result"]
        self.assertEqual(leave["status"], "pending_approval")
        reviewed = self.workflow.execute("review_leave_request", {
            "request_id": leave["id"],
            "decision": "approved",
        })["result"]
        self.assertEqual(reviewed["decision"], "approved")

    def test_attendance_requires_existing_employee(self):
        with self.assertRaisesRegex(ValueError, "Employee not found"):
            self.workflow.execute("record_attendance", {
                "employee_id": "missing",
                "date": "2026-10-11",
                "attendance_status": "present",
            })

    def test_performance_rating_range(self):
        employee = self.workflow.execute("create_employee", {
            "name": "Ananya Rao",
            "email": "ananya@example.com",
            "department": "Engineering",
            "job_title": "Engineer",
        })["result"]
        with self.assertRaisesRegex(ValueError, "rating"):
            self.workflow.execute("record_performance_review", {
                "employee_id": employee["id"],
                "reviewer": "Manager",
                "summary": "Quarterly review",
                "rating": 8,
            })

    def test_unknown_action_rejected(self):
        with self.assertRaisesRegex(ValueError, "Unsupported HR action"):
            self.workflow.execute("terminate_employee", {})

    def test_registry_router_integration(self):
        registry = EnterpriseAgentRegistry()
        registry.register(HRAgent())
        router = EnterpriseRouter(registry)
        task = EnterpriseTask(
            task_id="hr-integration",
            domain=EnterpriseDomain.HR,
            action="create_employee",
            payload={
                "name": "Ananya Rao",
                "email": "ananya@example.com",
                "department": "Engineering",
                "job_title": "Engineer",
            },
        )
        response = json.loads(asyncio.run(router.route(task)))
        self.assertEqual(response["domain"], "hr")
        self.assertEqual(response["action"], "create_employee")
        self.assertEqual(response["result"]["name"], "Ananya Rao")


if __name__ == "__main__":
    unittest.main()
