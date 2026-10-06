class OptimizationEngineError(Exception):
    """Base exception for the Optimization Engine."""


class InvalidOptimizationRequestError(
    OptimizationEngineError
):
    """Raised when an optimization request is invalid."""


class InvalidOptimizationObjectiveError(
    OptimizationEngineError
):
    """Raised when an unsupported optimization objective is used."""


class InvalidOptimizationWeightsError(
    OptimizationEngineError
):
    """Raised when optimization weights are invalid."""


class InvalidOptimizationConstraintError(
    OptimizationEngineError
):
    """Raised when optimization constraints are invalid."""


class InvalidOptimizationCandidateError(
    OptimizationEngineError
):
    """Raised when an optimization candidate is invalid."""


class NoFeasibleCandidateError(
    OptimizationEngineError
):
    """Raised when no candidate satisfies the constraints."""


class NoOptimizationCandidateError(
    OptimizationEngineError
):
    """Raised when no optimization candidates are available."""


class OptimizationCalculationError(
    OptimizationEngineError
):
    """Raised when optimization scoring fails."""


class OptimizationPolicyError(
    OptimizationEngineError
):
    """Raised when an optimization policy cannot be applied."""


class OptimizationHistoryError(
    OptimizationEngineError
):
    """Raised when optimization history operations fail."""


__all__ = [
    "OptimizationEngineError",
    "InvalidOptimizationRequestError",
    "InvalidOptimizationObjectiveError",
    "InvalidOptimizationWeightsError",
    "InvalidOptimizationConstraintError",
    "InvalidOptimizationCandidateError",
    "NoFeasibleCandidateError",
    "NoOptimizationCandidateError",
    "OptimizationCalculationError",
    "OptimizationPolicyError",
    "OptimizationHistoryError",
]
