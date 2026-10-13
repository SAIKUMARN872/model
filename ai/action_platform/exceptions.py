class ActionPlatformError(Exception):
    """Base Action Platform exception."""


class InvalidActionRequestError(ActionPlatformError):
    """An action request failed validation."""


class ActionHandlerNotFoundError(ActionPlatformError):
    """No handler is registered for the requested domain."""


class ActionPermissionError(ActionPlatformError):
    """The caller does not have the required permission."""


class ActionApprovalRequiredError(ActionPlatformError):
    """An action requires explicit approval."""


class ActionExecutionError(ActionPlatformError):
    """A domain handler failed to execute an action."""
