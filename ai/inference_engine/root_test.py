from __future__ import annotations

from ai.inference_engine.constants import (
    DEFAULT_MAX_BATCH_SIZE,
    DEFAULT_MAX_RETRIES,
    DEFAULT_TIMEOUT_SECONDS,
    SUPPORTED_BACKENDS,
)
from ai.inference_engine.exceptions import (
    BackendNotFoundError,
    InferenceEngineError,
    InferenceExecutionError,
    InferenceValidationError,
)
from ai.inference_engine.models import (
    InferenceBackendType,
    InferenceRequest,
    InferenceResult,
    InferenceUsage,
)
from ai.inference_engine.schemas import (
    InferenceExecution,
    InferenceHealthReport,
)
from ai.inference_engine.utils import (
    has_messages,
    normalize_model_name,
    request_metadata,
)


def main() -> None:
    assert DEFAULT_TIMEOUT_SECONDS == 60.0
    assert DEFAULT_MAX_RETRIES == 3
    assert DEFAULT_MAX_BATCH_SIZE == 8
    assert SUPPORTED_BACKENDS == (
        "transformers",
        "vllm",
    )

    print("INFERENCE CONSTANTS: PASS")

    assert issubclass(
        InferenceValidationError,
        InferenceEngineError,
    )
    assert issubclass(
        BackendNotFoundError,
        InferenceEngineError,
    )
    assert issubclass(
        InferenceExecutionError,
        InferenceEngineError,
    )

    print("INFERENCE EXCEPTIONS: PASS")

    request = InferenceRequest(
        model=" Mock-Model ",
        messages=[
            {
                "role": "user",
                "content": "Hello",
            }
        ],
        metadata={
            "source": "local-test",
        },
    )

    result = InferenceResult(
        request_id="root-test",
        model="mock-model",
        backend=InferenceBackendType.TRANSFORMERS,
        content="Hello",
        usage=InferenceUsage(
            input_tokens=2,
            output_tokens=1,
        ),
    )

    execution = InferenceExecution(
        request=request,
        result=result,
    )

    assert execution.request is request
    assert execution.result is result

    print("INFERENCE SCHEMA: PASS")

    report = InferenceHealthReport(
        results=[]
    )

    assert report.healthy_count == 0
    assert report.unhealthy_count == 0

    print("HEALTH REPORT: PASS")

    assert normalize_model_name(
        "  Mock-Model  "
    ) == "mock-model"

    assert request_metadata(request) == {
        "source": "local-test"
    }

    assert has_messages(request)

    print("INFERENCE UTILS: PASS")
    print("INFERENCE ROOT SUPPORT TEST: PASS")


if __name__ == "__main__":
    main()
