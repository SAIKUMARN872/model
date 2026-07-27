"""
Queue Package

Provides message queue functionality.

Supports:
- Queue client initialization
- Message publishing
- Message consuming
- Background task processing
"""

from .client import (
    QueueClient,
    get_queue_client,
)

from .producer import (
    publish_message,
)

from .consumer import (
    consume_message,
)


from .exceptions import (
    QueueException,
    QueueConnectionError,
    QueuePublishError,
    QueueConsumeError,
)


__all__ = [
    "QueueClient",
    "get_queue_client",
    "publish_message",
    "consume_message",
    "QueueException",
    "QueueConnectionError",
    "QueuePublishError",
    "QueueConsumeError",
]