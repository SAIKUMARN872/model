from __future__ import annotations


class ChargebackError(Exception):
    """Base exception for chargeback operations."""


class InvalidChargebackError(ChargebackError):
    """Raised when chargeback data is invalid."""


class ChargebackNotFoundError(ChargebackError):
    """Raised when a chargeback entry cannot be found."""


class InvalidAllocationError(ChargebackError):
    """Raised when cost allocation is invalid."""


__all__ = [
    "ChargebackError",
    "InvalidChargebackError",
    "ChargebackNotFoundError",
    "InvalidAllocationError",
]
