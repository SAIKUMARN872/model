from __future__ import annotations

import unittest

from .constants import AgentState, ExecutionStatus
from .engine import AgentPlatformEngine
from .exceptions import AgentExecutionError, AgentNotFoundError
from .models import AgentExecutionRequest, AgentMetadata


class EchoAgent:
    def execute(self, request):
        return {"echo": request}


class FailingAgent:
    def execute(self, request):
        raise RuntimeError("intentional test failure")


class RequestAwareAgent:
    def execute(self, request):
        return request

    def execute_request(self, request):
        return {
            "input": request.input,
            "context": request.context,
            "request_id": request.request_id,
        }


class AgentPlatformEngineTests(unittest.TestCase):
    def setUp(self):
        self.engine = AgentPlatformEngine()
        self.engine.register_agent(
            AgentMetadata(
                agent_id="echo",
                name="Echo Agent",
                capabilities=("echo",),
            ),
            EchoAgent(),
        )

    def test_successful_execution(self):
        result = self.engine.execute(
            AgentExecutionRequest(agent_id="echo", input="hello")
        )
        self.assertEqual(result.status, ExecutionStatus.SUCCESS)
        self.assertEqual(result.output, {"echo": "hello"})
        self.assertIsNone(result.error)

    def test_runtime_counts_successful_execution(self):
        self.engine.execute(
            AgentExecutionRequest(agent_id="echo", input="hello")
        )
        info = self.engine.get_runtime_info("echo")
        self.assertEqual(info.executions, 1)
        self.assertEqual(info.failures, 0)
        self.assertEqual(info.state, AgentState.READY)

    def test_unknown_agent_raises(self):
        with self.assertRaises(AgentNotFoundError):
            self.engine.execute(
                AgentExecutionRequest(agent_id="missing", input="hello")
            )

    def test_disabled_agent_rejected(self):
        self.engine.registry.set_enabled("echo", False)
        with self.assertRaises(AgentExecutionError):
            self.engine.execute(
                AgentExecutionRequest(agent_id="echo", input="hello")
            )

    def test_agent_failure_returns_error_result(self):
        self.engine.register_agent(
            AgentMetadata(agent_id="failing", name="Failing Agent"),
            FailingAgent(),
        )
        result = self.engine.execute(
            AgentExecutionRequest(agent_id="failing", input="hello")
        )
        self.assertEqual(result.status, ExecutionStatus.ERROR)
        self.assertIn("intentional test failure", result.error)

    def test_failure_is_recorded_in_runtime(self):
        self.engine.register_agent(
            AgentMetadata(agent_id="failing", name="Failing Agent"),
            FailingAgent(),
        )
        self.engine.execute(
            AgentExecutionRequest(agent_id="failing", input="hello")
        )
        info = self.engine.get_runtime_info("failing")
        self.assertEqual(info.failures, 1)
        self.assertEqual(info.state, AgentState.FAILED)
        self.assertIn("RuntimeError", info.last_error)

    def test_context_aware_agent_receives_full_request(self):
        self.engine.register_agent(
            AgentMetadata(agent_id="aware", name="Request Aware Agent"),
            RequestAwareAgent(),
        )
        result = self.engine.execute(
            AgentExecutionRequest(
                agent_id="aware",
                input={"message": "hello"},
                context={"tenant": "test"},
                request_id="request-123",
            )
        )
        self.assertEqual(result.status, ExecutionStatus.SUCCESS)
        self.assertEqual(result.output["context"], {"tenant": "test"})
        self.assertEqual(result.output["request_id"], "request-123")

    def test_create_and_register_uses_factory(self):
        self.engine.register_factory_builder("factory-echo", EchoAgent)
        metadata = AgentMetadata(
            agent_id="factory-agent",
            name="Factory Agent",
            extra={"factory_key": "factory-echo"},
        )
        agent = self.engine.create_and_register(metadata)
        self.assertIsInstance(agent, EchoAgent)
        self.assertTrue(self.engine.registry.contains("factory-agent"))

    def test_list_agents(self):
        agents = self.engine.list_agents()
        self.assertEqual([item.agent_id for item in agents], ["echo"])

    def test_request_id_is_preserved(self):
        result = self.engine.execute(
            AgentExecutionRequest(
                agent_id="echo",
                input="hello",
                request_id="stable-id",
            )
        )
        self.assertEqual(result.request_id, "stable-id")

    def test_execution_duration_is_non_negative(self):
        result = self.engine.execute(
            AgentExecutionRequest(agent_id="echo", input="hello")
        )
        self.assertGreaterEqual(result.duration_seconds, 0.0)


if __name__ == "__main__":
    unittest.main()
