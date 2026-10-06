from __future__ import annotations

from .accelerator import ResponseAccelerator
from .optimizer import (
    AccelerationStrategy,
    ResponseOptimizer,
)
from .predictor import ResponsePredictor
from .utils import (
    calculate_latency_reduction_ms,
    calculate_speedup_percent,
    estimate_tokens,
    response_size_bytes,
    should_accelerate,
    validate_buffer_size,
    validate_latency_ms,
    validate_percentage,
)


def check(name: str, condition: bool) -> None:
    if not condition:
        raise AssertionError(f"{name}: FAIL")

    print(f"{name}: PASS")


def test_utils() -> None:
    check(
        "LATENCY VALIDATION",
        validate_latency_ms(100) == 100.0,
    )
    check(
        "PERCENTAGE VALIDATION",
        validate_percentage(5) == 5.0,
    )
    check(
        "BUFFER SIZE VALIDATION",
        validate_buffer_size(1024) == 1024,
    )
    check(
        "TOKEN ESTIMATION",
        estimate_tokens("hello") == 2,
    )
    check(
        "RESPONSE SIZE",
        response_size_bytes("hello") == 5,
    )
    check(
        "LATENCY REDUCTION",
        calculate_latency_reduction_ms(1000, 800) == 200,
    )
    check(
        "SPEEDUP CALCULATION",
        calculate_speedup_percent(1000, 800) == 20,
    )
    check(
        "ACCELERATION THRESHOLD",
        should_accelerate(1000, target_latency_ms=500),
    )


def test_predictor() -> None:
    predictor = ResponsePredictor(
        target_latency_ms=500,
    )

    predictor.record(
        "openai:gpt-5",
        "openai",
        1000,
    )
    predictor.record(
        "openai:gpt-5",
        "openai",
        800,
    )

    result = predictor.predict(
        "openai:gpt-5",
        "openai",
        "hello world",
    )

    check(
        "PREDICTED LATENCY",
        result.predicted_latency_ms == 900,
    )
    check(
        "PREDICTION CONFIDENCE",
        result.confidence == 0.2,
    )
    check(
        "PREDICTION ACCELERATION FLAG",
        result.should_accelerate,
    )
    check(
        "PREDICTOR HISTORY",
        predictor.history(
            "openai:gpt-5",
            "openai",
        ) == (1000.0, 800.0),
    )


def test_optimizer() -> None:
    optimizer = ResponseOptimizer(
        target_latency_ms=500,
    )

    streaming = optimizer.optimize(
        "hello",
        predicted_latency_ms=1000,
        streaming_requested=True,
    )

    check(
        "STREAMING PLAN",
        streaming.strategy == AccelerationStrategy.STREAMING,
    )

    normal = optimizer.optimize(
        "hello",
        predicted_latency_ms=200,
    )

    check(
        "NO-OP PLAN",
        normal.strategy == AccelerationStrategy.NONE,
    )

    compression_optimizer = ResponseOptimizer(
        target_latency_ms=500,
        compression_enabled=True,
    )

    compression = compression_optimizer.optimize(
        "hello",
        predicted_latency_ms=1000,
    )

    check(
        "COMPRESSION PLAN",
        compression.strategy
        == AccelerationStrategy.RESPONSE_COMPRESSION,
    )


def test_accelerator() -> None:
    accelerator = ResponseAccelerator(
        predictor=ResponsePredictor(
            target_latency_ms=500,
        ),
        optimizer=ResponseOptimizer(
            target_latency_ms=500,
        ),
    )

    accelerator.record_latency(
        "openai:gpt-5",
        "openai",
        1000,
    )

    result = accelerator.accelerate(
        "hello world",
        model_id="openai:gpt-5",
        provider="openai",
        streaming_requested=True,
    )

    check(
        "END-TO-END RESPONSE",
        result.response == "hello world",
    )
    check(
        "END-TO-END PREDICTION",
        result.prediction.predicted_latency_ms == 1000,
    )
    check(
        "END-TO-END STRATEGY",
        result.plan.strategy == AccelerationStrategy.STREAMING,
    )
    check(
        "ORIGINAL RESPONSE PRESERVED",
        not result.accelerated,
    )
    check(
        "RESULT METADATA",
        result.metadata["provider"] == "openai",
    )


def test_validation() -> None:
    try:
        validate_latency_ms(-1)
    except ValueError:
        pass
    else:
        raise AssertionError(
            "Negative latency should be rejected"
        )

    try:
        validate_buffer_size(0)
    except ValueError:
        pass
    else:
        raise AssertionError(
            "Zero buffer size should be rejected"
        )

    check(
        "INPUT VALIDATION",
        True,
    )


def main() -> None:
    print("MODELNOW RESPONSE ACCELERATION TEST")
    test_utils()
    test_predictor()
    test_optimizer()
    test_accelerator()
    test_validation()
    print("MODELNOW RESPONSE ACCELERATION TEST: PASS")


if __name__ == "__main__":
    main()
