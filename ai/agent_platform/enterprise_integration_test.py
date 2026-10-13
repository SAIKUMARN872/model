import asyncio
import json
import unittest

from ai.agents.constants import AgentStatus
from ai.agents.models import AgentContext, AgentRequest
from ai.agents.enterprise.audit import InMemoryEnterpriseAuditLog
from ai.agents.enterprise.constants import EnterpriseDomain, EnterpriseTaskStatus
from ai.agents.enterprise.integration import create_enterprise_platform

from ai.agent_platform.constants import AgentState, ExecutionStatus
from ai.agent_platform.engine import AgentPlatformEngine
from ai.agent_platform.manager.manager import AgentManager
from ai.agent_platform.models import AgentExecutionRequest, AgentMetadata
from ai.agent_platform.orchestrator.orchestrator import AgentOrchestrator


class EnterprisePlatformAdapter:
    """Test bridge from the synchronous platform to the async enterprise engine."""

    def __init__(self, enterprise_platform):
        self.enterprise_platform = enterprise_platform

    def execute(self, value):
        """Satisfy the platform registry interface."""
        if isinstance(value, str):
            raise ValueError(
                "Enterprise CRM adapter requires an AgentExecutionRequest"
            )
        return self.execute_request(value)

    def execute_request(self, platform_request):
        context = platform_request.context or {}
        task_id = context.get("task_id") or platform_request.request_id
        payload = context.get("payload", {})
        user_id = context.get("user_id", "platform-integration-test")
        permissions = context.get("permissions", ())

        request = AgentRequest(
            input=platform_request.input,
            task_id=task_id,
            metadata={"payload": payload},
            context=AgentContext(
                user_id=user_id,
                permissions=tuple(permissions),
            ),
        )

        response = asyncio.run(
            self.enterprise_platform.execute(EnterpriseDomain.CRM, request)
        )

        if response.status != AgentStatus.COMPLETED:
            raise RuntimeError(
                response.error or
                f"Enterprise CRM execution failed: {response.status}"
            )

        return response.output


class EnterprisePlatformIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.audit_log = InMemoryEnterpriseAuditLog()
        self.enterprise_platform = create_enterprise_platform(
            audit_log=self.audit_log
        )

        self.agent_id = "platform-enterprise-crm"
        self.engine = AgentPlatformEngine()
        self.manager = AgentManager(self.engine)

        self.adapter = EnterprisePlatformAdapter(self.enterprise_platform)
        self.metadata = AgentMetadata(
            agent_id=self.agent_id,
            name="Enterprise CRM Integration",
            description="Routes platform requests through the enterprise CRM engine",
            capabilities=("crm", "create_customer"),
            tags=("integration-test", "enterprise"),
        )

        self.manager.register_agent(self.metadata, self.adapter)
        self.manager.start_agent(self.agent_id)
        self.orchestrator = AgentOrchestrator(self.manager)

    def test_authorized_customer_creation_through_orchestrator(self):
        task_id = "platform-crm-customer-001"

        result = self.orchestrator.dispatch(
            AgentExecutionRequest(
                agent_id=self.agent_id,
                input="create_customer",
                context={
                    "task_id": task_id,
                    "user_id": "platform-integration-test",
                    "permissions": ("enterprise:crm:create_customer",),
                    "payload": {
                        "workflow_id": "platform-integration-workflow",
                        "name": "Platform Integration Customer",
                        "city": "Hyderabad",
                        "vehicle_interest": "Range Rover Sport",
                        "budget": 15000000,
                        "timeline_days": 30,
                        "phone": "9000000093",
                    },
                },
            )
        )

        self.assertEqual(result.status, ExecutionStatus.SUCCESS, result.error)
        self.assertIsNotNone(result.output)

        output = json.loads(result.output)
        customer = output["result"]

        self.assertEqual(output["domain"], "crm")
        self.assertEqual(output["action"], "create_customer")
        self.assertEqual(customer["name"], "Platform Integration Customer")
        self.assertEqual(customer["city"], "Hyderabad")
        self.assertEqual(customer["vehicle_interest"], "Range Rover Sport")
        self.assertTrue(customer["id"])

        events = self.audit_log.list_events(task_id=task_id)
        self.assertEqual(
            [event.status for event in events],
            [
                EnterpriseTaskStatus.PENDING,
                EnterpriseTaskStatus.RUNNING,
                EnterpriseTaskStatus.COMPLETED,
            ],
        )

        self.assertEqual(
            self.manager.get_state(self.agent_id),
            AgentState.READY,
        )

    def test_unauthorized_customer_creation_is_rejected_and_audited(self):
        task_id = "platform-crm-denied-001"

        result = self.orchestrator.dispatch(
            AgentExecutionRequest(
                agent_id=self.agent_id,
                input="create_customer",
                context={
                    "task_id": task_id,
                    "user_id": "unauthorized-platform-user",
                    "permissions": ("enterprise:crm:read",),
                    "payload": {
                        "workflow_id": "platform-denied-workflow",
                        "name": "Must Not Be Created",
                        "phone": "9000000094",
                    },
                },
            )
        )

        self.assertEqual(result.status, ExecutionStatus.ERROR)
        self.assertIsNotNone(result.error)
        self.assertIn("EnterprisePermissionError", result.error)

        events = self.audit_log.list_events(task_id=task_id)
        self.assertEqual(
            [event.status for event in events],
            [
                EnterpriseTaskStatus.PENDING,
                EnterpriseTaskStatus.FAILED,
            ],
        )

        self.assertEqual(
            self.manager.get_state(self.agent_id),
            AgentState.FAILED,
        )


if __name__ == "__main__":
    unittest.main()

