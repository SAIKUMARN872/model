from __future__ import annotations

import asyncio

from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.exceptions import NoRouteAvailableError
from ai.routing_engine.model_selector import (
    DefaultModelSelector,
    rank_candidates,
)
from ai.routing_engine.models import (
    ModelCandidate,
    RoutingRequest,
)


def build_candidates() -> list[ModelCandidate]:
    return [
        ModelCandidate(
            model_id="cheap-slm",
            provider="provider-a",
            tier="slm",
            quality=0.80,
            input_cost=0.05,
            output_cost=0.10,
            estimated_latency_ms=80.0,
            capabilities=("chat", "code"),
        ),
        ModelCandidate(
            model_id="balanced-slm",
            provider="provider-b",
            tier="slm",
            quality=0.90,
            input_cost=0.20,
            output_cost=0.30,
            estimated_latency_ms=120.0,
            capabilities=("chat", "code"),
        ),
        ModelCandidate(
            model_id="quality-slm",
            provider="provider-c",
            tier="slm",
            quality=0.98,
            input_cost=0.60,
            output_cost=0.80,
            estimated_latency_ms=250.0,
            capabilities=("chat", "code"),
        ),
    ]


async def main() -> None:
    candidates = build_candidates()
    selector = DefaultModelSelector()

    quality_request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Write Python code.",
            }
        ],
        objective=RoutingObjective.QUALITY,
    )

    quality_decision = await selector.select(
        quality_request,
        candidates,
    )

    assert quality_decision.model_id == "quality-slm"
    assert quality_decision.status.value == "selected"
    assert quality_decision.candidates_considered == 3

    cost_request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Write Python code.",
            }
        ],
        objective=RoutingObjective.COST,
    )

    cost_decision = await selector.select(
        cost_request,
        candidates,
    )

    assert cost_decision.model_id == "cheap-slm"

    latency_request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Write Python code.",
            }
        ],
        objective=RoutingObjective.LATENCY,
    )

    latency_decision = await selector.select(
        latency_request,
        candidates,
    )

    assert latency_decision.model_id == "cheap-slm"

    balanced_request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Write Python code.",
            }
        ],
        objective=RoutingObjective.BALANCED,
    )

    balanced_decision = await selector.select(
        balanced_request,
        candidates,
    )

    assert balanced_decision.model_id == "cheap-slm"

    ranked = rank_candidates(
        candidates,
        RoutingObjective.QUALITY,
    )

    assert ranked[0][0].model_id == "quality-slm"
    assert len(ranked) == 3

    try:
        await selector.select(
            balanced_request,
            [],
        )
    except NoRouteAvailableError:
        pass
    else:
        raise AssertionError(
            "Expected NoRouteAvailableError."
        )

    print("MODEL SELECTOR: PASS")
    print(f"QUALITY: {quality_decision.model_id}")
    print(f"COST: {cost_decision.model_id}")
    print(f"LATENCY: {latency_decision.model_id}")
    print(f"BALANCED: {balanced_decision.model_id}")
    print("RANKING: PASS")
    print("EMPTY CANDIDATES: PASS")


if __name__ == "__main__":
    asyncio.run(main())

