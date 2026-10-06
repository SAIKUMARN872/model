from __future__ import annotations


class RoutingEngineError(Exception):
    """Base exception for routing errors."""


class RoutingValidationError(RoutingEngineError):
    """Raised when a routing request is invalid."""


class NoRouteAvailableError(RoutingEngineError):
    """Raised when no model can satisfy a routing request."""


class ModelSelectionError(RoutingEngineError):
    """Raised when model selection fails."""


__all__ = [
    "RoutingEngineError",
    "RoutingValidationError",
    "NoRouteAvailableError",
    "ModelSelectionError",
]
