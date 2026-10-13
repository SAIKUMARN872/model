from ..constants import ExecutionStatus
from .workflow import (
    WorkflowDefinition,
    WorkflowResult,
    WorkflowStepResult,
    summarize_workflow,
)


class WorkflowCoordinator:
    """Runs workflow steps sequentially through the agent dispatcher."""

    def __init__(self, dispatcher):
        self.dispatcher = dispatcher

    def run(self, workflow):
        if not isinstance(workflow, WorkflowDefinition):
            raise TypeError("workflow must be a WorkflowDefinition")

        results = []

        for step in workflow.steps:
            try:
                result = self.dispatcher.dispatch(step.request)
                step_result = WorkflowStepResult(
                    step_name=step.name,
                    request_id=result.request_id,
                    agent_id=result.agent_id,
                    status=result.status,
                    output=result.output,
                    error=result.error or "",
                )
            except Exception as exc:
                step_result = WorkflowStepResult(
                    step_name=step.name,
                    request_id=step.request.request_id,
                    agent_id=step.request.agent_id,
                    status=ExecutionStatus.ERROR,
                    error=f"{type(exc).__name__}: {exc}",
                )

            results.append(step_result)

            if (
                step_result.status == ExecutionStatus.ERROR
                and workflow.stop_on_error
            ):
                break

        return summarize_workflow(workflow.workflow_id, results)
