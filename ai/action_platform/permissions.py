from .core.context import ActionContext
from .core.models import ActionRequest
from .exceptions import ActionPermissionError


def require_domain_permission(
    request: ActionRequest,
    context: ActionContext | None,
) -> None:
    """Require a trusted execution context before performing domain actions."""
    if context is None or not context.user_id:
        raise ActionPermissionError(
            "A trusted user context is required to execute actions."
        )

    required = f"action:{request.domain.value}"
    if not context.has_permission(required):
        raise ActionPermissionError(
            f"Missing required permission: {required}"
        )
