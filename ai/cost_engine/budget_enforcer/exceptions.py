from __future__ import annotations


class BudgetEnforcerError(Exception):
    """Base exception for budget enforcement errors."""


class BudgetNotFoundError(BudgetEnforcerError):
    """Raised when the requested budget does not exist."""


class BudgetExceededError(BudgetEnforcerError):
    """Raised when a request would exceed the budget."""


class InvalidBudgetRequestError(BudgetEnforcerError):
    """Raised when a budget enforcement request is invalid."""


__all__ = [
    "BudgetEnforcerError",
    "BudgetNotFoundError",
    "BudgetExceededError",
    "InvalidBudgetRequestError",
]
