from __future__ import annotations

from ai.routing_engine.models import RoutingRequest

from .router import PolicyRouter


def test_general_request() -> None:
    router = PolicyRouter()

    decision = router.apply(
        RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": "What is artificial intelligence?",
                }
            ]
        )
    )

    assert decision.allowed is True
    assert decision.preferred_tier == "slm"


def test_reasoning_request() -> None:
    router = PolicyRouter()

    decision = router.apply(
        RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Solve this problem step by step "
                        "and explain why."
                    ),
                }
            ]
        )
    )

    assert decision.preferred_tier == "llm"
    assert decision.min_quality == 0.90


def test_coding_request() -> None:
    router = PolicyRouter()

    decision = router.apply(
        RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Write Python code to build an API."
                    ),
                }
            ]
        )
    )

    assert "code" in decision.required_capabilities


def test_streaming_policy() -> None:
    router = PolicyRouter()

    decision = router.apply(
        RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": "Explain AI.",
                }
            ],
            stream=True,
        )
    )

    assert decision.streaming_required is True
    assert "streaming" in decision.required_capabilities


def test_explicit_constraints() -> None:
    router = PolicyRouter()

    decision = router.apply(
        RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": "Analyze this problem.",
                }
            ],
            preferred_tier="mlm",
            max_cost=0.005,
            max_latency_ms=500,
            min_quality=0.85,
        )
    )

    assert decision.preferred_tier == "mlm"
    assert decision.max_cost == 0.005
    assert decision.max_latency_ms == 500
    assert decision.min_quality == 0.85


def run() -> None:
    test_general_request()
    test_reasoning_request()
    test_coding_request()
    test_streaming_policy()
    test_explicit_constraints()

    print("=" * 70)
    print("MODELNOW POLICY ROUTER V1 TEST")
    print("=" * 70)
    print("General policy: PASS")
    print("Reasoning policy: PASS")
    print("Coding capability policy: PASS")
    print("Streaming policy: PASS")
    print("Explicit constraints: PASS")
    print("=" * 70)
    print("POLICY ROUTER V1: PASS")
    print("=" * 70)


if __name__ == "__main__":
    run()
