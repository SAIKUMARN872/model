from dataclasses import dataclass
from typing import Optional

class CostEngineError(Exception):
    """Base exception for ModelNow cost engine."""


class CostCalculationError(CostEngineError):
    """Raised when a cost calculation cannot be completed."""


class PricingError(CostEngineError):
    """Raised when pricing information is invalid or unavailable."""
