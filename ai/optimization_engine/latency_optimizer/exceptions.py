class LatencyOptimizerError(Exception):
    """Base exception for the Latency Optimizer."""


class InvalidLatencyOptimizationRequestError(
    LatencyOptimizerError
):
    """Raised when a latency optimization request is invalid."""


class InvalidLatencyOptimizationCandidateError(
    LatencyOptimizerError
):
    """Raised when a latency optimization candidate is invalid."""


class NoLatencyOptimizationCandidateError(
    LatencyOptimizerError
):
    """Raised when no latency optimization candidates exist."""


class NoFeasibleLatencyCandidateError(
    LatencyOptimizerError
):
    """Raised when no candidate satisfies latency constraints."""


class LatencyOptimizationCalculationError(
    LatencyOptimizerError
):
    """Raised when latency optimization calculation fails."""


__all__ = [
    "LatencyOptimizerError",
    "InvalidLatencyOptimizationRequestError",
    "InvalidLatencyOptimizationCandidateError",
    "NoLatencyOptimizationCandidateError",
    "NoFeasibleLatencyCandidateError",
    "LatencyOptimizationCalculationError",
]
