class EnterpriseError(Exception):
    """Base exception for enterprise-agent operations."""


class EnterpriseValidationError(EnterpriseError):
    """Invalid enterprise request or configuration."""


class EnterpriseAgentNotFoundError(EnterpriseError):
    """Requested enterprise agent is not registered."""


class EnterpriseRoutingError(EnterpriseError):
    """Enterprise request cannot be routed."""


class EnterprisePermissionError(EnterpriseError):
    """Operation is not permitted by enterprise policy."""

class EnterpriseAuditError(EnterpriseError):
    """Audit persistence failed; the task outcome may require reconciliation."""
