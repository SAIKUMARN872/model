from __future__ import annotations

import json

from ai.inference_engine.models import (
    InferenceBackendType,
    InferenceResult,
    InferenceUsage,
)
from ai.inference_engine.response_manager import (
    ResponseFormatter,
    ResponseManager,
    ResponseSerializer,
)


def main() -> None:
    result = InferenceResult(
        request_id="test-request",
        model="mock-model",
        backend=InferenceBackendType.TRANSFORMERS,
        content="Hello from ModelNow",
        usage=InferenceUsage(
            input_tokens=10,
            output_tokens=20,
            total_tokens=30,
            estimated_cost=0.05,
        ),
        latency_ms=125.5,
        time_to_first_token_ms=20.0,
        finish_reason="stop",
        tool_calls=[],
        metadata={
            "source": "local-test",
        },
    )

    formatter = ResponseFormatter()

    formatted = formatter.format(result)

    assert formatted["request_id"] == "test-request"
    assert formatted["model"] == "mock-model"
    assert formatted["backend"] == "transformers"
    assert formatted["content"] == "Hello from ModelNow"
    assert formatted["status"] == "completed"

    assert formatted["usage"]["input_tokens"] == 10
    assert formatted["usage"]["output_tokens"] == 20
    assert formatted["usage"]["total_tokens"] == 30

    print("RESPONSE FORMATTING: PASS")

    serializer = ResponseSerializer()

    response_dict = serializer.to_dict(
        formatted
    )

    assert response_dict["content"] == (
        "Hello from ModelNow"
    )

    print("RESPONSE DICTIONARY: PASS")

    response_json = serializer.to_json(
        formatted
    )

    decoded = json.loads(
        response_json
    )

    assert decoded["request_id"] == (
        "test-request"
    )

    assert decoded["content"] == (
        "Hello from ModelNow"
    )

    print("RESPONSE JSON SERIALIZATION: PASS")

    manager = ResponseManager()

    managed_dict = manager.to_dict(
        result
    )

    managed_json = manager.to_json(
        result
    )

    assert managed_dict["model"] == (
        "mock-model"
    )

    assert json.loads(
        managed_json
    )["model"] == "mock-model"

    print("RESPONSE MANAGEMENT: PASS")
    print("RESPONSE MANAGER TEST: PASS")


if __name__ == "__main__":
    main()
