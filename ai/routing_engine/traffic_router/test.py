from __future__ import annotations

from ai.routing_engine.models import (
    ModelCandidate,
    RoutingRequest,
)
from ai.routing_engine.constants import RoutingStatus

from .queues import QueuePriority
from .router import TrafficRouter


def make_candidates() -> list[ModelCandidate]:
    return [
        ModelCandidate(
            model_id="qwen:qwen3",
            provider="qwen",
            tier="slm",
            estimated_latency_ms=100,
        ),
        ModelCandidate(
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            estimated_latency_ms=300,
        ),
    ]


def test_registration() -> None:
    router = TrafficRouter()
    count = router.register_candidates(make_candidates())

    assert count == 2
    assert len(router.load_balancer.targets()) == 2


def test_routing() -> None:
    router = TrafficRouter()

    route = router.route(
        request=RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": "hello",
                }
            ]
        ),
        candidates=make_candidates(),
        payload="hello",
        request_id="req-1",
    )

    assert route.request_id == "req-1"
    assert route.candidate.model_id in {
        "qwen:qwen3",
        "openai:gpt-5",
    }
    assert route.dispatch.accepted is True


def test_priority_routing() -> None:
    router = TrafficRouter()

    route = router.route(
        request=RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": "urgent task",
                }
            ]
        ),
        candidates=make_candidates(),
        payload="urgent task",
        request_id="req-high",
        priority=QueuePriority.HIGH,
    )

    assert route.dispatch.accepted is True


def test_routing_decision() -> None:
    router = TrafficRouter()

    decision = router.route_decision(
        request=RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": "test routing",
                }
            ]
        ),
        candidates=make_candidates(),
        payload="test routing",
        request_id="req-decision",
    )

    assert decision.status == RoutingStatus.SELECTED
    assert decision.model_id in {
        "qwen:qwen3",
        "openai:gpt-5",
    }
    assert decision.provider in {
        "qwen",
        "openai",
    }
    assert decision.metadata["request_id"] == "req-decision"


def test_empty_candidates() -> None:
    router = TrafficRouter()

    decision = router.route_decision(
        request=RoutingRequest(
            messages=[
                {
                    "role": "user",
                    "content": "test",
                }
            ]
        ),
        candidates=[],
    )

    assert decision.status == RoutingStatus.FAILED


def test_request_id_generation() -> None:
    router = TrafficRouter()

    route = router.route(
        request=RoutingRequest(),
        candidates=make_candidates(),
        payload="test",
    )

    assert route.request_id
    assert route.dispatch.accepted is True


def test_custom_capacity() -> None:
    router = TrafficRouter(default_capacity=25)

    assert router.default_capacity == 25

    router.register_candidates(make_candidates())

    for target in router.load_balancer.targets():
        assert target.capacity == 25


def run_tests() -> None:
    tests = [
        ("REGISTRATION", test_registration),
        ("ROUTING", test_routing),
        ("PRIORITY ROUTING", test_priority_routing),
        ("ROUTING DECISION", test_routing_decision),
        ("EMPTY CANDIDATES", test_empty_candidates),
        ("REQUEST ID", test_request_id_generation),
        ("CUSTOM CAPACITY", test_custom_capacity),
    ]

    for name, test in tests:
        test()
        print(f"{name}: PASS")

    print("=" * 62)
    print("MODELNOW TRAFFIC ROUTER TEST: PASS")
    print("=" * 62)


if __name__ == "__main__":
    run_tests()
