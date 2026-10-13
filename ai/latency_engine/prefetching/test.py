from __future__ import annotations

from .predictor import (
    PredictionCandidate,
    PrefetchPredictor,
)
from .prefetcher import (
    PrefetchRequest,
    Prefetcher,
)
from .strategy import (
    PrefetchStrategy,
    should_prefetch,
)
from .utils import (
    build_prefetch_key,
    calculate_frequency,
    clamp_confidence,
    recency_score,
    weighted_score,
)


def main() -> None:
    # ---------------------------------------------------------
    # Strategy
    # ---------------------------------------------------------

    assert not should_prefetch(
        PrefetchStrategy.DISABLED,
        confidence=1.0,
    )

    assert should_prefetch(
        PrefetchStrategy.ALWAYS,
    )

    assert should_prefetch(
        PrefetchStrategy.CONFIDENCE,
        confidence=0.9,
        min_confidence=0.7,
    )

    assert not should_prefetch(
        PrefetchStrategy.CONFIDENCE,
        confidence=0.5,
        min_confidence=0.7,
    )

    assert should_prefetch(
        PrefetchStrategy.FREQUENCY,
        frequency=3,
        min_frequency=2,
    )

    assert should_prefetch(
        PrefetchStrategy.RECENCY,
        recency_score=0.9,
        min_recency_score=0.7,
    )

    print("PREFETCH STRATEGIES: PASS")

    # ---------------------------------------------------------
    # Utilities
    # ---------------------------------------------------------

    key_a = build_prefetch_key(
        "  Open   Dashboard "
    )

    key_b = build_prefetch_key(
        "open dashboard"
    )

    assert key_a == key_b
    assert key_a.startswith(
        "modelnow:prefetch:"
    )

    assert clamp_confidence(-1.0) == 0.0
    assert clamp_confidence(0.5) == 0.5
    assert clamp_confidence(2.0) == 1.0

    assert calculate_frequency(
        ["Open Dashboard", "open dashboard", "Settings"],
        "OPEN DASHBOARD",
    ) == 2

    assert recency_score(
        age_seconds=0.0,
    ) == 1.0

    assert recency_score(
        age_seconds=300.0,
        half_life_seconds=300.0,
    ) == 0.5

    assert weighted_score(
        confidence=1.0,
        frequency=1.0,
        recency=1.0,
    ) == 1.0

    print("PREFETCH UTILITIES: PASS")

    # ---------------------------------------------------------
    # Predictor
    # ---------------------------------------------------------

    predictor = PrefetchPredictor(
        max_history=10,
        min_confidence=0.5,
        max_candidates=5,
        half_life_seconds=300.0,
    )

    predictor.record(
        "Open Dashboard",
        timestamp=100.0,
    )

    predictor.record(
        "Open Dashboard",
        timestamp=110.0,
    )

    predictor.record(
        "Open Dashboard",
        timestamp=120.0,
    )

    predictor.record(
        "Open Settings",
        timestamp=105.0,
    )

    predictor.record(
        "Search Reports",
        timestamp=90.0,
    )

    assert predictor.samples == 5

    candidates = predictor.candidates(
        now=120.0,
    )

    assert len(candidates) == 3
    assert isinstance(
        candidates[0],
        PredictionCandidate,
    )

    assert candidates[0].request == (
        "open dashboard"
    )

    assert candidates[0].frequency == 3
    assert candidates[0].confidence > 0.0
    assert candidates[0].score > 0.0
    assert candidates[0].key.startswith(
        "modelnow:prefetch:"
    )

    prediction = predictor.predict(
        now=120.0,
    )

    assert prediction is not None
    assert prediction.request == (
        "open dashboard"
    )

    assert predictor.predict_next(
        now=120.0,
    ) == "open dashboard"

    print("PREFETCH PREDICTOR: PASS")

    predictor.clear()

    assert predictor.samples == 0
    assert predictor.predict() is None

    print("PREDICTOR CLEAR: PASS")

    # ---------------------------------------------------------
    # Prefetcher
    # ---------------------------------------------------------

    executed: list[str] = []

    def handler(
        request: PrefetchRequest,
    ) -> None:
        executed.append(
            request.request
        )

    predictor = PrefetchPredictor(
        min_confidence=0.5,
    )

    predictor.record(
        "Open Dashboard",
        timestamp=100.0,
    )

    predictor.record(
        "Open Dashboard",
        timestamp=110.0,
    )

    prefetcher = Prefetcher(
        predictor,
        strategy=PrefetchStrategy.CONFIDENCE,
        min_confidence=0.5,
        handler=handler,
    )

    candidate = prefetcher.predicted(
        now=110.0,
    )

    assert candidate is not None
    assert candidate.request == (
        "open dashboard"
    )

    print("PREFETCH PREDICTION: PASS")

    assert prefetcher.should_prefetch(
        candidate
    )

    request = prefetcher.create_request(
        candidate
    )

    assert request is not None
    assert isinstance(
        request,
        PrefetchRequest,
    )

    assert request.request == (
        "open dashboard"
    )

    print("PREFETCH REQUEST: PASS")

    result = prefetcher.execute(
        request
    )

    assert result.started
    assert result.completed
    assert result.success
    assert result.error is None
    assert executed == [
        "open dashboard"
    ]

    print("PREFETCH EXECUTION: PASS")

    cached = prefetcher.execute(
        request
    )

    assert not cached.started
    assert cached.completed
    assert cached.success
    assert cached.metadata["cached"] is True

    print("PREFETCH REUSE: PASS")

    state = prefetcher.state(
        "open dashboard"
    )

    assert state is not None
    assert state.success
    assert state.completed_at is not None

    print("PREFETCH STATE: PASS")

    # ---------------------------------------------------------
    # Handler failure
    # ---------------------------------------------------------

    failing = Prefetcher(
        PrefetchPredictor(
            min_confidence=0.5,
        ),
        strategy=PrefetchStrategy.ALWAYS,
        handler=lambda request: (
            (_ for _ in ()).throw(
                RuntimeError("prefetch failed")
            )
        ),
    )

    failing_request = PrefetchRequest(
        request="test request",
        key=build_prefetch_key(
            "test request"
        ),
        confidence=1.0,
        score=1.0,
    )

    failed = failing.execute(
        failing_request
    )

    assert failed.started
    assert failed.completed
    assert not failed.success
    assert failed.error == (
        "prefetch failed"
    )

    print("PREFETCH FAILURE: PASS")

    # ---------------------------------------------------------
    # Clear
    # ---------------------------------------------------------

    prefetcher.clear()

    assert prefetcher.completed_count == 0
    assert prefetcher.state(
        "open dashboard"
    ) is None

    print("PREFETCH CLEAR: PASS")

    print(
        "MODELNOW LATENCY PREFETCHING TEST: PASS"
    )


if __name__ == "__main__":
    main()
