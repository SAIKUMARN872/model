from __future__ import annotations

from time import sleep

from .feedback import FeedbackStore, RoutingFeedback
from .optimizer import LearningOptimizer
from .trainer import LearningTrainer
from .utils import (
    average_cost,
    average_latency,
    average_quality,
    failed_feedback,
    filter_by_model,
    filter_by_task,
    group_by_model,
    group_by_task,
    model_cost_map,
    model_latency_map,
    model_quality_map,
    model_success_map,
    normalize_model_id,
    normalize_task_type,
    successful_feedback,
    success_rate,
)


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def build_feedback() -> list[RoutingFeedback]:
    return [
        RoutingFeedback(
            request_id="r1",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            task_type="reasoning",
            quality_score=0.92,
            latency_ms=180,
            cost=0.010,
        ),
        RoutingFeedback(
            request_id="r2",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            task_type="reasoning",
            quality_score=0.88,
            latency_ms=220,
            cost=0.012,
            success=False,
        ),
        RoutingFeedback(
            request_id="r3",
            model_id="qwen:qwen3",
            provider="qwen",
            tier="slm",
            task_type="reasoning",
            quality_score=0.81,
            latency_ms=90,
            cost=0.002,
        ),
        RoutingFeedback(
            request_id="r4",
            model_id="qwen:qwen3",
            provider="qwen",
            tier="slm",
            task_type="general",
            quality_score=0.84,
            latency_ms=100,
            cost=0.003,
        ),
    ]


def test_feedback() -> None:
    store = FeedbackStore(max_records=3)
    records = build_feedback()

    store.add(records[0])
    store.add(records[1])

    check(store.count() == 2, "feedback count failed")
    check(
        store.get("r1") is not None,
        "feedback lookup failed",
    )

    store.add_many([records[2], records[3]])

    check(
        store.count() == 3,
        "feedback bound failed",
    )

    check(
        store.get("r1") is None,
        "old feedback should be evicted",
    )

    check(
        len(store.for_model("qwen:qwen3")) == 2,
        "model feedback filtering failed",
    )

    check(
        len(store.for_task("reasoning")) == 2,
        "task feedback filtering failed",
    )

    check(
        len(store.recent(2)) == 2,
        "recent feedback failed",
    )

    print("FEEDBACK: PASS")


def test_optimizer() -> None:
    feedback = build_feedback()
    optimizer = LearningOptimizer()

    ranked = optimizer.rank(
        feedback,
        ["openai:gpt-5", "qwen:qwen3"],
    )

    check(
        len(ranked) == 2,
        "optimizer ranking failed",
    )

    check(
        ranked[0].model_id == "qwen:qwen3",
        "optimizer best model failed",
    )

    score = optimizer.score(
        feedback,
        "qwen:qwen3",
    )

    check(
        score.samples == 2,
        "optimizer sample count failed",
    )

    check(
        0.0 <= score.learning_score <= 1.0,
        "learning score range failed",
    )

    check(
        optimizer.best_model(feedback)
        == "qwen:qwen3",
        "best model selection failed",
    )

    print("OPTIMIZER: PASS")


def test_trainer() -> None:
    feedback = build_feedback()
    trainer = LearningTrainer()

    result = trainer.train(
        feedback,
        "reasoning",
    )

    check(
        result.task_type == "reasoning",
        "trainer task failed",
    )

    check(
        result.samples == 3,
        "trainer sample count failed",
    )

    check(
        result.models_considered == 2,
        "trainer model count failed",
    )

    check(
        result.best_model == "qwen:qwen3",
        "trainer best model failed",
    )

    check(
        len(result.ranked_models) == 2,
        "trainer ranking failed",
    )

    results = trainer.train_all(feedback)

    check(
        len(results) == 2,
        "train_all task count failed",
    )

    print("TRAINER: PASS")


def test_utils() -> None:
    feedback = build_feedback()

    check(
        normalize_model_id(" OpenAI:GPT-5 ")
        == "openai:gpt-5",
        "model normalization failed",
    )

    check(
        normalize_task_type(" Reasoning ")
        == "reasoning",
        "task normalization failed",
    )

    check(
        len(filter_by_model(
            feedback,
            "openai:gpt-5",
        )) == 2,
        "model filter failed",
    )

    check(
        len(filter_by_task(
            feedback,
            "reasoning",
        )) == 3,
        "task filter failed",
    )

    check(
        len(successful_feedback(feedback)) == 3,
        "successful feedback failed",
    )

    check(
        len(failed_feedback(feedback)) == 1,
        "failed feedback failed",
    )

    check(
        round(average_quality(feedback), 3)
        == 0.863,
        "quality average failed",
    )

    check(
        round(average_latency(feedback), 1)
        == 147.5,
        "latency average failed",
    )

    check(
        round(average_cost(feedback), 3)
        == 0.007,
        "cost average failed",
    )

    check(
        round(success_rate(feedback), 3)
        == 0.75,
        "success rate failed",
    )

    check(
        len(group_by_model(feedback)) == 2,
        "model grouping failed",
    )

    check(
        len(group_by_task(feedback)) == 2,
        "task grouping failed",
    )

    quality = model_quality_map(feedback)

    check(
        round(quality["openai:gpt-5"], 2)
        == 0.90,
        "quality map failed",
    )

    success = model_success_map(feedback)

    check(
        round(success["openai:gpt-5"], 2)
        == 0.50,
        "success map failed",
    )

    latency = model_latency_map(feedback)

    check(
        round(latency["qwen:qwen3"], 1)
        == 95.0,
        "latency map failed",
    )

    costs = model_cost_map(feedback)

    check(
        round(costs["qwen:qwen3"], 3)
        == 0.003,
        "cost map failed",
    )

    print("UTILS: PASS")


def test_validation() -> None:
    try:
        RoutingFeedback(
            request_id="",
            model_id="openai:gpt-5",
            provider="openai",
            tier="llm",
            task_type="reasoning",
            quality_score=0.90,
            latency_ms=100,
            cost=0.01,
        )
    except ValueError:
        print("VALIDATION: PASS")
        return

    raise AssertionError(
        "invalid RoutingFeedback should raise ValueError"
    )


def main() -> None:
    test_feedback()
    test_optimizer()
    test_trainer()
    test_utils()
    test_validation()

    print("=" * 62)
    print("MODELNOW LEARNING ROUTER TEST: PASS")
    print("=" * 62)


if __name__ == "__main__":
    main()
