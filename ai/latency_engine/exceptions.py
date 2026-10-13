from __future__ import annotations


class LatencyEngineError(Exception):
    """Base exception for the ModelNow latency engine."""


class InvalidLatencyObservationError(LatencyEngineError):
    """Raised when a latency observation is invalid."""


class LatencyPredictionError(LatencyEngineError):
    """Raised when latency prediction cannot be produced."""


class SLAConfigurationError(LatencyEngineError):
    """Raised when an SLA configuration is invalid."""


class LatencyDegradationError(LatencyEngineError):
    """Raised when latency degradation analysis fails."""


class InsufficientLatencyDataError(LatencyEngineError):
    """Raised when insufficient historical data exists for an operation."""


__all__ = [
    "LatencyEngineError",
    "InvalidLatencyObservationError",
    "LatencyPredictionError",
    "SLAConfigurationError",
    "LatencyDegradationError",
    "InsufficientLatencyDataError",
]
