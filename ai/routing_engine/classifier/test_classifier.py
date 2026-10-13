from __future__ import annotations

from ai.routing_engine.classifier import (
    RequestClassifier,
    TaskComplexity,
    TaskType,
)
from ai.routing_engine.models import RoutingRequest


def test_general_request() -> None:
    classifier = RequestClassifier()

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "What is artificial intelligence?",
            }
        ]
    )

    profile = classifier.classify(request)

    assert profile.task_type == TaskType.GENERAL
    assert profile.complexity == TaskComplexity.LOW


def test_coding_request() -> None:
    classifier = RequestClassifier()

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Write Python code to sort a list.",
            }
        ]
    )

    profile = classifier.classify(request)

    assert profile.task_type == TaskType.CODING
    assert profile.code_required is True
    assert "code" in profile.required_capabilities


def test_reasoning_request() -> None:
    classifier = RequestClassifier()

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Solve this problem step by step and explain why.",
            }
        ]
    )

    profile = classifier.classify(request)

    assert profile.task_type == TaskType.REASONING
    assert profile.reasoning_level.value == "high"


def test_agentic_request() -> None:
    classifier = RequestClassifier()

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Automate this multi-step workflow for me.",
            }
        ]
    )

    profile = classifier.classify(request)

    assert profile.task_type == TaskType.AGENTIC
    assert profile.agentic_required is True


def test_streaming_capability() -> None:
    classifier = RequestClassifier()

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Explain AI.",
            }
        ],
        stream=True,
    )

    profile = classifier.classify(request)

    assert profile.streaming_required is True
    assert "streaming" in profile.required_capabilities


def test_constraints_are_preserved() -> None:
    classifier = RequestClassifier()

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Analyze this business problem.",
            }
        ],
        max_cost=0.01,
        max_latency_ms=500,
        min_quality=0.9,
        preferred_tier="llm",
    )

    profile = classifier.classify(request)

    assert profile.latency_sensitive is True
    assert profile.cost_sensitive is True
    assert profile.quality_sensitive is True
    assert profile.preferred_tier == "llm"


def run() -> None:
    test_general_request()
    test_coding_request()
    test_reasoning_request()
    test_agentic_request()
    test_streaming_capability()
    test_constraints_are_preserved()

    print("=" * 70)
    print("MODELNOW REQUEST CLASSIFIER V1 TEST")
    print("=" * 70)
    print("General request: PASS")
    print("Coding request: PASS")
    print("Reasoning request: PASS")
    print("Agentic request: PASS")
    print("Streaming detection: PASS")
    print("Routing constraints: PASS")
    print("=" * 70)
    print("REQUEST CLASSIFIER V1: PASS")
    print("=" * 70)


if __name__ == "__main__":
    run()
