from __future__ import annotations

from dataclasses import dataclass

from ai.routing_engine.models import (
    ModelCandidate,
    RoutingDecision,
    RoutingRequest,
)

from .recovery import (
    RecoveryAction,
    RecoveryController,
)
from .retry import (
    RetryController,
    RetryPolicy,
)


@dataclass(frozen=True)
class FallbackDecision:
    """
    Result of fallback planning.
    """

    action: RecoveryAction
    primary_model: str | None = None
    fallback_model: str | None = None
    attempt: int = 0
    reason: str = ""


class FallbackEngine:
    """
    Routing-aware fallback orchestration.

    Responsibilities:

    1. Track the primary routing decision.
    2. Determine whether retry is allowed.
    3. Exclude the failed model from fallback candidates.
    4. Select the best eligible fallback candidate.
    5. Never bypass the constraints already applied to the request.

    The engine does not execute inference itself.
    """

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
            else RecoveryController(
                max_retries=1,
            )
        )

    @staticmethod
    def _eligible_fallbacks(
        primary_model: str | None,
        candidates: list[ModelCandidate],
    ) -> list[ModelCandidate]:
        """
        Remove the failed primary model and disabled candidates.
        """
        return [
            candidate
            for candidate in candidates
            if candidate.enabled
            and candidate.model_id != primary_model
        ]

    @staticmethod
    def _best_fallback(
        candidates: list[ModelCandidate],
    ) -> ModelCandidate | None:
        """
        Deterministic fallback ranking.

        Prefer:

        1. Higher quality.
        2. Lower total cost.
        3. Lower latency.
        4. Stable model ID ordering.
        """
        if not candidates:
            return None

        return sorted(
            candidates,
            key=lambda candidate: (
                -candidate.quality,
                candidate.input_cost + candidate.output_cost,
                candidate.estimated_latency_ms,
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
        """
        Produce the next recovery/fallback action.

        The request is accepted here so future versions can use
        request objectives and policy metadata during fallback.
        """
        del request

        primary_model = primary_decision.model_id

        fallback_candidates = self._eligible_fallbacks(
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

        fallback = self._best_fallback(
            fallback_candidates,
        )

        if fallback is None:
            return FallbackDecision(
                action=RecoveryAction.FAIL,
                primary_model=primary_model,
                attempt=attempt,
                reason=(
                    "Fallback was requested but no eligible "
                    "fallback model exists."
                ),
            )

        return FallbackDecision(
            action=RecoveryAction.FALLBACK,
            primary_model=primary_model,
            fallback_model=fallback.model_id,
            attempt=attempt,
            reason=(
                f"Primary model '{primary_model}' failed; "
                f"fallback model '{fallback.model_id}' selected."
            ),
        )


__all__ = [
    "FallbackDecision",
    "FallbackEngine",
]
