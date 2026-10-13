from dataclasses import dataclass
from uuid import uuid4

from ..constants import ExecutionStatus
from ..models import AgentExecutionRequest


@dataclass(frozen=True)
class WorkflowStep:
    request: AgentExecutionRequest
    name: str = ""

    def __post_init__(self):
        if not isinstance(self.request, AgentExecutionRequest):
            raise TypeError("WorkflowStep.request must be an AgentExecutionRequest")


@dataclass(frozen=True)
class WorkflowDefinition:
    steps: tuple
    workflow_id: str = ""
    stop_on_error: bool = True

    def __post_init__(self):
        object.__setattr__(self, "steps", tuple(self.steps))
        if not self.workflow_id:
            object.__setattr__(self, "workflow_id", str(uuid4()))
        if not self.steps:
            raise ValueError("A workflow must contain at least one step")
        if not all(isinstance(step, WorkflowStep) for step in self.steps):
            raise TypeError("Every workflow step must be a WorkflowStep")


@dataclass(frozen=True)
class WorkflowStepResult:
    step_name: str
    request_id: str
    agent_id: str
    status: ExecutionStatus
    output: object = None
    error: str = ""


@dataclass(frozen=True)
class WorkflowResult:
    workflow_id: str
    status: ExecutionStatus
    step_results: tuple
    completed_steps: int
    failed_steps: int


def build_workflow(requests, workflow_id="", stop_on_error=True):
    steps = tuple(
        WorkflowStep(request=request, name=f"step-{index + 1}")
        for index, request in enumerate(requests)
    )
    return WorkflowDefinition(
        steps=steps,
        workflow_id=workflow_id,
        stop_on_error=stop_on_error,
    )


def summarize_workflow(workflow_id, results):
    results = tuple(results)
    failed = sum(item.status == ExecutionStatus.ERROR for item in results)
    status = ExecutionStatus.ERROR if failed else ExecutionStatus.SUCCESS
    return WorkflowResult(
        workflow_id=workflow_id,
        status=status,
        step_results=results,
        completed_steps=len(results) - failed,
        failed_steps=failed,
    )
