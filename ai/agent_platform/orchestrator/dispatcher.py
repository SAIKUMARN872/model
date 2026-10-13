from ..models import AgentExecutionRequest


class AgentDispatcher:
    """Dispatches validated agent requests through the manager."""

    def __init__(self, manager):
        self.manager = manager

    def dispatch(self, request):
        if not isinstance(request, AgentExecutionRequest):
            raise TypeError("request must be an AgentExecutionRequest")
        return self.manager.execute(request)
