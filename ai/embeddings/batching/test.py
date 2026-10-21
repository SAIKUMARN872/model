from ai.embeddings.exceptions import EmbeddingValidationError
from ai.embeddings.batching import (
    EmbeddingBatcher,
    EmbeddingQueue,
    EmbeddingBatchScheduler,
)
from ai.embeddings.batching.utils import (
    estimate_batches,
    validate_batch_size,
)


def run_tests():
    batcher = EmbeddingBatcher(batch_size=2, max_batch_size=4)
    batches = batcher.split(["alpha", "beta", "gamma", "delta", "epsilon"])
    assert batches == [
        ["alpha", "beta"],
        ["gamma", "delta"],
        ["epsilon"],
    ]
    assert batcher.count_batches(5) == 3
    assert batcher.count_batches(0) == 0
    print("PASS: batching, order preservation, and batch counts")

    try:
        EmbeddingBatcher(batch_size=5, max_batch_size=4)
    except EmbeddingValidationError:
        pass
    else:
        raise AssertionError("Invalid batch size was accepted")
    print("PASS: batch-size validation")

    queue = EmbeddingQueue[str](max_size=3)
    queue.put("first")
    queue.put("second")
    queue.put("third")
    assert queue.get() == "first"
    assert queue.get_many(2) == ["second", "third"]
    assert queue.is_empty()
    print("PASS: FIFO queue and batch dequeue")

    queue.put("item")
    assert queue.clear() == 1
    assert len(queue) == 0

    try:
        queue.get()
    except IndexError:
        pass
    else:
        raise AssertionError("Empty queue did not raise IndexError")
    print("PASS: queue clearing and empty handling")

    bounded = EmbeddingQueue[int](max_size=1)
    bounded.put(1)
    try:
        bounded.put(2)
    except OverflowError:
        pass
    else:
        raise AssertionError("Full queue did not reject another item")
    print("PASS: queue capacity enforcement")

    scheduler = EmbeddingBatchScheduler(batch_size=3, max_batch_size=5)
    scheduled = scheduler.schedule(8)
    assert [item.item_count for item in scheduled] == [3, 3, 2]
    assert len({item.batch_id for item in scheduled}) == 3
    assert scheduler.schedule(0) == []
    print("PASS: batch scheduling and unique batch IDs")

    assert validate_batch_size(4, 8) == 4
    assert estimate_batches(9, 4) == 3
    assert estimate_batches(0, 4) == 0
    print("PASS: batching utility validation and estimates")

    print("MODELNOW EMBEDDING BATCHING TEST: PASS")


if __name__ == "__main__":
    run_tests()
