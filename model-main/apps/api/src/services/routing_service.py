"""
Routing service.

Responsible for intelligent request routing between AI models,
providers, agents, and services based on policies, availability,
cost, latency, and user requirements.
"""

from __future__ import annotations

from typing import Any

from app.repositories.routing import RoutingRepository
from app.schemas.chat import ChatRequest


class RoutingService:
    """
    AI request routing business logic.

    Decides which provider/model should handle a request.
    """

    def __init__(
        self,
        repository: RoutingRepository | None = None,
    ) -> None:

        self._repository = repository or RoutingRepository()


    async def route_request(
        self,
        request: ChatRequest,
        user_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Route AI request to the best available model.
        """

        user_context = user_context or {}

        decision = await self._repository.find_best_route(
            request=request,
            context=user_context,
        )

        return {
            "provider": decision.provider,
            "model": decision.model,
            "strategy": decision.strategy,
        }


    async def select_provider(
        self,
        model: str | None = None,
        requirements: dict[str, Any] | None = None,
    ) -> str:
        """
        Select AI provider.
        """

        provider = await self._repository.select_provider(
            model=model,
            requirements=requirements or {},
        )

        return provider


    async def select_model(
        self,
        task: str,
        requirements: dict[str, Any] | None = None,
    ) -> str:
        """
        Select optimal AI model for a task.
        """

        model = await self._repository.select_model(
            task=task,
            requirements=requirements or {},
        )

        return model


    async def fallback_route(
        self,
        failed_provider: str,
        failed_model: str,
    ) -> dict[str, Any]:
        """
        Find fallback model/provider.
        """

        fallback = await self._repository.get_fallback(
            provider=failed_provider,
            model=failed_model,
        )

        return {
            "provider": fallback.provider,
            "model": fallback.model,
        }


    async def check_availability(
        self,
        provider: str,
        model: str,
    ) -> bool:
        """
        Check provider/model availability.
        """

        return await self._repository.is_available(
            provider=provider,
            model=model,
        )


    async def routing_policy(
        self,
        user_id: str,
    ) -> dict[str, Any]:
        """
        Get routing policy for a user or organization.
        """

        return await self._repository.get_policy(
            user_id,
        )


    async def update_policy(
        self,
        user_id: str,
        policy: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Update routing policy.
        """

        return await self._repository.update_policy(
            user_id=user_id,
            policy=policy,
        )


    async def route_by_cost(
        self,
        task: str,
    ) -> dict[str, Any]:
        """
        Select cheapest available model.
        """

        return await self._repository.route_by_cost(
            task,
        )


    async def route_by_latency(
        self,
        task: str,
    ) -> dict[str, Any]:
        """
        Select fastest available model.
        """

        return await self._repository.route_by_latency(
            task,
        )


    async def route_by_quality(
        self,
        task: str,
    ) -> dict[str, Any]:
        """
        Select highest quality model.
        """

        return await self._repository.route_by_quality(
            task,
        )


    async def record_metrics(
        self,
        provider: str,
        model: str,
        latency: float,
        tokens: int,
        cost: float,
    ) -> None:
        """
        Store routing performance metrics.
        """

        await self._repository.record_metrics(
            provider=provider,
            model=model,
            latency=latency,
            tokens=tokens,
            cost=cost,
        )