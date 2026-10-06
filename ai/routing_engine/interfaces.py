from __future__ import annotations

from abc import ABC, abstractmethod

from .models import (
    ModelCandidate,
    RoutingDecision,
    RoutingRequest,
)


class ModelCatalog(ABC):
    """Interface used by routing to discover eligible models."""

    @abstractmethod
    async def candidates(
        self,
        request: RoutingRequest,
    ) -> list[ModelCandidate]:
        raise NotImplementedError


class ModelSelector(ABC):
    """Interface used to select one model from candidates."""

    @abstractmethod
    async def select(
        self,
        request: RoutingRequest,
        candidates: list[ModelCandidate],
    ) -> RoutingDecision:
        raise NotImplementedError


__all__ = [
    "ModelCatalog",
    "ModelSelector",
]
