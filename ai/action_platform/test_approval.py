import unittest

from ai.action_platform.core.action import ActionDomain, ActionStatus
from ai.action_platform.core.context import ActionContext
from ai.action_platform.core.models import ActionRequest
from ai.action_platform.registry import ActionRegistry
from ai.action_platform.router import ActionRouter


class FakeHandler:
    def __init__(self):
        self.calls = 0

    async def execute(self, request, context=None):
        self.calls += 1
        return {"message": "executed"}


class ActionApprovalTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.registry = ActionRegistry()
        self.handler = FakeHandler()
        self.registry.register(ActionDomain.SHOPPING, self.handler)
        self.router = ActionRouter(self.registry)
        self.context = ActionContext(
            user_id="test-user",
            permissions={"action:shopping"},
        )

    async def test_checkout_pauses_without_approval(self):
        request = ActionRequest(
            domain=ActionDomain.SHOPPING,
            goal="Complete checkout",
            payload={"operation": "checkout"},
            task_id="checkout-task-1",
        )

        result = await self.router.execute(request, self.context)

        self.assertEqual(result.status, ActionStatus.AWAITING_APPROVAL)
        self.assertTrue(result.data["approval_required"])
        self.assertEqual(self.handler.calls, 0)

    async def test_checkout_executes_after_task_approval(self):
        request = ActionRequest(
            domain=ActionDomain.SHOPPING,
            goal="Complete checkout",
            payload={"operation": "checkout"},
            task_id="checkout-task-2",
        )
        self.context.approved_actions.add("checkout-task-2")

        result = await self.router.execute(request, self.context)

        self.assertEqual(result.status, ActionStatus.COMPLETED)
        self.assertEqual(self.handler.calls, 1)

    async def test_search_does_not_require_approval(self):
        request = ActionRequest(
            domain=ActionDomain.SHOPPING,
            goal="Search for a laptop",
            payload={"operation": "search"},
            task_id="search-task-1",
        )

        result = await self.router.execute(request, self.context)

        self.assertEqual(result.status, ActionStatus.COMPLETED)
        self.assertEqual(self.handler.calls, 1)

    async def test_explicit_approval_flag_is_respected(self):
        request = ActionRequest(
            domain=ActionDomain.SHOPPING,
            goal="Perform a consequential action",
            payload={
                "operation": "custom_operation",
                "requires_approval": True,
            },
            task_id="custom-task-1",
        )

        result = await self.router.execute(request, self.context)

        self.assertEqual(result.status, ActionStatus.AWAITING_APPROVAL)
        self.assertEqual(self.handler.calls, 0)

    async def test_refund_requires_approval(self):
        request = ActionRequest(
            domain=ActionDomain.SHOPPING,
            goal="Refund an order",
            payload={"operation": "refund"},
            task_id="refund-task-1",
        )

        result = await self.router.execute(request, self.context)

        self.assertEqual(result.status, ActionStatus.AWAITING_APPROVAL)
        self.assertEqual(self.handler.calls, 0)

    async def test_transfer_requires_approval(self):
        request = ActionRequest(
            domain=ActionDomain.SHOPPING,
            goal="Transfer funds",
            payload={"operation": "transfer"},
            task_id="transfer-task-1",
        )

        result = await self.router.execute(request, self.context)

        self.assertEqual(result.status, ActionStatus.AWAITING_APPROVAL)
        self.assertEqual(self.handler.calls, 0)

    async def test_approval_does_not_authorize_different_task(self):
        request = ActionRequest(
            domain=ActionDomain.SHOPPING,
            goal="Complete checkout",
            payload={"operation": "checkout"},
            task_id="checkout-task-3",
        )
        self.context.approved_actions.add("checkout-task-OTHER")

        result = await self.router.execute(request, self.context)

        self.assertEqual(result.status, ActionStatus.AWAITING_APPROVAL)
        self.assertEqual(self.handler.calls, 0)


if __name__ == "__main__":
    unittest.main()
