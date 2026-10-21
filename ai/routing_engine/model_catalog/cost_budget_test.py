from __future__ import annotations

import asyncio

from ai.routing_engine.model_catalog import ModelRegistryCatalog
from ai.routing_engine.model_catalog.test import build_registry
from ai.routing_engine.models import RoutingRequest


async def main() -> None:
    catalog = ModelRegistryCatalog(build_registry())

    def request(
        budget: float,
        input_tokens: int = 1000,
        output_tokens: int = 1000,
    ) -> RoutingRequest:
        return RoutingRequest(
            messages=[{"role": "user", "content": "Test"}],
            max_cost=budget,
            metadata={
                "explicit_max_cost": True,
                "estimated_input_tokens": input_tokens,
                "estimated_output_tokens": output_tokens,
            },
        )

    # SLM estimated cost: (1000 * 0.10 + 1000 * 0.20) / 1,000,000
    exact = await catalog.candidates(request(0.0003))
    assert [c.model_id for c in exact] == ["test-slm"], exact
    print("EXACT BUDGET BOUNDARY: PASS")

    below = await catalog.candidates(request(0.00029))
    assert below == [], below
    print("BELOW CHEAPEST MODEL COST: PASS")

    above = await catalog.candidates(request(0.0004))
    assert [c.model_id for c in above] == ["test-slm"], above
    print("ABOVE SLM COST: PASS")

    missing_output = await catalog.candidates(
        RoutingRequest(
            messages=[{"role": "user", "content": "Test"}],
            max_cost=1.0,
            metadata={
                "explicit_max_cost": True,
                "estimated_input_tokens": 1000,
            },
        )
    )
    assert missing_output == [], missing_output
    print("MISSING OUTPUT ESTIMATE FAILS CLOSED: PASS")

    missing_input = await catalog.candidates(
        RoutingRequest(
            messages=[{"role": "user", "content": "Test"}],
            max_cost=1.0,
            metadata={
                "explicit_max_cost": True,
                "estimated_output_tokens": 1000,
            },
        )
    )
    assert missing_input == [], missing_input
    print("MISSING INPUT ESTIMATE FAILS CLOSED: PASS")

    invalid_estimate = await catalog.candidates(
        RoutingRequest(
            messages=[{"role": "user", "content": "Test"}],
            max_cost=1.0,
            metadata={
                "explicit_max_cost": True,
                "estimated_input_tokens": -1,
                "estimated_output_tokens": 1000,
            },
        )
    )
    assert invalid_estimate == [], invalid_estimate
    print("INVALID TOKEN ESTIMATE FAILS CLOSED: PASS")

    inferred = await catalog.candidates(
        RoutingRequest(
            messages=[{"role": "user", "content": "Test"}],
            max_cost=0.000001,
            metadata={"explicit_max_cost": False},
        )
    )
    assert len(inferred) == 2, inferred
    print("INFERRED BUDGET IS NOT A HARD FILTER: PASS")

    print("ALL COST BUDGET TESTS PASSED")


if __name__ == "__main__":
    asyncio.run(main())
