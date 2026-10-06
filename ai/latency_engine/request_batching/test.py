from __future__ import annotations

import asyncio

from .batcher import (
    RequestBatcher,
    RequestBatch,
)
from .dispatcher import (
    BatchDispatchError,
    BatchDispatcher,
)
from .scheduler import BatchScheduler
from .utils import (
    can_add_to_batch,
    chunk_sequence,
    estimate_tokens,
    validate_batch_size,
    validate_token_limit,
    validate_wait_ms,
)


def test_utils() -> None:
    assert validate_batch_size(8) == 8
    assert validate_token_limit(100) == 100
    assert validate_wait_ms(25) == 25.0

    assert estimate_tokens("hello") == 2
    assert estimate_tokens("") == 0

    assert can_add_to_batch(
        1,
        10,
        max_batch_size=4,
        max_tokens=100,
        item_tokens=10,
    )

    assert not can_add_to_batch(
        4,
        10,
        max_batch_size=4,
        max_tokens=100,
        item_tokens=10,
    )

    assert chunk_sequence(
        list(range(5)),
        batch_size=2,
    ) == [
        [0, 1],
        [2, 3],
        [4],
    ]

    print("UTILITIES: PASS")


def test_batcher() -> None:
    batcher = RequestBatcher(
        max_batch_size=2,
        max_tokens=100,
    )

    item1 = batcher.add(
        "r1",
        "hello",
        metadata={"tier": "slm"},
    )

    item2 = batcher.add(
        "r2",
        "world",
    )

    assert item1.request_id == "r1"
    assert item2.request_id == "r2"
    assert batcher.size == 2
    assert not batcher.can_accept("third")

    batch = batcher.flush(
        batch_id="batch-1",
        metadata={"provider": "test"},
    )

    assert isinstance(batch, RequestBatch)
    assert batch.batch_id == "batch-1"
    assert batch.size == 2
    assert batch.items[0].request_id == "r1"
    assert batch.items[1].request_id == "r2"
    assert batch.metadata["provider"] == "test"
    assert batcher.empty

    print("BATCHER: PASS")


def test_batch_limits() -> None:
    batcher = RequestBatcher(
        max_batch_size=2,
        max_tokens=2,
    )

    batcher.add(
        "r1",
        "hello",
    )

    try:
        batcher.add(
            "r2",
            "this payload is too large",
        )
    except ValueError:
        pass
    else:
        raise AssertionError(
            "token limit was not enforced"
        )

    batcher.clear()

    batcher.add(
        "r1",
        "a",
    )
    batcher.add(
        "r2",
        "b",
    )

    try:
        batcher.add(
            "r3",
            "c",
        )
    except ValueError:
        pass
    else:
        raise AssertionError(
            "batch size limit was not enforced"
        )

    print("BATCH LIMITS: PASS")


def test_scheduler() -> None:
    scheduler = BatchScheduler(
        max_batch_size=2,
        max_tokens=100,
        max_wait_ms=25,
    )

    scheduler.add(
        "r1",
        "hello",
        queued_at=100.0,
    )

    assert not scheduler.should_flush(
        current_time=100.010
    )

    assert scheduler.should_flush(
        current_time=100.025
    )

    batch = scheduler.flush(
        batch_id="scheduled-1"
    )

    assert batch.size == 1
    assert scheduler.empty

    scheduler.add(
        "r2",
        "hello",
        queued_at=100.0,
    )

    scheduler.add(
        "r3",
        "world",
        queued_at=100.0,
    )

    assert scheduler.should_flush(
        current_time=100.001
    )

    print("SCHEDULER: PASS")


async def test_dispatcher() -> None:
    batcher = RequestBatcher()

    batcher.add(
        "r1",
        "hello",
    )
    batcher.add(
        "r2",
        "world",
    )

    batch = batcher.flush(
        batch_id="dispatch-1"
    )

    dispatcher = BatchDispatcher(
        lambda current_batch: {
            item.request_id: item.payload.upper()
            for item in current_batch.items
        }
    )

    result = await dispatcher.dispatch(
        batch
    )

    assert result.batch_id == "dispatch-1"
    assert result.succeeded == 2
    assert result.failed == 0
    assert result.total == 2
    assert result.results["r1"] == "HELLO"
    assert result.results["r2"] == "WORLD"

    successful, failed = (
        BatchDispatcher.split_results(
            batch,
            result.results,
        )
    )

    assert set(successful) == {
        "r1",
        "r2",
    }
    assert failed == {}

    print("DISPATCHER: PASS")


async def test_async_dispatcher() -> None:
    batcher = RequestBatcher()

    batcher.add(
        "r1",
        "hello",
    )

    batch = batcher.flush(
        batch_id="async-1"
    )

    async def handler(
        current_batch: RequestBatch,
    ) -> list[str]:
        await asyncio.sleep(0)
        return [
            item.payload.upper()
            for item in current_batch.items
        ]

    dispatcher = BatchDispatcher(
        handler
    )

    result = await dispatcher.dispatch(
        batch
    )

    assert result.succeeded == 1
    assert result.results["r1"] == "HELLO"

    print("ASYNC DISPATCH: PASS")


async def test_dispatch_failure() -> None:
    batcher = RequestBatcher()

    batcher.add(
        "r1",
        "hello",
    )

    batch = batcher.flush(
        batch_id="failure-1"
    )

    dispatcher = BatchDispatcher(
        None
    )

    try:
        await dispatcher.dispatch(
            batch
        )
    except BatchDispatchError:
        pass
    else:
        raise AssertionError(
            "missing handler should fail"
        )

    print("DISPATCH FAILURE: PASS")


async def test_end_to_end() -> None:
    scheduler = BatchScheduler(
        max_batch_size=3,
        max_tokens=100,
        max_wait_ms=50,
    )

    scheduler.add(
        "request-1",
        {"prompt": "hello"},
        queued_at=100.0,
    )

    scheduler.add(
        "request-2",
        {"prompt": "world"},
        queued_at=100.0,
    )

    scheduler.add(
        "request-3",
        {"prompt": "model"},
        queued_at=100.0,
    )

    assert scheduler.should_flush(
        current_time=100.001
    )

    batch = scheduler.flush(
        batch_id="e2e-1"
    )

    dispatcher = BatchDispatcher(
        lambda current_batch: {
            item.request_id: {
                "output": item.payload[
                    "prompt"
                ].upper(),
                "batch_id": current_batch.batch_id,
            }
            for item in current_batch.items
        }
    )

    result = await dispatcher.dispatch(
        batch
    )

    assert result.succeeded == 3
    assert result.results[
        "request-1"
    ]["output"] == "HELLO"

    assert result.results[
        "request-2"
    ]["output"] == "WORLD"

    assert result.results[
        "request-3"
    ]["output"] == "MODEL"

    print("END-TO-END BATCH FLOW: PASS")


def main() -> None:
    test_utils()
    test_batcher()
    test_batch_limits()
    test_scheduler()

    asyncio.run(
        test_dispatcher()
    )

    asyncio.run(
        test_async_dispatcher()
    )

    asyncio.run(
        test_dispatch_failure()
    )

    asyncio.run(
        test_end_to_end()
    )

    print(
        "MODELNOW LATENCY REQUEST BATCHING TEST: PASS"
    )


if __name__ == "__main__":
    main()
