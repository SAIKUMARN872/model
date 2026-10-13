"""Tests for planning, dependency validation, and workflow execution."""

import unittest

from ..constants import AgentStatus
from ..models import AgentRequest
from .planner import PlannerAgent, build_plan
from .tasks import PlanTask, TaskPlan, TaskStatus
from .utils import topological_sort
from .workflow import WorkflowExecutor


class PlannerUtilityTests(unittest.TestCase):
    def test_topological_sort(self):
        order = topological_sort(
            ["third", "first", "second"],
            {"first": [], "second": ["first"], "third": ["second"]},
        )
        self.assertLess(order.index("first"), order.index("second"))
        self.assertLess(order.index("second"), order.index("third"))

    def test_rejects_unknown_dependency(self):
        with self.assertRaises(ValueError):
            topological_sort(["a"], {"a": ["missing"]})

    def test_rejects_cycle(self):
        with self.assertRaises(ValueError):
            topological_sort(["a", "b"], {"a": ["b"], "b": ["a"]})

    def test_build_plan(self):
        plan = build_plan(
            "publish release",
            [
                {"task_id": "build", "description": "Build application"},
                {
                    "task_id": "test",
                    "description": "Run tests",
                    "dependencies": ["build"],
                },
            ],
        )
        self.assertEqual(len(plan.tasks), 2)

    def test_rejects_duplicate_task_ids(self):
        with self.assertRaises(ValueError):
            TaskPlan(
                "goal",
                [
                    PlanTask("a", "first"),
                    PlanTask("a", "duplicate"),
                ],
            )


class WorkflowTests(unittest.TestCase):
    def test_executes_in_dependency_order(self):
        executed = []
        plan = build_plan(
            "release",
            [
                {"task_id": "deploy", "description": "Deploy", "dependencies": ["test"]},
                {"task_id": "build", "description": "Build"},
                {"task_id": "test", "description": "Test", "dependencies": ["build"]},
            ],
        )
        WorkflowExecutor(lambda task: executed.append(task.task_id) or "ok").run(plan)
        self.assertEqual(executed, ["build", "test", "deploy"])
        self.assertTrue(all(t.status == TaskStatus.COMPLETED for t in plan.tasks))

    def test_failed_task_blocks_dependents(self):
        plan = build_plan(
            "release",
            [
                {"task_id": "build", "description": "Build"},
                {"task_id": "deploy", "description": "Deploy", "dependencies": ["build"]},
            ],
        )

        def fail_build(task):
            if task.task_id == "build":
                raise RuntimeError("build failed")
            return "deployed"

        WorkflowExecutor(fail_build).run(plan)
        self.assertEqual(plan.tasks[0].status, TaskStatus.FAILED)
        self.assertEqual(plan.tasks[1].status, TaskStatus.BLOCKED)

    def test_executor_must_be_callable(self):
        with self.assertRaises(ValueError):
            WorkflowExecutor(None)


class PlannerAgentTests(unittest.IsolatedAsyncioTestCase):
    async def test_plans_without_executing(self):
        agent = PlannerAgent()
        response = await agent.run(
            AgentRequest(
                input="release",
                metadata={
                    "steps": [
                        {"task_id": "build", "description": "Build"},
                        {
                            "task_id": "test",
                            "description": "Test",
                            "dependencies": ["build"],
                        },
                    ]
                },
            )
        )
        self.assertEqual(response.status, AgentStatus.COMPLETED)
        self.assertEqual(len(__import__("json").loads(response.output)["tasks"]), 2)
        self.assertFalse(__import__("json").loads(response.output)["executed"])

    async def test_executes_when_requested(self):
        agent = PlannerAgent(task_executor=lambda task: "done")
        response = await agent.run(
            AgentRequest(
                input="release",
                metadata={
                    "steps": [{"task_id": "build", "description": "Build"}],
                    "execute": True,
                },
            )
        )
        self.assertEqual(response.status, AgentStatus.COMPLETED)
        self.assertEqual(__import__("json").loads(response.output)["tasks"][0]["status"], "completed")

    async def test_missing_steps_fails_cleanly(self):
        agent = PlannerAgent()
        response = await agent.run(AgentRequest(input="release"))
        self.assertEqual(response.status, AgentStatus.FAILED)


if __name__ == "__main__":
    unittest.main()



