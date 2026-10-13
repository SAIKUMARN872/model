import unittest
from unittest.mock import AsyncMock, MagicMock

from ai.browser_automation.automation import (
    AutomationTask,
    AutomationWorkflow,
    TaskStatus,
    build_task_summary,
)
from ai.browser_automation.exceptions import BrowserActionError
from ai.browser_automation.models import BrowserAction
from ai.browser_automation.constants import BrowserActionType


def make_action():
    return BrowserAction(action_type=BrowserActionType.INSPECT)


class AutomationTaskTests(unittest.TestCase):
    def test_default_task_state(self):
        task = AutomationTask(actions=[make_action()], description="Inspect page")
        self.assertEqual(task.status, TaskStatus.PENDING)
        self.assertEqual(task.results, [])
        self.assertIsNone(task.error)
        self.assertTrue(task.task_id)

    def test_rejects_invalid_actions(self):
        with self.assertRaises(TypeError):
            AutomationTask(actions=["not an action"])

    def test_build_task_summary(self):
        task = AutomationTask(actions=[make_action()], description="Research")
        summary = build_task_summary(task)
        self.assertEqual(summary["status"], "pending")
        self.assertEqual(summary["action_count"], 1)
        self.assertEqual(summary["completed_action_count"], 0)


class AutomationWorkflowTests(unittest.IsolatedAsyncioTestCase):
    async def test_execute_completes_task(self):
        agent = MagicMock()
        agent.execute_many = AsyncMock(return_value=[{"action": "inspect"}])
        workflow = AutomationWorkflow(agent)
        task = AutomationTask(actions=[make_action()], description="Inspect")

        result = await workflow.execute(task)

        self.assertEqual(task.status, TaskStatus.COMPLETED)
        self.assertEqual(result["status"], "completed")
        self.assertEqual(len(result["results"]), 1)

    async def test_execute_marks_failed_task(self):
        agent = MagicMock()
        agent.execute_many = AsyncMock(side_effect=RuntimeError("execution failed"))
        workflow = AutomationWorkflow(agent)
        task = AutomationTask(actions=[make_action()])

        with self.assertRaises(RuntimeError):
            await workflow.execute(task)

        self.assertEqual(task.status, TaskStatus.FAILED)
        self.assertEqual(task.error, "execution failed")

    async def test_terminal_task_cannot_run_again(self):
        agent = MagicMock()
        agent.execute_many = AsyncMock(return_value=[])
        workflow = AutomationWorkflow(agent)
        task = AutomationTask(actions=[make_action()])
        task.status = TaskStatus.COMPLETED

        with self.assertRaises(BrowserActionError):
            await workflow.execute(task)

        agent.execute_many.assert_not_awaited()

    async def test_rejects_non_task(self):
        workflow = AutomationWorkflow(MagicMock())

        with self.assertRaises(TypeError):
            await workflow.execute("invalid")


if __name__ == "__main__":
    unittest.main()
