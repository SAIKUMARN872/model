import unittest

from ai.action_platform.core.action import ActionDomain, ActionStatus
from ai.action_platform.core.context import ActionContext
from ai.action_platform.core.models import ActionRequest
from ai.action_platform.registry import ActionRegistry
from ai.action_platform.router import ActionRouter


class StatusHandler:
    def __init__(self, status):
        self.status = status
        self.calls = 0

    async def execute(self, request, context=None):
        self.calls += 1
        return {
            "status": self.status,
            "message": "Explicit handler outcome",
        }


class ActionRouterStatusTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.context = ActionContext(
            user_id="status-test-user",
            permissions={"action:shopping"},
        )

    async def _execute_with_status(self, status):
        registry = ActionRegistry()
        handler = StatusHandler(status)
        registry.register(ActionDomain.SHOPPING, handler)

        router = ActionRouter(registry)
        request = ActionRequest(
            domain=ActionDomain.SHOPPING,
            goal="Test explicit result status",
            task_id=f"status-test-{status}",
        )

        result = await router.execute(request, self.context)
        return result, handler

    async def test_awaiting_approval_status_is_preserved(self):
        result, handler = await self._execute_with_status(
            ActionStatus.AWAITING_APPROVAL.value
        )

        self.assertEqual(result.status, ActionStatus.AWAITING_APPROVAL)
        self.assertEqual(handler.calls, 1)

    async def test_failed_status_is_preserved(self):
        result, handler = await self._execute_with_status(
            ActionStatus.FAILED.value
        )

        self.assertEqual(result.status, ActionStatus.FAILED)
        self.assertEqual(handler.calls, 1)

    async def test_explicit_completed_status_is_preserved(self):
        result, handler = await self._execute_with_status(
            ActionStatus.COMPLETED.value
        )

        self.assertEqual(result.status, ActionStatus.COMPLETED)
        self.assertEqual(handler.calls, 1)


if __name__ == "__main__":
    unittest.main()
