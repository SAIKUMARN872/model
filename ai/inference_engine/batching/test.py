from __future__ import annotations

from ai.inference_engine.batching import (
    BatchScheduler,
    InferenceQueue,
    RequestBatcher,
)
from ai.inference_engine.batching.utils import (
    batch_size,
    same_model,
)
from ai.inference_engine.models import InferenceRequest


def make_request(
    model: str,
    content: str,
) -> InferenceRequest:
    return InferenceRequest(
        model=model,
        messages=[
            {
                "role": "user",
                "content": content,
            }
        ],
    )


def main() -> None:
    queue = InferenceQueue()

    request_one = make_request(
        "mock-model",
        "Hello",
    )
    request_two = make_request(
        "mock-model",
        "World",
    )

    queue.put(request_one)
    queue.put(request_two)

    assert queue.size == 2
    assert queue.peek() is request_one

    first = queue.get()

    assert first is request_one
    assert queue.size == 1

    print("INFERENCE QUEUE: PASS")

    batcher = RequestBatcher(
        max_batch_size=2
    )

    queue.put(request_one)

    batch = batcher.create_batch(queue)

    assert len(batch) == 2
    assert batch[0] is request_two
    assert batch[1] is request_one
    assert queue.size == 0

    print("REQUEST BATCHING: PASS")

    requests = [
        make_request("mock-model", "1"),
        make_request("mock-model", "2"),
        make_request("mock-model", "3"),
        make_request("mock-model", "4"),
        make_request("mock-model", "5"),
    ]

    batches = batcher.batch(requests)

    assert len(batches) == 3
    assert len(batches[0]) == 2
    assert len(batches[1]) == 2
    assert len(batches[2]) == 1

    print("BATCH PARTITIONING: PASS")

    scheduler = BatchScheduler(
        RequestBatcher(max_batch_size=2)
    )

    for request in requests:
        queue.put(request)

    scheduled = scheduler.schedule_all(queue)

    assert len(scheduled) == 3
    assert queue.size == 0

    print("BATCH SCHEDULING: PASS")

    assert same_model(requests)

    mixed_requests = [
        make_request("model-a", "1"),
        make_request("model-b", "2"),
    ]

    assert not same_model(mixed_requests)
    assert batch_size(requests) == 5

    print("BATCH UTILS: PASS")
    print("BATCHING TEST: PASS")


if __name__ == "__main__":
    main()
