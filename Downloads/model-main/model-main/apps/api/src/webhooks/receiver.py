"""
Webhook receiver.

Handles incoming webhook requests,
validation, authentication, and forwarding
events to webhook handlers.
"""

from __future__ import annotations

import json
from typing import Any

from fastapi import (
    HTTPException,
    Request,
    status,
)

from app.webhooks.handler import (
    webhook_handler,
    verify_webhook_signature,
)

from app.core.config import settings
from app.core.logging import logger



class WebhookReceiver:
    """
    Receives and processes webhook requests.
    """

    def __init__(self) -> None:

        self.secret = (
            settings.WEBHOOK_SECRET
        )



    async def receive(
        self,
        request: Request,
        event_type: str,
    ) -> Any:
        """
        Receive webhook event.

        Steps:
        1. Read request body
        2. Verify signature
        3. Parse payload
        4. Dispatch event
        """

        try:

            body = await request.body()


            signature = request.headers.get(
                "X-Webhook-Signature",
            )


            if self.secret:

                if not signature:

                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=(
                            "Missing webhook signature."
                        ),
                    )


                valid = await verify_webhook_signature(
                    payload=body,
                    signature=signature,
                    secret=self.secret,
                )


                if not valid:

                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=(
                            "Invalid webhook signature."
                        ),
                    )


            payload = json.loads(
                body.decode("utf-8"),
            )


            result = await webhook_handler.handle(
                event_type,
                payload,
            )


            return {
                "success": True,
                "event": event_type,
                "result": result,
            }


        except HTTPException:
            raise


        except json.JSONDecodeError:

            logger.error(
                "Invalid webhook JSON payload",
            )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload.",
            )


        except Exception as exc:

            logger.exception(
                "Webhook receiver failed",
                exc_info=exc,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Unable to process webhook."
                ),
            )



webhook_receiver = WebhookReceiver()