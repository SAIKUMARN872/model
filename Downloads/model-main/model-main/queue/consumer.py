"""
Queue Consumer

Responsible for consuming messages
from queues and executing handlers.
"""

import logging
from typing import Callable, Awaitable, Any

from .client import get_queue_client


logger = logging.getLogger(__name__)


async def consume_message(
    queue_name: str,
    handler: Callable[
        [dict[str, Any]],
        Awaitable[None]
    ],
):
    """
    Consume messages from queue.

    Args:
        queue_name:
            Queue name

        handler:
            Async message processor
    """

    client = await get_queue_client()


    async for message in client.consume(
        queue_name
    ):

        try:

            await handler(message)


            logger.info(
                "Message processed successfully"
            )


        except Exception as exc:

            logger.exception(
                "Message processing failed",
                exc_info=exc,
            )