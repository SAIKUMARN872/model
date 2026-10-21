import unittest

from ai.agent_platform.constants import AgentState, ExecutionStatus
from ai.agent_platform.engine import AgentPlatformEngine
from ai.agent_platform.exceptions import (
    AgentExecutionError,
    AgentNotFoundError,
)
from ai.agent_platform.models import AgentExecutionRequest, AgentMetadata
from ai.agent_platform.manager import AgentLifecycle, AgentManager, AgentScheduler


class EchoAgent:
    def execute(self, value):
        return {"echo": value}


class FailingAgent:
    def execute(self, value):
        raise RuntimeError("simulated failure")


class AgentManagerTests(unittest.TestCase):
    def setUp(self):
        self.engine = AgentPlatformEngine()
        self.manager = AgentManager(self.engine)
        self.metadata = AgentMetadata(
            agent_id="manager-echo",
            name="Manager Echo",
            capabilities=("echo",),
        )
        self.manager.register_agent(self.metadata, EchoAgent())

    def test_registration_starts_in_created_state(self):
        self.assertEqual(
            self.manager.get_state("manager-echo"), AgentState.CREATED
        )

    def test_start_agent(self):
        state = self.manager.start_agent("manager-echo")
        self.assertEqual(state, AgentState.READY)

    def test_execute_requires_ready_state(self):
        request = AgentExecutionRequest(
            agent_id="manager-echo", input="hello"
        )
        with self.assertRaises(AgentExecutionError):
            self.manager.execute(request)

    def test_successful_execution_returns_to_ready(self):
        self.manager.start_agent("manager-echo")
        request = AgentExecutionRequest(
            agent_id="manager-echo", input="hello"
        )
        result = self.manager.execute(request)

        self.assertEqual(result.status, ExecutionStatus.SUCCESS)
        self.assertEqual(result.output, {"echo": "hello"})
        self.assertEqual(
            self.manager.get_state("manager-echo"), AgentState.READY
        )

    def test_stop_agent(self):
        self.manager.start_agent("manager-echo")
        self.assertEqual(
            self.manager.stop_agent("manager-echo"), AgentState.STOPPED
        )

    def test_stopped_agent_cannot_execute(self):
        self.manager.start_agent("manager-echo")
        self.manager.stop_agent("manager-echo")
        request = AgentExecutionRequest(
            agent_id="manager-echo", input="hello"
        )
        with self.assertRaises(AgentExecutionError):
            self.manager.execute(request)

    def test_failed_execution_marks_lifecycle_failed(self):
        metadata = AgentMetadata(
            agent_id="manager-failing", name="Failing Agent"
        )
        self.manager.register_agent(metadata, FailingAgent())
        self.manager.start_agent("manager-failing")

        result = self.manager.execute(
            AgentExecutionRequest(
                agent_id="manager-failing", input="test"
            )
        )
        self.assertEqual(result.status, ExecutionStatus.ERROR)
        self.assertEqual(
            self.manager.get_state("manager-failing"), AgentState.FAILED
        )

    def test_failed_agent_can_be_restarted(self):
        metadata = AgentMetadata(
            agent_id="manager-failing", name="Failing Agent"
        )
        self.manager.register_agent(metadata, FailingAgent())
        self.manager.start_agent("manager-failing")
        self.manager.execute(
            AgentExecutionRequest(
                agent_id="manager-failing", input="test"
            )
        )
        self.assertEqual(
            self.manager.start_agent("manager-failing"), AgentState.READY
        )

    def test_unknown_agent_raises(self):
        with self.assertRaises(AgentNotFoundError):
            self.manager.get_state("not-registered")

    def test_unregister_agent(self):
        self.assertIsNotNone(
            self.manager.unregister_agent("manager-echo")
        )
        with self.assertRaises(AgentNotFoundError):
            self.manager.get_state("manager-echo")

    def test_lifecycle_rejects_stopping_running_agent(self):
        lifecycle = AgentLifecycle()
        lifecycle.register("running-agent", AgentState.CREATED)
        lifecycle.start("running-agent")
        lifecycle.begin_execution("running-agent")

        with self.assertRaises(AgentExecutionError):
            lifecycle.stop("running-agent")

    def test_scheduler_executes_request(self):
        self.manager.start_agent("manager-echo")
        request = AgentExecutionRequest(
            agent_id="manager-echo", input="scheduled"
        )

        with AgentScheduler(self.manager, max_workers=2) as scheduler:
            future = scheduler.submit(request)
            result = future.result(timeout=5)

        self.assertEqual(result.status, ExecutionStatus.SUCCESS)
        self.assertEqual(result.output, {"echo": "scheduled"})

    def test_scheduler_rejects_submit_after_shutdown(self):
        scheduler = AgentScheduler(self.manager)
        scheduler.shutdown()

        with self.assertRaises(AgentExecutionError):
            scheduler.submit(
                AgentExecutionRequest(
                    agent_id="manager-echo", input="late"
                )
            )

    def test_scheduler_rejects_invalid_worker_count(self):
        with self.assertRaises(ValueError):
            AgentScheduler(self.manager, max_workers=0)


if __name__ == "__main__":
    unittest.main()
