from __future__ import annotations

from time import sleep

from .cache import ModelMemoryCache
from .history import MemoryHistory
from .memory import MemoryRecord, ModelMemory
from .utils import (
    average_cost,
    average_latency,
    average_quality,
    failed_records,
    filter_by_model,
    filter_by_task,
    group_by_model,
    group_by_task,
    model_quality_map,
    success_rate,
    successful_records,
)


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def build_records() -> list[MemoryRecord]:
    return [
        MemoryRecord(
            request_id="r1",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            quality_score=0.92,
            latency_ms=180,
            cost=0.010,
            task_type="reasoning",
        ),
        MemoryRecord(
            request_id="r2",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            quality_score=0.88,
            latency_ms=220,
            cost=0.012,
            task_type="reasoning",
            success=False,
        ),
        MemoryRecord(
            request_id="r3",
            model_id="qwen:qwen3",
            provider="qwen",
            tier="slm",
            quality_score=0.81,
            latency_ms=90,
            cost=0.002,
            task_type="general",
        ),
    ]


def test_memory() -> None:
    memory = ModelMemory(max_records=2)

    records = build_records()

    memory.add(records[0])
    memory.add(records[1])

    check(memory.count() == 2, "memory count failed")
    check(
        memory.get("r1") is not None,
        "memory lookup failed",
    )

    memory.add(records[2])

    check(
        memory.get("r1") is None,
        "oldest record should be evicted",
    )

    check(
        memory.count() == 2,
        "memory should remain bounded",
    )

    print("MEMORY: PASS")


def test_history() -> None:
    memory = ModelMemory()
    memory.add_many(build_records())

    history = MemoryHistory(memory)

    performance = history.performance("openai:gpt-5")

    check(performance.samples == 2, "sample count failed")
    check(
        round(performance.average_quality, 2) == 0.90,
        "quality aggregation failed",
    )
    check(
        round(performance.average_latency_ms, 1) == 200.0,
        "latency aggregation failed",
    )
    check(
        round(performance.average_cost, 3) == 0.011,
        "cost aggregation failed",
    )
    check(
        round(performance.success_rate, 2) == 0.50,
        "success rate failed",
    )

    check(
        history.best_by_quality(
            ["openai:gpt-5", "qwen:qwen3"]
        ) == "openai:gpt-5",
        "best quality model failed",
    )

    check(
        history.best_by_latency(
            ["openai:gpt-5", "qwen:qwen3"]
        ) == "qwen:qwen3",
        "best latency model failed",
    )

    check(
        history.best_by_cost(
            ["openai:gpt-5", "qwen:qwen3"]
        ) == "qwen:qwen3",
        "best cost model failed",
    )

    print("HISTORY: PASS")


def test_cache() -> None:
    cache = ModelMemoryCache(
        max_entries=2,
        ttl_seconds=1.0,
    )

    cache.set(
        "openai:gpt-5",
        {"quality": 0.92},
    )

    cache.set(
        "qwen:qwen3",
        {"quality": 0.81},
    )

    check(cache.size() == 2, "cache size failed")
    check(
        cache.get("openai:gpt-5")["quality"] == 0.92,
        "cache retrieval failed",
    )

    cache.set(
        "new:model",
        {"quality": 0.88},
    )

    check(
        cache.get("openai:gpt-5") is None,
        "cache bound failed",
    )

    sleep(1.1)

    check(
        cache.get("qwen:qwen3") is None,
        "cache TTL failed",
    )

    print("CACHE: PASS")


def test_utils() -> None:
    records = build_records()

    check(
        len(filter_by_model(records, "openai:gpt-5")) == 2,
        "model filtering failed",
    )

    check(
        len(filter_by_task(records, "reasoning")) == 2,
        "task filtering failed",
    )

    check(
        len(successful_records(records)) == 2,
        "successful records failed",
    )

    check(
        len(failed_records(records)) == 1,
        "failed records failed",
    )

    check(
        round(average_quality(records), 2) == 0.87,
        "average quality failed",
    )

    check(
        round(average_latency(records), 1) == 163.3,
        "average latency failed",
    )

    check(
        round(average_cost(records), 3) == 0.008,
        "average cost failed",
    )

    check(
        round(success_rate(records), 3) == 0.667,
        "success rate failed",
    )

    check(
        len(group_by_model(records)) == 2,
        "model grouping failed",
    )

    check(
        len(group_by_task(records)) == 2,
        "task grouping failed",
    )

    quality_map = model_quality_map(records)

    check(
        round(quality_map["openai:gpt-5"], 2) == 0.90,
        "model quality map failed",
    )

    print("UTILS: PASS")


def test_validation() -> None:
    try:
        MemoryRecord(
            request_id="",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            quality_score=0.90,
            latency_ms=100,
            cost=0.01,
        )
    except ValueError:
        print("VALIDATION: PASS")
        return

    raise AssertionError(
        "invalid MemoryRecord should raise ValueError"
    )


def main() -> None:
    test_memory()
    test_history()
    test_cache()
    test_utils()
    test_validation()

    print("=" * 62)
    print("MODELNOW MODEL MEMORY TEST: PASS")
    print("=" * 62)


if __name__ == "__main__":
    main()
