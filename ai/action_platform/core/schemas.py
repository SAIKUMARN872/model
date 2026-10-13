"""Validation rules for ModelNow action requests."""

from .action import ActionDomain
from .models import ActionRequest
from ..exceptions import InvalidActionRequestError


MAX_GOAL_LENGTH = 10_000
MAX_TASK_ID_LENGTH = 200


def validate_request(request: ActionRequest) -> None:
    """Validate an action request before routing or execution."""
    if not isinstance(request, ActionRequest):
        raise InvalidActionRequestError(
            "request must be an ActionRequest."
        )

    if not isinstance(request.domain, ActionDomain):
        raise InvalidActionRequestError("Unsupported action domain.")

    if not isinstance(request.goal, str) or not request.goal.strip():
        raise InvalidActionRequestError("Task goal must not be empty.")

    if len(request.goal) > MAX_GOAL_LENGTH:
        raise InvalidActionRequestError("Task goal is too long.")

    if not isinstance(request.task_id, str):
        raise InvalidActionRequestError("task_id must be a string.")

    if len(request.task_id) > MAX_TASK_ID_LENGTH:
        raise InvalidActionRequestError("task_id is too long.")

    if not isinstance(request.payload, dict):
        raise InvalidActionRequestError(
            "payload must be a dictionary."
        )

    if not isinstance(request.metadata, dict):
        raise InvalidActionRequestError(
            "metadata must be a dictionary."
        )

    if not all(isinstance(key, str) for key in request.metadata):
        raise InvalidActionRequestError(
            "metadata keys must be strings."
        )
