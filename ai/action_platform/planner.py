from .core.action import ActionDomain
from .core.models import ActionRequest
from .exceptions import InvalidActionRequestError


class ActionPlanner:
    """Builds a typed request from an explicitly selected domain and goal."""

    def plan(
        self,
        domain: ActionDomain,
        goal: str,
        payload: dict | None = None,
    ) -> ActionRequest:
        if not isinstance(domain, ActionDomain):
            raise InvalidActionRequestError(
                "Select a supported ActionDomain explicitly."
            )

        return ActionRequest(
            domain=domain,
            goal=goal,
            payload=dict(payload or {}),
        )
