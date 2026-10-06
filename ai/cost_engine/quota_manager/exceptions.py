from __future__ import annotations


class QuotaManagerError(Exception):
    """Base exception for quota management errors."""


class QuotaNotFoundError(QuotaManagerError):
    """Raised when a quota does not exist."""


class QuotaExceededError(QuotaManagerError):
    """Raised when requested usage exceeds a quota."""


class InvalidQuotaRequestError(QuotaManagerError):
    """Raised when a quota request is invalid."""


__all__ = [
    "QuotaManagerError",
    "QuotaNotFoundError",
    "QuotaExceededError",
    "InvalidQuotaRequestError",
]
