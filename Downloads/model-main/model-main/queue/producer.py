"""
Queue Producer

Responsible for publishing messages
to the queue system.
"""

import json
import logging
from typing import Any

from .client import get_queue_client
from .exceptions import QueuePublishError


logger = logging.getLogger(__name__)


async def publish_message(
    queue_name: str,
    message: dict[str, Any],
) -> bool:
    """
    Publish message to queue.

    Args:
        queue_name:
            Queue/topic name

        message:
            Message payload

    Returns:
        bool
    """

    try:

        client = await get_queue_client()

        payload = json.dumps(message)

        await client.publish(
            queue_name,
            payload
        )


        logger.info(
            "Message published to %s",
            queue_name
        )

        return True


    except Exception as exc:

        logger.exception(
            "Message publishing failed"
        )

        raise QueuePublishError(
            str(exc)
        )