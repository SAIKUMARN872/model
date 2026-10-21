"""Tests for the asynchronous browser task worker."""

import unittest
from types import SimpleNamespace

from ai.browser_automation.executor.utils import (
    is_awaitable,
    normalize_task_id,
    validate_timeout,
)
from ai.browser_automation.executor.worker import BrowserTaskWorker


class FakeExecutor:
    def __init__(self, result=None, error=None):
        self.result = result or SimpleNamespace(success=True)
        self.error = error
        self.calls = 0

    async def execute(self, task, *, user_id, permissions):
        self.calls += 1
        if self.error:
            raise self.error
        return self.result


class WorkerUtilityTests(unittest.TestCase):
    def test_validates_timeout(self):
        self.assertEqual(validate_timeout(2), 2.0)

    def test_rejects_nonpositive_timeout(self):
        for value in (0, -1, True):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    validate_timeout(value)

    def test_normalizes_task_id(self):
        self.assertEqual(normalize_task_id(" task-123 "), "task-123")

    def test_rejects_invalid_task_id(self):
        for value in ("", "   ", "../private", "task id"):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    normalize_task_id(value)

    def test_detects_awaitable(self):
        async def sample():
            return None

        coroutine = sample()
        try:
            self.assertTrue(is_awaitable(coroutine))
        finally:
            coroutine.close()


class BrowserTaskWorkerTests(unittest.IsolatedAsyncioTestCase):
    async def test_runs_task(self):
        executor = FakeExecutor()
        worker = BrowserTaskWorker(executor)
        task = SimpleNamespace(task_id="task-1")

        result = await worker.run(
            task,
            user_id="user-1",
            permissions=["browser:execute"],
        )

        self.assertTrue(result.success)
        self.assertEqual(result.task_id, "task-1")
        self.assertEqual(executor.calls, 1)

    async def test_rejects_missing_user(self):
        executor = FakeExecutor()
        worker = BrowserTaskWorker(executor)

        result = await worker.run(
            SimpleNamespace(task_id="task-2"),
            user_id=" ",
            permissions=["browser:execute"],
        )

        self.assertFalse(result.success)
        self.assertEqual(executor.calls, 0)

    async def test_handles_executor_exception(self):
        executor = FakeExecutor(error=RuntimeError("private internal detail"))
        worker = BrowserTaskWorker(executor)

        result = await worker.run(
            SimpleNamespace(task_id="task-3"),
            user_id="user-1",
            permissions=["browser:execute"],
        )

        self.assertFalse(result.success)
        self.assertEqual(result.error, "Browser task execution failed.")
        self.assertNotIn("private internal detail", result.error)

    async def test_handles_unsuccessful_result(self):
        executor = FakeExecutor(result=SimpleNamespace(success=False))
        worker = BrowserTaskWorker(executor)

        result = await worker.run(
            SimpleNamespace(task_id="task-4"),
            user_id="user-1",
            permissions=["browser:execute"],
        )

        self.assertFalse(result.success)

    async def test_rejects_string_as_permissions_collection(self):
        executor = FakeExecutor()
        worker = BrowserTaskWorker(executor)

        result = await worker.run(
            SimpleNamespace(task_id="task-5"),
            user_id="user-1",
            permissions="browser:execute",
        )

        self.assertFalse(result.success)
        self.assertEqual(executor.calls, 0)


if __name__ == "__main__":
    unittest.main()
