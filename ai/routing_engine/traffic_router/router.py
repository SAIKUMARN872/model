from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from ai.routing_engine.constants import RoutingStatus
from ai.routing_engine.models import (
    ModelCandidate,
    RoutingDecision,
    RoutingRequest,
)

from ..load_balancer.balancer import LoadBalancer, LoadTarget
from .dispatcher import DispatchRequest, RequestDispatcher
from .queues import QueuePriority
from .utils import (
    filter_candidates,
    normalize_priority,
    normalize_request_id,
)


@dataclass(frozen=True)
class TrafficRoute:
    """Selected traffic destination."""

    request_id: str
    candidate: ModelCandidate
    dispatch: object


class TrafficRouter:
    """Routes model candidates through load balancing and dispatch."""

    def __init__(
        self,
        load_balancer: LoadBalancer | None = None,
        dispatcher: RequestDispatcher | None = None,
        default_capacity: int = 100,
    ) -> None:
        if default_capacity <= 0:
            raise ValueError(
                "default_capacity must be greater than zero"
            )

        self._load_balancer = (
            load_balancer
            if load_balancer is not None
            else LoadBalancer()
        )

        self._dispatcher = (
            dispatcher
            if dispatcher is not None
            else RequestDispatcher()
        )

        self._default_capacity = default_capacity

    @property
    def load_balancer(self) -> LoadBalancer:
        return self._load_balancer

    @property
    def dispatcher(self) -> RequestDispatcher:
        return self._dispatcher

    @property
    def default_capacity(self) -> int:
        return self._default_capacity

    def register_candidates(
        self,
        candidates: Iterable[ModelCandidate],
    ) -> int:
        """Register enabled model candidates as traffic targets."""
        count = 0

        for candidate in filter_candidates(candidates):
            target = LoadTarget(
                target_id=candidate.model_id,
                weight=1.0,
                active_requests=0,
                latency_ms=candidate.estimated_latency_ms,
                healthy=True,
                capacity=self._default_capacity,
                metadata={
                    "provider": candidate.provider,
                    "model_id": candidate.model_id,
                    "tier": candidate.tier,
                },
            )

            self._load_balancer.register(target)
            count += 1

        return count

    def route(
        self,
        request: RoutingRequest,
        candidates: Iterable[ModelCandidate],
        payload: object = None,
        request_id: str | None = None,
        priority: QueuePriority | int | str | None = None,
    ) -> TrafficRoute:
        """Select a traffic target and submit the request."""
        if not isinstance(request, RoutingRequest):
            raise TypeError(
                "request must be a RoutingRequest"
            )

        available = filter_candidates(candidates)

        if not available:
            raise ValueError(
                "No enabled traffic targets available"
            )

        self.register_candidates(available)

        selected = self._load_balancer.select()

        if selected is None:
            raise RuntimeError(
                "Load balancer could not select a target"
            )

        candidate = next(
            (
                item
                for item in available
                if item.model_id == selected.target_id
            ),
            None,
        )

        if candidate is None:
            raise RuntimeError(
                "Selected traffic target is not in candidate pool"
            )

        normalized_request_id = normalize_request_id(
            request_id
        )

        normalized_priority = normalize_priority(
            priority
        )

        dispatch_request = DispatchRequest(
            request_id=normalized_request_id,
            candidate=candidate,
            payload=payload,
            priority=normalized_priority,
        )

        dispatch_result = self._dispatcher.submit(
            dispatch_request
        )

        return TrafficRoute(
            request_id=normalized_request_id,
            candidate=candidate,
            dispatch=dispatch_result,
        )

    def route_decision(
        self,
        request: RoutingRequest,
        candidates: Iterable[ModelCandidate],
        payload: object = None,
        request_id: str | None = None,
        priority: QueuePriority | int | str | None = None,
    ) -> RoutingDecision:
        """Return a routing-engine-compatible decision."""
        try:
            route = self.route(
                request=request,
                candidates=candidates,
                payload=payload,
                request_id=request_id,
                priority=priority,
            )

            return RoutingDecision(
                status=RoutingStatus.SELECTED,
                model_id=route.candidate.model_id,
                provider=route.candidate.provider,
                tier=route.candidate.tier,
                score=None,
                reason="traffic route selected",
                candidates_considered=1,
                metadata={
                    "request_id": route.request_id,
                    "queued": route.dispatch.queued,
                },
            )

        except (ValueError, RuntimeError) as exc:
            return RoutingDecision(
                status=RoutingStatus.FAILED,
                reason=str(exc),
                candidates_considered=0,
            )


__all__ = [
    "TrafficRoute",
    "TrafficRouter",
]
