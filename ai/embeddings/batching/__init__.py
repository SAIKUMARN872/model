"""
Embedding batching package.

Provides asynchronous request queues, dynamic batching,
scheduling, retries, priorities and embedding execution.
"""

from .batcher import (
    BatchExecutionError,
    BatcherConfig,
    EmbeddingBatch,
    EmbeddingBatcher,
    BatchResult,
)

from .queue import (
    BatchQueueError,
    EmbeddingQueue,
    EmbeddingRequest,
    QueueClosedError,
)

from .scheduler import (
    EmbeddingScheduler,
    SchedulerConfig,
    SchedulerError,
    SchedulerNotRunningError,
)

from .utils import (
    chunked,
    current_time,
    elapsed_ms,
    estimate_item_tokens,
    estimate_tokens,
    is_async_callable,
    maybe_await,
    normalize_batch_size,
    normalize_timeout,
    safe_exception_message,
    validate_embedding,
    validate_embeddings,
)


__all__ = [
    # Batcher
    "EmbeddingBatcher",
    "EmbeddingBatch",
    "BatchResult",
    "BatcherConfig",
    "BatchExecutionError",

    # Queue
    "EmbeddingQueue",
    "EmbeddingRequest",
    "BatchQueueError",
    "QueueClosedError",

    # Scheduler
    "EmbeddingScheduler",
    "SchedulerConfig",
    "SchedulerError",
    "SchedulerNotRunningError",

    # Utilities
    "current_time",
    "elapsed_ms",
    "maybe_await",
    "is_async_callable",
    "estimate_tokens",
    "estimate_item_tokens",
    "normalize_batch_size",
    "normalize_timeout",
    "validate_embedding",
    "validate_embeddings",
    "chunked",
    "safe_exception_message",
]


__version__ = "1.0.0"