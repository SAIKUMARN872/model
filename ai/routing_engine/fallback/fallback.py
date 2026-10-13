from __future__ import annotations

import math
from dataclasses import dataclass

from ai.routing_engine.models import (
    ModelCandidate,
    RoutingDecision,
    RoutingRequest,
)

from .recovery import RecoveryAction, RecoveryController
from .retry import RetryController, RetryPolicy


@dataclass(frozen=True)
class FallbackDecision:
    """Result of fallback planning."""

    action: RecoveryAction
    primary_model: str | None = None
    fallback_model: str | None = None
    attempt: int = 0
    reason: str = ""


class FallbackEngine:
    """Plan retries and select eligible routing-aware fallback models."""

    def __init__(
        self,
        retry_controller: RetryController | None = None,
        recovery_controller: RecoveryController | None = None,
    ) -> None:
        self.retry_controller = (
            retry_controller
            if retry_controller is not None
            else RetryController(
                RetryPolicy(
                    max_attempts=2,
                    initial_delay_ms=100,
                    max_delay_ms=2000,
                )
            )
        )
        self.recovery_controller = (
            recovery_controller
            if recovery_controller is not None
            else RecoveryController(max_retries=1)
        )

    @staticmethod
    def _within_explicit_budget(
        request: RoutingRequest,
        candidate: ModelCandidate,
    ) -> bool:
        if request.max_cost is None:
            return True

        explicit_budget = request.metadata.get(
            "explicit_max_cost",
            True,
        )

        # Inferred policy budgets remain selector preferences.
        if explicit_budget is not True:
            return True

        budget = request.max_cost
        input_tokens = request.metadata.get("estimated_input_tokens")
        output_tokens = request.metadata.get("estimated_output_tokens")

        if (
            isinstance(budget, bool)
            or not isinstance(budget, (int, float))
            or not math.isfinite(budget)
            or budget < 0
        ):
            return False

        if (
            isinstance(input_tokens, bool)
            or not isinstance(input_tokens, int)
            or input_tokens < 0
            or isinstance(output_tokens, bool)
            or not isinstance(output_tokens, int)
            or output_tokens < 0
        ):
            return False

        input_rate = candidate.input_cost
        output_rate = candidate.output_cost

        if (
            isinstance(input_rate, bool)
            or not isinstance(input_rate, (int, float))
            or not math.isfinite(input_rate)
            or input_rate < 0
            or isinstance(output_rate, bool)
            or not isinstance(output_rate, (int, float))
            or not math.isfinite(output_rate)
            or output_rate < 0
        ):
            return False

        estimated_cost = (
            input_tokens * input_rate
            + output_tokens * output_rate
        ) / 1_000_000

        return estimated_cost <= budget

    @classmethod
    def _eligible_fallbacks(
        cls,
        request: RoutingRequest,
        primary_model: str | None,
        candidates: list[ModelCandidate],
    ) -> list[ModelCandidate]:
        eligible: list[ModelCandidate] = []

        required = {
            capability.strip().lower()
            for capability in request.required_capabilities
        }
        preferred_tier = (
            request.preferred_tier.strip().lower()
            if request.preferred_tier
            else None
        )

        for candidate in candidates:
            if not candidate.enabled:
                continue

            if candidate.model_id == primary_model:
                continue

            if preferred_tier and candidate.tier.strip().lower() != preferred_tier:
                continue

            if (
                request.min_quality is not None
                and candidate.quality < request.min_quality
            ):
                continue

            if request.max_latency_ms is not None:
                latency = candidate.estimated_latency_ms
                if (
                    latency is None
                    or not math.isfinite(latency)
                    or latency > request.max_latency_ms
                ):
                    continue

            available = {
                capability.strip().lower()
                for capability in candidate.capabilities
            }
            if not required.issubset(available):
                continue

            if request.stream and "streaming" not in available:
                continue

            if not cls._within_explicit_budget(request, candidate):
                continue

            eligible.append(candidate)

        return eligible

    @staticmethod
    def _best_fallback(
        candidates: list[ModelCandidate],
    ) -> ModelCandidate | None:
        """Rank eligible fallbacks by quality, cost, latency, then ID."""
        if not candidates:
            return None

        return sorted(
            candidates,
            key=lambda candidate: (
                -candidate.quality,
                candidate.input_cost + candidate.output_cost,
                (
                    candidate.estimated_latency_ms
                    if candidate.estimated_latency_ms is not None
                    else math.inf
                ),
                candidate.model_id,
            ),
        )[0]

    def plan(
        self,
        request: RoutingRequest,
        primary_decision: RoutingDecision,
        candidates: list[ModelCandidate],
        attempt: int,
    ) -> FallbackDecision:
        """Produce the next recovery action without bypassing constraints."""
        primary_model = primary_decision.model_id

        fallback_candidates = self._eligible_fallbacks(
            request,
            primary_model,
            candidates,
        )

        recovery = self.recovery_controller.decide(
            attempt=attempt,
            fallback_available=bool(fallback_candidates),
        )

        if recovery.action == RecoveryAction.RETRY:
            return FallbackDecision(
                action=RecoveryAction.RETRY,
                primary_model=primary_model,
                attempt=attempt,
                reason=recovery.reason,
            )

        if recovery.action == RecoveryAction.FAIL:
            return FallbackDecision(
                action=RecoveryAction.FAIL,
                primary_model=primary_model,
                attempt=attempt,
                reason=recovery.reason,
            )

        fallback = self._best_fallback(fallback_candidates)

        if fallback is None:
            return FallbackDecision(
                action=RecoveryAction.FAIL,
                primary_model=primary_model,
                attempt=attempt,
                reason="No eligible fallback model satisfies the request constraints.",
            )

        return FallbackDecision(
            action=RecoveryAction.FALLBACK,
            primary_model=primary_model,
            fallback_model=fallback.model_id,
            attempt=attempt,
            reason=(
                f"Primary model '{primary_model}' failed; "
                f"eligible fallback model '{fallback.model_id}' selected."
            ),
        )


FallbackRouter = FallbackEngine

__all__ = ["FallbackDecision", "FallbackEngine", "FallbackRouter"]
