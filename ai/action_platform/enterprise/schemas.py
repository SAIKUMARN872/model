"""Validation for ModelNow enterprise actions."""

from ..exceptions import InvalidActionRequestError
from .action import EnterpriseAction, EnterpriseActionType

MAX_OPERATION_LENGTH = 200
MAX_ACTION_ID_LENGTH = 200
MAX_PAYLOAD_ITEMS = 500


def validate_enterprise_action(action: EnterpriseAction) -> None:
    """Validate an enterprise action before dispatch."""
    if not isinstance(action, EnterpriseAction):
        raise InvalidActionRequestError(
            "action must be an EnterpriseAction."
        )

    if not isinstance(action.action_type, EnterpriseActionType):
        raise InvalidActionRequestError(
            "Unsupported enterprise action type."
        )

    if (
        not isinstance(action.operation, str)
        or not action.operation.strip()
    ):
        raise InvalidActionRequestError(
            "Enterprise operation must not be empty."
        )

    if len(action.operation) > MAX_OPERATION_LENGTH:
        raise InvalidActionRequestError(
            "Enterprise operation is too long."
        )

    if not isinstance(action.action_id, str):
        raise InvalidActionRequestError(
            "action_id must be a string."
        )

    if len(action.action_id) > MAX_ACTION_ID_LENGTH:
        raise InvalidActionRequestError(
            "action_id is too long."
        )

    if not isinstance(action.payload, dict):
        raise InvalidActionRequestError(
            "Enterprise payload must be a dictionary."
        )

    if len(action.payload) > MAX_PAYLOAD_ITEMS:
        raise InvalidActionRequestError(
            "Enterprise payload contains too many top-level items."
        )

    if not isinstance(action.requires_approval, bool):
        raise InvalidActionRequestError(
            "requires_approval must be a boolean."
        )

    if not isinstance(action.metadata, dict):
        raise InvalidActionRequestError(
            "Enterprise metadata must be a dictionary."
        )

    if not all(isinstance(key, str) for key in action.metadata):
        raise InvalidActionRequestError(
            "Enterprise metadata keys must be strings."
        )
