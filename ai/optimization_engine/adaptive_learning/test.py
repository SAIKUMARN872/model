"""Regression tests for the adaptive learning package."""

from datetime import datetime, timezone
from decimal import Decimal

from .feedback import FeedbackCollector
from .learner import AdaptiveLearner, create_adaptive_learner
from .models import (
    FeedbackSignal,
    FeedbackType,
    LearningObjective,
    LearningObservation,
)


def make_observation(
    observation_id: str,
    model: str,
    provider: str,
    reward: float,
    cost: float = 0.01,
    latency_ms: float = 100,
    quality: float = 0.9,
    success: bool = True,
) -> LearningObservation:
    return LearningObservation(
        observation_id=observation_id,
        request_id=f"request-{observation_id}",
        model=model,
        provider=provider,
        objective=LearningObjective.BALANCED,
        reward=Decimal(str(reward)),
        cost=Decimal(str(cost)),
        latency_ms=latency_ms,
        quality=Decimal(str(quality)),
        success=success,
        timestamp=datetime.now(timezone.utc),
    )


def run_tests() -> None:
    # 1. Construction and validation.
    learner = create_adaptive_learner()
    assert isinstance(learner, AdaptiveLearner)
    assert learner.rank() == []
    assert learner.best_candidate() is None
    try:
        AdaptiveLearner(learning_rate=0)
    except ValueError:
        pass
    else:
        raise AssertionError("Invalid learning rate was accepted")

    # 2. Observations and candidate scoring.
    learner.observe(make_observation("1", "model-a", "provider-a", 0.9))
    learner.observe(make_observation("2", "model-a", "provider-a", 0.8))
    learner.observe(make_observation("3", "model-b", "provider-b", -0.8))
    scores = learner.score_candidates()
    assert len(scores) == 2
    score_a = learner.score("model-a", "provider-a")
    assert score_a is not None
    assert score_a.sample_count == 2
    assert score_a.score > 0

    # 3. Ranking and best candidate.
    ranked = learner.rank()
    assert ranked[0].model == "model-a"
    assert learner.best_candidate() == ranked[0]

    # 4. Objective-specific cost and latency scoring.
    cost_learner = AdaptiveLearner(objective=LearningObjective.COST)
    cost_learner.observe(
        make_observation("cheap", "cheap-model", "provider", 0.1, cost=0.01)
    )
    cost_learner.observe(
        make_observation("expensive", "expensive-model", "provider", 0.1, cost=0.5)
    )
    cost_ranked = cost_learner.rank()
    assert cost_ranked[0].model == "cheap-model"

    latency_learner = AdaptiveLearner(objective=LearningObjective.LATENCY)
    latency_learner.observe(
        make_observation("fast", "fast-model", "provider", 0.1, latency_ms=20)
    )
    latency_learner.observe(
        make_observation("slow", "slow-model", "provider", 0.1, latency_ms=900)
    )
    assert latency_learner.rank()[0].model == "fast-model"

    # 5. Feedback collector integration.
    collector = FeedbackCollector()
    feedback_learner = AdaptiveLearner(feedback_collector=collector)
    feedback = collector.record(
        request_id="feedback-request",
        feedback_type=FeedbackType.EXPLICIT,
        signal=FeedbackSignal.POSITIVE,
        value=Decimal("1"),
        model="liked-model",
        provider="provider",
    )
    feedback_learner.record_feedback(feedback)
    feedback_score = feedback_learner.score("liked-model", "provider")
    assert feedback_score is not None
    assert feedback_score.score > 0
    assert feedback_score.sample_count == 1

    # 6. State, length, batch insertion, and reset.
    state = learner.state()
    assert state.total_observations == 3
    assert len(learner) == 3

    batch_learner = AdaptiveLearner()
    added = batch_learner.observe_many([
        make_observation("batch-1", "m1", "p1", 0.2),
        make_observation("batch-2", "m2", "p2", 0.3),
    ])
    assert added == 2
    assert len(batch_learner) == 2
    batch_learner.reset()
    assert len(batch_learner) == 0
    assert batch_learner.rank() == []

    # 7. Input validation.
    try:
        learner.observe("not-an-observation")
    except TypeError:
        pass
    else:
        raise AssertionError("Invalid observation was accepted")

    print("ADAPTIVE LEARNING TESTS: PASS")
    print("TEST GROUPS: 7")
    print("CONSTRUCTION: PASS")
    print("OBSERVATIONS AND SCORING: PASS")
    print("RANKING: PASS")
    print("COST AND LATENCY OBJECTIVES: PASS")
    print("FEEDBACK INTEGRATION: PASS")
    print("STATE AND RESET: PASS")
    print("INPUT VALIDATION: PASS")


if __name__ == "__main__":
    run_tests()
