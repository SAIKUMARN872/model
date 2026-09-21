"""
Webhook handlers.

Processes incoming webhook events from
external services such as:
- Payment providers
- AI providers
- Storage providers
- External integrations
"""

from __future__ import annotations

from typing import Any

from fastapi import HTTPException, status

from app.core.logging import logger



class WebhookHandler:
    """
    Base webhook handler.

    Responsible for validating and processing
    webhook events.
    """

    def __init__(self) -> None:

        self.handlers: dict[str, Any] = {}



    def register(
        self,
        event_type: str,
        handler,
    ) -> None:
        """
        Register webhook event handler.
        """

        self.handlers[event_type] = handler



    async def handle(
        self,
        event_type: str,
        payload: dict[str, Any],
    ) -> Any:
        """
        Process webhook event.
        """

        if event_type not in self.handlers:

            logger.warning(
                "Unknown webhook event: %s",
                event_type,
            )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unsupported webhook event "
                    f"{event_type}"
                ),
            )


        try:

            handler = self.handlers[event_type]


            result = await handler(
                payload,
            )


            logger.info(
                "Webhook processed successfully: %s",
                event_type,
            )


            return result


        except Exception as exc:

            logger.exception(
                "Webhook processing failed",
                exc_info=exc,
            )


            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Webhook processing failed.",
            )



async def verify_webhook_signature(
    payload: bytes,
    signature: str,
    secret: str,
) -> bool:
    """
    Verify webhook signature.

    Used for securing webhook requests.
    """

    import hmac
    import hashlib


    expected_signature = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256,
    ).hexdigest()


    return hmac.compare_digest(
        expected_signature,
        signature,
    )



webhook_handler = WebhookHandler()