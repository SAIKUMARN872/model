class CostOptimizerError(Exception):
    """Base exception for the Cost Optimizer."""


class InvalidCostOptimizationRequestError(
    CostOptimizerError
):
    """Raised when a cost optimization request is invalid."""


class InvalidCostCandidateError(
    CostOptimizerError
):
    """Raised when a cost optimization candidate is invalid."""


class NoCostOptimizationCandidateError(
    CostOptimizerError
):
    """Raised when no cost optimization candidates exist."""


class NoFeasibleCostCandidateError(
    CostOptimizerError
):
    """Raised when no candidate satisfies cost constraints."""


class CostOptimizationCalculationError(
    CostOptimizerError
):
    """Raised when cost optimization calculation fails."""


__all__ = [
    "CostOptimizerError",
    "InvalidCostOptimizationRequestError",
    "InvalidCostCandidateError",
    "NoCostOptimizationCandidateError",
    "NoFeasibleCostCandidateError",
    "CostOptimizationCalculationError",
]
