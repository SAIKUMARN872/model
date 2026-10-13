from __future__ import annotations

from dataclasses import dataclass

from .models import ModelCandidate, RoutingDecision, RoutingRequest


@dataclass(frozen=True)
class RoutingExecution:
    """Routing request together with its decision."""

    request: RoutingRequest
    decision: RoutingDecision


@dataclass(frozen=True)
class CandidateSet:
    """Candidate models discovered for a routing request."""

    candidates: list[ModelCandidate]

    @property
    def count(self) -> int:
        return len(self.candidates)


__all__ = [
    "RoutingExecution",
    "CandidateSet",
]
