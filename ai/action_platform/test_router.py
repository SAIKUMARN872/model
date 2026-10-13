import unittest

from ai.action_platform.core.action import ActionDomain, ActionStatus
from ai.action_platform.core.context import ActionContext
from ai.action_platform.core.models import ActionRequest
from ai.action_platform.exceptions import (
    ActionHandlerNotFoundError,
    ActionPermissionError,
)
from ai.action_platform.registry import ActionRegistry
from ai.action_platform.router import ActionRouter


class FakeHandler:
    async def execute(self, request, context=None):
        return {"message": "handler executed", "goal": request.goal}


class ActionRouterTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.registry = ActionRegistry()
        self.registry.register(ActionDomain.SHOPPING, FakeHandler())
        self.router = ActionRouter(self.registry)
        self.context = ActionContext(
            user_id="test-user",
            permissions={"action:shopping"},
        )
        self.request = ActionRequest(
            domain=ActionDomain.SHOPPING,
            goal="Find a laptop",
        )

    async def test_routes_to_registered_handler(self):
        result = await self.router.execute(self.request, self.context)
        self.assertEqual(result.status, ActionStatus.COMPLETED)
        self.assertEqual(result.data["message"], "handler executed")
        self.assertTrue(result.task_id)

    async def test_missing_permission_is_rejected(self):
        context = ActionContext(user_id="test-user")
        with self.assertRaises(ActionPermissionError):
            await self.router.execute(self.request, context)

    async def test_missing_user_context_is_rejected(self):
        with self.assertRaises(ActionPermissionError):
            await self.router.execute(self.request)

    async def test_unregistered_domain_is_rejected(self):
        request = ActionRequest(
            domain=ActionDomain.FOOD,
            goal="Find dinner",
        )
        with self.assertRaises(ActionHandlerNotFoundError):
            await self.router.execute(
                request,
                ActionContext(
                    user_id="test-user",
                    permissions={"action:food"},
                ),
            )

    async def test_registry_rejects_duplicate_registration(self):
        with self.assertRaises(ValueError):
            self.registry.register(ActionDomain.SHOPPING, FakeHandler())


if __name__ == "__main__":
    unittest.main()
