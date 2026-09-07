"""
Quota Manager package for the ModelNow Cost Engine.
"""

from .manager import (
    QuotaCheckRequest,
    QuotaCheckResult,
    QuotaManager,
    QuotaStatus,
)

from .policies import (
    QuotaAction,
    QuotaDecision,
    QuotaEvaluation,
    QuotaPolicy,
    QuotaPolicyEngine,
)

from .quotas import (
    QuotaLimit,
    QuotaPeriod,
    QuotaStore,
    QuotaUsage,
)

from .validator import (
    QuotaValidationError,
    QuotaValidationResult,
    QuotaValidator,
)


__all__ = [
    # Manager
    "QuotaManager",
    "QuotaCheckRequest",
    "QuotaCheckResult",
    "QuotaStatus",

    # Policies
    "QuotaAction",
    "QuotaDecision",
    "QuotaEvaluation",
    "QuotaPolicy",
    "QuotaPolicyEngine",

    # Quotas
    "QuotaLimit",
    "QuotaPeriod",
    "QuotaStore",
    "QuotaUsage",

    # Validator
    "QuotaValidationError",
    "QuotaValidationResult",
    "QuotaValidator",
]


__version__ = "1.0.0"