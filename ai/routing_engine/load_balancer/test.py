from __future__ import annotations

from ai.routing_engine.load_balancer.balancer import (
    LoadBalancer,
    LoadTarget,
)
from ai.routing_engine.load_balancer.strategy import (
    LoadBalancingStrategy,
)
from ai.routing_engine.load_balancer.weights import (
    normalize_weights,
)


def make_targets() -> list[LoadTarget]:
    return [
        LoadTarget(
            target_id="qwen:qwen3",
            weight=1.0,
            capacity=100,
            metadata={
                "provider": "qwen",
                "model": "qwen3",
                "tier": "slm",
            },
        ),
        LoadTarget(
            target_id="mistral:mistral-small",
            weight=1.0,
            capacity=100,
            metadata={
                "provider": "mistral",
                "model": "mistral-small",
                "tier": "mlm",
            },
        ),
        LoadTarget(
            target_id="openai:gpt-5",
            weight=1.0,
            capacity=100,
            metadata={
                "provider": "openai",
                "model": "gpt-5",
                "tier": "llm",
            },
        ),
    ]


def test_registration() -> None:
    balancer = LoadBalancer()
    balancer.register_many(make_targets())

    assert len(balancer.targets()) == 3
    assert balancer.get_target("openai:gpt-5") is not None


def test_model_provider_metadata() -> None:
    balancer = LoadBalancer()
    balancer.register_many(make_targets())

    target = balancer.get_target("qwen:qwen3")

    assert target is not None
    assert target.metadata["provider"] == "qwen"
    assert target.metadata["model"] == "qwen3"
    assert target.metadata["tier"] == "slm"


def test_round_robin() -> None:
    balancer = LoadBalancer(
        LoadBalancingStrategy.ROUND_ROBIN
    )
    balancer.register_many(make_targets())

    selected = [
        balancer.select().target_id
        for _ in range(3)
    ]

    assert selected == [
        "mistral:mistral-small",
        "openai:gpt-5",
        "qwen:qwen3",
    ]


def test_least_loaded() -> None:
    balancer = LoadBalancer(
        LoadBalancingStrategy.LEAST_LOADED
    )
    balancer.register_many(make_targets())

    balancer.update_load(
        "qwen:qwen3",
        active_requests=80,
    )
    balancer.update_load(
        "mistral:mistral-small",
        active_requests=20,
    )

    assert (
        balancer.select().target_id
        == "openai:gpt-5"
    )


def test_latency_aware() -> None:
    balancer = LoadBalancer(
        LoadBalancingStrategy.LATENCY_AWARE
    )
    balancer.register_many(make_targets())

    balancer.update_load(
        "qwen:qwen3",
        latency_ms=250,
    )
    balancer.update_load(
        "mistral:mistral-small",
        latency_ms=80,
    )
    balancer.update_load(
        "openai:gpt-5",
        latency_ms=150,
    )

    assert (
        balancer.select().target_id
        == "mistral:mistral-small"
    )


def test_health_and_capacity() -> None:
    balancer = LoadBalancer(
        LoadBalancingStrategy.ROUND_ROBIN
    )
    balancer.register_many(make_targets())

    balancer.update_load(
        "qwen:qwen3",
        healthy=False,
    )

    balancer.update_load(
        "mistral:mistral-small",
        active_requests=100,
    )

    available = {
        target.target_id
        for target in balancer.available_targets()
    }

    assert "qwen:qwen3" not in available
    assert "mistral:mistral-small" not in available
    assert "openai:gpt-5" in available


def test_weight_normalization() -> None:
    weights = normalize_weights(
        {
            "qwen:qwen3": 1,
            "mistral:mistral-small": 2,
            "openai:gpt-5": 7,
        }
    )

    assert sum(weights.values()) == 1
    assert weights["openai:gpt-5"] > weights["mistral:mistral-small"]
    assert weights["mistral:mistral-small"] > weights["qwen:qwen3"]


def test_weighted_strategy() -> None:
    balancer = LoadBalancer(
        LoadBalancingStrategy.WEIGHTED
    )

    balancer.register_many(
        [
            LoadTarget(
                target_id="qwen:qwen3",
                weight=1.0,
                metadata={
                    "provider": "qwen",
                    "model": "qwen3",
                    "tier": "slm",
                },
            ),
            LoadTarget(
                target_id="openai:gpt-5",
                weight=10.0,
                metadata={
                    "provider": "openai",
                    "model": "gpt-5",
                    "tier": "llm",
                },
            ),
        ]
    )

    assert (
        balancer.select().target_id
        == "openai:gpt-5"
    )


def test_target_filtering() -> None:
    balancer = LoadBalancer()
    balancer.register_many(make_targets())

    target = balancer.select(
        ["openai:gpt-5", "qwen:qwen3"]
    )

    assert target.target_id in {
        "openai:gpt-5",
        "qwen:qwen3",
    }


def test_remove() -> None:
    balancer = LoadBalancer()
    balancer.register_many(make_targets())

    assert balancer.remove("openai:gpt-5") is True
    assert balancer.get_target("openai:gpt-5") is None
    assert balancer.remove("unknown:model") is False


def test_no_available_target() -> None:
    balancer = LoadBalancer()

    balancer.register(
        LoadTarget(
            target_id="openai:gpt-5",
            healthy=False,
        )
    )

    try:
        balancer.select()
    except LookupError:
        pass
    else:
        raise AssertionError(
            "Expected LookupError"
        )


def run() -> None:
    tests = [
        ("REGISTRATION", test_registration),
        (
            "MODEL PROVIDER METADATA",
            test_model_provider_metadata,
        ),
        ("ROUND ROBIN", test_round_robin),
        ("LEAST LOADED", test_least_loaded),
        ("LATENCY AWARE", test_latency_aware),
        (
            "HEALTH AND CAPACITY",
            test_health_and_capacity,
        ),
        (
            "WEIGHT NORMALIZATION",
            test_weight_normalization,
        ),
        ("WEIGHTED STRATEGY", test_weighted_strategy),
        ("TARGET FILTERING", test_target_filtering),
        ("REMOVE", test_remove),
        (
            "NO AVAILABLE TARGET",
            test_no_available_target,
        ),
    ]

    for name, test in tests:
        test()
        print(f"{name}: PASS")

    print("=" * 70)
    print("MODELNOW LOAD BALANCER TEST: PASS")
    print("=" * 70)


if __name__ == "__main__":
    run()
