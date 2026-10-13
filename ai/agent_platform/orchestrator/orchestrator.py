from .coordinator import WorkflowCoordinator
from .dispatcher import AgentDispatcher
from .workflow import WorkflowDefinition, WorkflowResult, build_workflow


class AgentOrchestrator:
    """Public orchestration API for individual tasks and workflows."""

    def __init__(self, manager):
        self.manager = manager
        self.dispatcher = AgentDispatcher(manager)
        self.coordinator = WorkflowCoordinator(self.dispatcher)

    def dispatch(self, request):
        return self.dispatcher.dispatch(request)

    def run_workflow(self, workflow):
        return self.coordinator.run(workflow)

    def run_requests(self, requests, workflow_id="", stop_on_error=True):
        workflow = build_workflow(
            requests,
            workflow_id=workflow_id,
            stop_on_error=stop_on_error,
        )
        return self.run_workflow(workflow)


__all__ = [
    "AgentOrchestrator",
    "AgentDispatcher",
    "WorkflowCoordinator",
    "WorkflowDefinition",
    "WorkflowResult",
    "build_workflow",
]
