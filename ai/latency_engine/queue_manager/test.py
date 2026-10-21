from __future__ import annotations

from .manager import QueueManager
from .priority_queue import PriorityQueue
from .scheduler import QueueScheduler
from .utils import (
    QueuePriority,
    aging_priority,
    calculate_wait_time_ms,
    clamp_priority,
    normalize_priority,
    priority_from_name,
)


def main() -> None:
    # ---------------------------------------------------------
    # Priority Queue
    # ---------------------------------------------------------

    queue = PriorityQueue[str]()

    queue.put(
        "normal",
        priority=50,
    )

    queue.put(
        "critical",
        priority=0,
    )

    queue.put(
        "high",
        priority=10,
    )

    assert queue.size == 3
    assert not queue.empty

    assert queue.peek() == "critical"
    assert queue.get() == "critical"
    assert queue.get() == "high"
    assert queue.get() == "normal"

    assert queue.empty

    print("PRIORITY ORDERING: PASS")

    queue.put(
        "first",
        priority=50,
    )

    queue.put(
        "second",
        priority=50,
    )

    assert queue.get() == "first"
    assert queue.get() == "second"

    print("FIFO SAME PRIORITY: PASS")

    # ---------------------------------------------------------
    # Queue utilities
    # ---------------------------------------------------------

    assert QueuePriority.CRITICAL == 0
    assert QueuePriority.HIGH == 10
    assert QueuePriority.NORMAL == 50
    assert QueuePriority.LOW == 100

    assert priority_from_name(
        "urgent"
    ) == QueuePriority.CRITICAL

    assert priority_from_name(
        "high"
    ) == QueuePriority.HIGH

    assert normalize_priority(
        "normal"
    ) == 50

    assert normalize_priority(
        QueuePriority.LOW
    ) == 100

    assert clamp_priority(
        -10
    ) == 0

    assert clamp_priority(
        200
    ) == 100

    assert calculate_wait_time_ms(
        queued_at=100.0,
        current_time=102.5,
    ) == 2500.0

    assert aging_priority(
        50,
        wait_time_ms=3000.0,
        aging_interval_ms=1000.0,
    ) == 47

    print("QUEUE UTILITIES: PASS")

    # ---------------------------------------------------------
    # Scheduler
    # ---------------------------------------------------------

    scheduler = QueueScheduler(
        aging_enabled=True,
        aging_interval_ms=1000.0,
    )

    scheduler.schedule(
        "normal",
        priority="normal",
        queued_at=100.0,
    )

    scheduler.schedule(
        "critical",
        priority="critical",
        queued_at=100.0,
    )

    scheduler.schedule(
        "high",
        priority="high",
        queued_at=100.0,
    )

    assert scheduler.size == 3

    assert scheduler.peek().value == "critical"

    first = scheduler.next(
        current_time=100.0
    )

    assert first.value == "critical"
    assert first.priority == 0

    second = scheduler.next(
        current_time=100.0
    )

    assert second.value == "high"
    assert second.priority == 10

    third = scheduler.next(
        current_time=100.0
    )

    assert third.value == "normal"
    assert third.priority == 50

    assert scheduler.empty

    print("QUEUE SCHEDULER: PASS")

    # ---------------------------------------------------------
    # Scheduler aging
    # ---------------------------------------------------------

    aging_scheduler = QueueScheduler(
        aging_enabled=True,
        aging_interval_ms=1000.0,
    )

    aged = aging_scheduler.schedule(
        "aged",
        priority=50,
        queued_at=100.0,
    )

    assert (
        aging_scheduler.wait_time_ms(
            aged,
            current_time=103.0,
        )
        == 3000.0
    )

    aging_scheduler.clear()

    aging_scheduler.schedule(
        "old",
        priority=50,
        queued_at=100.0,
    )

    item = aging_scheduler.next(
        current_time=103.0
    )

    assert item.priority == 47
    assert item.metadata[
        "original_priority"
    ] == 50
    assert item.metadata[
        "wait_time_ms"
    ] == 3000.0

    print("QUEUE AGING: PASS")

    # ---------------------------------------------------------
    # Queue Manager
    # ---------------------------------------------------------

    manager = QueueManager()

    manager.create(
        "inference"
    )

    assert manager.contains(
        "inference"
    )

    assert manager.names() == (
        "inference",
    )

    manager.enqueue(
        "inference",
        "normal-request",
        priority="normal",
        queued_at=100.0,
    )

    manager.enqueue(
        "inference",
        "high-request",
        priority="high",
        queued_at=100.0,
    )

    manager.enqueue(
        "inference",
        "critical-request",
        priority="critical",
        queued_at=100.0,
    )

    assert manager.size(
        "inference"
    ) == 3

    print("QUEUE MANAGER ENQUEUE: PASS")

    assert manager.dequeue(
        "inference",
        current_time=100.0,
    ).value == "critical-request"

    assert manager.dequeue(
        "inference",
        current_time=100.0,
    ).value == "high-request"

    assert manager.dequeue(
        "inference",
        current_time=100.0,
    ).value == "normal-request"

    assert manager.size(
        "inference"
    ) == 0

    print("QUEUE MANAGER DEQUEUE: PASS")

    metrics = manager.metrics(
        "inference"
    )

    assert metrics.name == "inference"
    assert metrics.size == 0
    assert metrics.enqueued == 3
    assert metrics.dequeued == 3

    print("QUEUE MANAGER METRICS: PASS")

    # ---------------------------------------------------------
    # Automatic queue creation
    # ---------------------------------------------------------

    manager.enqueue(
        "batch",
        "batch-request",
        priority="low",
    )

    assert manager.contains(
        "batch"
    )

    assert manager.size(
        "batch"
    ) == 1

    print("AUTO QUEUE CREATION: PASS")

    # ---------------------------------------------------------
    # Multiple queues
    # ---------------------------------------------------------

    manager.enqueue(
        "realtime",
        "realtime-request",
        priority="critical",
        queued_at=100.0,
    )

    manager.enqueue(
        "background",
        "background-request",
        priority="low",
    )

    all_metrics = manager.metrics()

    assert set(
        all_metrics.keys()
    ) == {
        "inference",
        "batch",
        "realtime",
        "background",
    }

    print("MULTI QUEUE MANAGEMENT: PASS")

    # ---------------------------------------------------------
    # Peek
    # ---------------------------------------------------------

    assert manager.peek(
        "batch"
    ).value == "batch-request"

    print("QUEUE PEEK: PASS")

    # ---------------------------------------------------------
    # Clear
    # ---------------------------------------------------------

    manager.clear(
        "batch"
    )

    assert manager.size(
        "batch"
    ) == 0

    manager.enqueue(
        "batch",
        "batch-1",
    )

    manager.enqueue(
        "batch",
        "batch-2",
    )

    manager.clear_all()

    assert manager.size(
        "batch"
    ) == 0

    assert manager.size(
        "realtime"
    ) == 0

    assert manager.size(
        "background"
    ) == 0

    print("QUEUE CLEAR: PASS")

    # ---------------------------------------------------------
    # Remove
    # ---------------------------------------------------------

    manager.remove(
        "background"
    )

    assert not manager.contains(
        "background"
    )

    print("QUEUE REMOVE: PASS")

    # ---------------------------------------------------------
    # Error handling
    # ---------------------------------------------------------

    try:
        manager.create(
            "inference"
        )
    except ValueError:
        pass
    else:
        raise AssertionError(
            "duplicate queue should fail"
        )

    try:
        manager.dequeue(
            "inference"
        )
    except IndexError:
        pass
    else:
        raise AssertionError(
            "empty queue should fail"
        )

    try:
        manager.size(
            "missing"
        )
    except KeyError:
        pass
    else:
        raise AssertionError(
            "missing queue should fail"
        )

    try:
        QueuePriority(999)
    except ValueError:
        pass
    else:
        raise AssertionError(
            "invalid enum value should fail"
        )

    print("QUEUE ERROR HANDLING: PASS")

    # ---------------------------------------------------------
    # Shutdown
    # ---------------------------------------------------------

    manager.close()

    assert manager.names() == ()

    print("QUEUE MANAGER SHUTDOWN: PASS")

    print(
        "MODELNOW LATENCY QUEUE MANAGER TEST: PASS"
    )


if __name__ == "__main__":
    main()

