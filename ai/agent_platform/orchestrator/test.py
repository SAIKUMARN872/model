import unittest

from ai.agent_platform.constants import AgentState, ExecutionStatus
from ai.agent_platform.engine import AgentPlatformEngine
from ai.agent_platform.exceptions import AgentExecutionError
from ai.agent_platform.manager import AgentManager
from ai.agent_platform.models import AgentExecutionRequest, AgentMetadata
from ai.agent_platform.orchestrator import (
    AgentOrchestrator,
    WorkflowDefinition,
    WorkflowStep,
)
from ai.agent_platform.orchestrator.utils import (
    workflow_failed,
    workflow_succeeded,
    workflow_summary,
)


class EchoAgent:
    def execute(self, value):
        return {"echo": value}


class FailingAgent:
    def execute(self, value):
        raise RuntimeError("simulated workflow failure")


class OrchestratorTests(unittest.TestCase):
    def setUp(self):
        self.engine = AgentPlatformEngine()
        self.manager = AgentManager(self.engine)
        self.orchestrator = AgentOrchestrator(self.manager)

        self.manager.register_agent(
            AgentMetadata(agent_id="orch-echo", name="Echo"),
            EchoAgent(),
        )
        self.manager.start_agent("orch-echo")

        self.manager.register_agent(
            AgentMetadata(agent_id="orch-fail", name="Failing"),
            FailingAgent(),
        )
        self.manager.start_agent("orch-fail")

    def request(self, agent_id, value):
        return AgentExecutionRequest(agent_id=agent_id, input=value)

    def test_dispatch_single_request(self):
        result = self.orchestrator.dispatch(
            self.request("orch-echo", "hello")
        )
        self.assertEqual(result.status, ExecutionStatus.SUCCESS)
        self.assertEqual(result.output, {"echo": "hello"})

    def test_run_two_step_workflow(self):
        result = self.orchestrator.run_requests([
            self.request("orch-echo", "first"),
            self.request("orch-echo", "second"),
        ], workflow_id="two-step")

        self.assertEqual(result.workflow_id, "two-step")
        self.assertEqual(result.status, ExecutionStatus.SUCCESS)
        self.assertEqual(result.completed_steps, 2)
        self.assertEqual(result.failed_steps, 0)
        self.assertEqual(len(result.step_results), 2)

    def test_workflow_records_step_outputs(self):
        result = self.orchestrator.run_requests([
            self.request("orch-echo", "alpha"),
            self.request("orch-echo", "beta"),
        ])
        self.assertEqual(
            [step.output for step in result.step_results],
            [{"echo": "alpha"}, {"echo": "beta"}],
        )

    def test_workflow_stops_after_failure_by_default(self):
        result = self.orchestrator.run_requests([
            self.request("orch-fail", "break"),
            self.request("orch-echo", "should-not-run"),
        ])

        self.assertEqual(result.status, ExecutionStatus.ERROR)
        self.assertEqual(result.failed_steps, 1)
        self.assertEqual(len(result.step_results), 1)

    def test_workflow_continues_when_stop_on_error_is_false(self):
        result = self.orchestrator.run_requests(
            [
                self.request("orch-fail", "break"),
                self.request("orch-echo", "continue"),
            ],
            stop_on_error=False,
        )

        self.assertEqual(result.status, ExecutionStatus.ERROR)
        self.assertEqual(result.failed_steps, 1)
        self.assertEqual(len(result.step_results), 2)
        self.assertEqual(
            result.step_results[1].output, {"echo": "continue"}
        )

    def test_unknown_agent_is_recorded_as_workflow_failure(self):
        result = self.orchestrator.run_requests([
            self.request("missing-agent", "test"),
        ])

        self.assertEqual(result.status, ExecutionStatus.ERROR)
        self.assertEqual(result.failed_steps, 1)
        self.assertIn("AgentNotFoundError", result.step_results[0].error)

    def test_empty_workflow_is_rejected(self):
        with self.assertRaises(ValueError):
            WorkflowDefinition(steps=())

    def test_invalid_workflow_step_is_rejected(self):
        with self.assertRaises(TypeError):
            WorkflowDefinition(steps=("not-a-step",))

    def test_workflow_helpers(self):
        success = self.orchestrator.run_requests([
            self.request("orch-echo", "ok"),
        ])
        failure = self.orchestrator.run_requests([
            self.request("orch-fail", "fail"),
        ])

        self.assertTrue(workflow_succeeded(success))
        self.assertFalse(workflow_failed(success))
        self.assertTrue(workflow_failed(failure))
        self.assertEqual(workflow_summary(success)["completed_steps"], 1)

    def test_stopped_agent_failure_is_recorded(self):
        self.manager.stop_agent("orch-echo")
        result = self.orchestrator.run_requests([
            self.request("orch-echo", "not-ready"),
        ])
        self.assertEqual(result.status, ExecutionStatus.ERROR)
        self.assertIn("AgentExecutionError", result.step_results[0].error)

    def test_explicit_workflow_definition(self):
        workflow = WorkflowDefinition(
            workflow_id="explicit",
            steps=(
                WorkflowStep(
                    request=self.request("orch-echo", "one"),
                    name="first",
                ),
                WorkflowStep(
                    request=self.request("orch-echo", "two"),
                    name="second",
                ),
            ),
        )
        result = self.orchestrator.run_workflow(workflow)
        self.assertEqual(result.workflow_id, "explicit")
        self.assertEqual(
            [step.step_name for step in result.step_results],
            ["first", "second"],
        )


if __name__ == "__main__":
    unittest.main()
