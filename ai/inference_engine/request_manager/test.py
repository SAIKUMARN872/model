from __future__ import annotations

from ai.inference_engine.models import InferenceRequest
from ai.inference_engine.request_manager import (
    RequestManager,
    RequestParser,
    RequestValidator,
)


def main() -> None:
    parser = RequestParser()

    request = parser.parse(
        {
            "model": "mock-model",
            "messages": [
                {
                    "role": "user",
                    "content": "Hello ModelNow",
                }
            ],
            "temperature": 0.5,
            "max_tokens": 100,
        }
    )

    assert isinstance(
        request,
        InferenceRequest,
    )

    assert request.model == "mock-model"
    assert len(request.messages) == 1
    assert request.temperature == 0.5
    assert request.max_tokens == 100

    print("REQUEST PARSING: PASS")

    validator = RequestValidator()

    validator.validate(request)

    print("REQUEST VALIDATION: PASS")

    manager = RequestManager()

    managed_request = manager.parse(
        {
            "model": "mock-model",
            "messages": [
                {
                    "role": "user",
                    "content": "Test request",
                }
            ],
        }
    )

    assert managed_request.model == "mock-model"

    print("REQUEST MANAGEMENT: PASS")

    invalid_requests = [
        InferenceRequest(
            model="",
            messages=[
                {
                    "role": "user",
                    "content": "Hello",
                }
            ],
        ),
        InferenceRequest(
            model="mock-model",
            messages=[],
        ),
        InferenceRequest(
            model="mock-model",
            messages=[
                {
                    "role": "user",
                }
            ],
        ),
    ]

    for invalid_request in invalid_requests:
        try:
            validator.validate(
                invalid_request
            )
        except (
            ValueError,
            TypeError,
        ):
            pass
        else:
            raise AssertionError(
                "Invalid request was accepted."
            )

    print("INVALID REQUEST REJECTION: PASS")

    try:
        manager.parse(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": "Missing model",
                    }
                ]
            }
        )
    except ValueError:
        pass
    else:
        raise AssertionError(
            "Missing model was accepted."
        )

    print("MISSING FIELD VALIDATION: PASS")
    print("REQUEST MANAGER TEST: PASS")


if __name__ == "__main__":
    main()
