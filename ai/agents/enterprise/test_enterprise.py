import unittest

from ai.agents.enterprise import (
    EnterpriseAgent,
    EnterpriseAgentRegistry,
    EnterpriseDomain,
    EnterpriseRouter,
    EnterpriseTask,
)
from ai.agents.enterprise.exceptions import (
    EnterpriseAgentNotFoundError,
    EnterpriseRoutingError,
    EnterpriseValidationError,
)


class ExampleCRM(EnterpriseAgent):
    async def run_task(self, task):
        return f"CRM handled: {task.action}"


class ExampleHR(EnterpriseAgent):
    async def run_task(self, task):
        return f"HR handled: {task.action}"


class EnterpriseFrameworkTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.registry = EnterpriseAgentRegistry()
        self.crm = ExampleCRM("crm-1", EnterpriseDomain.CRM)
        self.hr = ExampleHR("hr-1", EnterpriseDomain.HR)
        self.registry.register(self.crm)
        self.registry.register(self.hr)
        self.router = EnterpriseRouter(self.registry)

    async def test_routes_crm_task(self):
        task = EnterpriseTask("t-1", EnterpriseDomain.CRM, "qualify lead")
        self.assertEqual(await self.router.route(task), "CRM handled: qualify lead")

    async def test_routes_hr_task(self):
        task = EnterpriseTask("t-2", EnterpriseDomain.HR, "review leave")
        self.assertEqual(await self.router.route(task), "HR handled: review leave")

    async def test_duplicate_domain_rejected(self):
        with self.assertRaises(EnterpriseValidationError):
            self.registry.register(ExampleCRM("crm-2", EnterpriseDomain.CRM))

    async def test_unknown_domain_agent(self):
        with self.assertRaises(EnterpriseAgentNotFoundError):
            self.registry.get("unknown")

    async def test_task_domain_mismatch(self):
        request = __import__("ai.agents.models", fromlist=["AgentRequest"]).AgentRequest(
            input="test",
            metadata={"enterprise_task": {
                "task_id": "t-3",
                "domain": "hr",
                "action": "review leave",
            }},
        )
        response = await self.crm.run(request)
        self.assertEqual(response.status.value, "failed")

    async def test_missing_route(self):
        task = EnterpriseTask("t-4", EnterpriseDomain.FINANCE, "create budget")
        with self.assertRaises(EnterpriseRoutingError):
            await self.router.route(task)

    async def test_context_route_denies_missing_permission(self):
        from ai.agents.models import AgentContext
        from ai.agents.enterprise.exceptions import EnterprisePermissionError

        task = EnterpriseTask("t-perm-1", EnterpriseDomain.CRM, "qualify_lead")
        context = AgentContext(user_id="user-1", permissions=())

        with self.assertRaises(EnterprisePermissionError):
            await self.router.route(task, context)

    async def test_context_route_accepts_exact_action_permission(self):
        from ai.agents.models import AgentContext

        task = EnterpriseTask("t-perm-2", EnterpriseDomain.CRM, "qualify_lead")
        context = AgentContext(
            user_id="user-1",
            permissions=("enterprise:crm:qualify_lead",),
        )

        result = await self.router.route(task, context)
        self.assertEqual(result, "CRM handled: qualify_lead")

    async def test_context_route_accepts_domain_wildcard_permission(self):
        from ai.agents.models import AgentContext

        task = EnterpriseTask("t-perm-3", EnterpriseDomain.HR, "review_leave")
        context = AgentContext(
            user_id="user-2",
            permissions=("enterprise:hr:*",),
        )

        result = await self.router.route(task, context)
        self.assertEqual(result, "HR handled: review_leave")

    async def test_context_route_normalizes_agent_failure(self):
        from ai.agents.models import AgentContext

        class FailingCRM(EnterpriseAgent):
            async def run_task(self, task):
                raise ValueError("simulated CRM failure")

        registry = EnterpriseAgentRegistry()
        registry.register(FailingCRM("crm-failing", EnterpriseDomain.CRM))
        router = EnterpriseRouter(registry)

        task = EnterpriseTask("t-fail-1", EnterpriseDomain.CRM, "qualify_lead")
        context = AgentContext(
            user_id="user-1",
            permissions=("enterprise:crm:qualify_lead",),
        )

        with self.assertRaises(EnterpriseRoutingError) as raised:
            await router.route(task, context)

        self.assertIn("simulated CRM failure", str(raised.exception))

    async def test_audit_records_successful_legacy_route(self):
        from ai.agents.enterprise import (
            EnterpriseTaskStatus,
            InMemoryEnterpriseAuditLog,
        )

        audit = InMemoryEnterpriseAuditLog()
        router = EnterpriseRouter(self.registry, audit)
        task = EnterpriseTask("audit-success-1", EnterpriseDomain.CRM, "qualify lead")

        result = await router.route(task)

        self.assertEqual(result, "CRM handled: qualify lead")
        events = audit.list_events(task.task_id)
        self.assertEqual(
            [event.status for event in events],
            [
                EnterpriseTaskStatus.PENDING,
                EnterpriseTaskStatus.RUNNING,
                EnterpriseTaskStatus.COMPLETED,
            ],
        )
        self.assertTrue(all(event.timestamp.tzinfo is not None for event in events))
        self.assertTrue(all(not hasattr(event, "payload") for event in events))

    async def test_audit_records_permission_denial_without_payload(self):
        from ai.agents.models import AgentContext
        from ai.agents.enterprise import (
            EnterprisePermissionError,
            EnterpriseTaskStatus,
            InMemoryEnterpriseAuditLog,
        )

        audit = InMemoryEnterpriseAuditLog()
        router = EnterpriseRouter(self.registry, audit)
        task = EnterpriseTask(
            "audit-denied-1",
            EnterpriseDomain.CRM,
            "qualify lead",
            payload={"secret": "must-not-be-audited"},
        )
        context = AgentContext(user_id="audit-user", permissions=())

        with self.assertRaises(EnterprisePermissionError):
            await router.route(task, context)

        events = audit.list_events(task.task_id)
        self.assertEqual(
            [event.status for event in events],
            [EnterpriseTaskStatus.PENDING, EnterpriseTaskStatus.FAILED],
        )
        self.assertEqual(events[-1].actor_id, "audit-user")
        self.assertEqual(events[-1].error_type, "EnterprisePermissionError")
        self.assertNotIn(
            "must-not-be-audited",
            repr(events),
        )

    async def test_audit_records_agent_failure(self):
        from ai.agents.models import AgentContext
        from ai.agents.enterprise import (
            EnterpriseTaskStatus,
            InMemoryEnterpriseAuditLog,
        )

        class FailingCRM(EnterpriseAgent):
            async def run_task(self, task):
                raise ValueError("simulated CRM failure")

        registry = EnterpriseAgentRegistry()
        registry.register(FailingCRM("audit-failing-crm", EnterpriseDomain.CRM))
        audit = InMemoryEnterpriseAuditLog()
        router = EnterpriseRouter(registry, audit)
        task = EnterpriseTask(
            "audit-failed-1", EnterpriseDomain.CRM, "qualify_lead"
        )
        context = AgentContext(
            user_id="audit-user",
            permissions=("enterprise:crm:qualify_lead",),
        )

        with self.assertRaises(EnterpriseRoutingError):
            await router.route(task, context)

        events = audit.list_events(task.task_id)
        self.assertEqual(
            [event.status for event in events],
            [
                EnterpriseTaskStatus.PENDING,
                EnterpriseTaskStatus.RUNNING,
                EnterpriseTaskStatus.FAILED,
            ],
        )
        self.assertEqual(events[-1].error_type, "EnterpriseRoutingError")

    async def test_pending_audit_failure_prevents_execution(self):
        from ai.agents.enterprise import EnterpriseAuditError

        class FailingAudit:
            def record(self, event):
                raise OSError("audit storage unavailable")

        class CountingCRM(EnterpriseAgent):
            def __init__(self):
                super().__init__("counting-crm", EnterpriseDomain.CRM)
                self.calls = 0

            async def run_task(self, task):
                self.calls += 1
                return "executed"

        agent = CountingCRM()
        registry = EnterpriseAgentRegistry()
        registry.register(agent)
        router = EnterpriseRouter(registry, FailingAudit())

        task = EnterpriseTask(
            "audit-pending-failure", EnterpriseDomain.CRM, "test_action"
        )

        with self.assertRaises(EnterpriseAuditError):
            await router.route(task)

        self.assertEqual(agent.calls, 0)

    async def test_running_audit_failure_prevents_execution(self):
        from ai.agents.enterprise import EnterpriseAuditError

        class FailingRunningAudit:
            def __init__(self):
                self.statuses = []

            def record(self, event):
                self.statuses.append(event.status)
                if event.status.value == "running":
                    raise OSError("running audit write failed")

        class CountingCRM(EnterpriseAgent):
            def __init__(self):
                super().__init__("counting-running-crm", EnterpriseDomain.CRM)
                self.calls = 0

            async def run_task(self, task):
                self.calls += 1
                return "executed"

        agent = CountingCRM()
        registry = EnterpriseAgentRegistry()
        registry.register(agent)
        audit = FailingRunningAudit()
        router = EnterpriseRouter(registry, audit)

        task = EnterpriseTask(
            "audit-running-failure", EnterpriseDomain.CRM, "test_action"
        )

        with self.assertRaises(EnterpriseAuditError):
            await router.route(task)

        self.assertEqual(agent.calls, 0)
        self.assertEqual(
            [status.value for status in audit.statuses],
            ["pending", "running"],
        )

    async def test_completed_audit_failure_does_not_retry_operation(self):
        from ai.agents.enterprise import EnterpriseAuditError

        class FailingCompletedAudit:
            def record(self, event):
                if event.status.value == "completed":
                    raise OSError("completion audit write failed")

        class CountingCRM(EnterpriseAgent):
            def __init__(self):
                super().__init__("counting-completed-crm", EnterpriseDomain.CRM)
                self.calls = 0

            async def run_task(self, task):
                self.calls += 1
                return "operation succeeded"

        agent = CountingCRM()
        registry = EnterpriseAgentRegistry()
        registry.register(agent)
        router = EnterpriseRouter(registry, FailingCompletedAudit())

        task = EnterpriseTask(
            "audit-completed-failure", EnterpriseDomain.CRM, "test_action"
        )

        with self.assertRaises(EnterpriseAuditError) as raised:
            await router.route(task)

        self.assertEqual(agent.calls, 1)
        self.assertIn("completed", str(raised.exception))

if __name__ == "__main__":
    unittest.main()

