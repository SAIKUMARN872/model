"""
Notification channels for spend alerts.
"""

from __future__ import annotations

import json
import logging
import urllib.request
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any

from .alerts import SpendAlert


logger = logging.getLogger(__name__)


class NotificationError(RuntimeError):
    """Raised when notification delivery fails."""


@dataclass(frozen=True)
class NotificationMessage:
    """
    Message sent through a notification channel.
    """

    subject: str
    body: str

    alert_id: str | None = None

    severity: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class NotificationChannel(ABC):
    """
    Base notification channel.
    """

    name: str

    @abstractmethod
    def send(
        self,
        message: NotificationMessage,
    ) -> bool:
        """
        Send a notification.

        Returns True when delivery succeeds.
        """
        raise NotImplementedError


class ConsoleChannel(NotificationChannel):
    """
    Sends alerts to stdout/logging.
    """

    name = "console"

    def send(
        self,
        message: NotificationMessage,
    ) -> bool:

        logger.warning(
            "[SPEND ALERT] %s: %s",
            message.subject,
            message.body,
        )

        return True


@dataclass
class EmailChannel(NotificationChannel):
    """
    Email-compatible notification channel.

    This class intentionally accepts a sender function so
    SMTP, SES, SendGrid, Mailgun, etc. can be plugged in.
    """

    sender: Any | None = None

    name: str = "email"

    def send(
        self,
        message: NotificationMessage,
    ) -> bool:

        if self.sender is None:

            logger.info(
                "Email notification generated: %s",
                message.subject,
            )

            return True

        try:

            self.sender(
                subject=message.subject,
                body=message.body,
                metadata=message.metadata,
            )

            return True

        except Exception as exc:

            raise NotificationError(
                f"Email delivery failed: {exc}"
            ) from exc


@dataclass
class WebhookChannel(NotificationChannel):
    """
    Generic HTTP webhook channel.

    Payload is JSON encoded.
    """

    url: str

    timeout: int = 10

    headers: dict[str, str] = field(
        default_factory=lambda: {
            "Content-Type": "application/json"
        }
    )

    name: str = "webhook"

    def __post_init__(self) -> None:

        if not self.url:
            raise ValueError(
                "Webhook URL cannot be empty"
            )

        if self.timeout <= 0:
            raise ValueError(
                "Webhook timeout must be positive"
            )

    def send(
        self,
        message: NotificationMessage,
    ) -> bool:

        payload = {
            "subject": message.subject,
            "body": message.body,
            "alert_id": message.alert_id,
            "severity": message.severity,
            "metadata": message.metadata,
        }

        data = json.dumps(
            payload
        ).encode("utf-8")

        request = urllib.request.Request(
            self.url,
            data=data,
            headers=self.headers,
            method="POST",
        )

        try:

            with urllib.request.urlopen(
                request,
                timeout=self.timeout,
            ) as response:

                status = response.status

                if 200 <= status < 300:
                    return True

                raise NotificationError(
                    f"Webhook returned HTTP {status}"
                )

        except NotificationError:
            raise

        except Exception as exc:

            raise NotificationError(
                f"Webhook delivery failed: {exc}"
            ) from exc


@dataclass
class SlackWebhookChannel(WebhookChannel):
    """
    Slack incoming webhook channel.

    Converts the notification into Slack's expected
    JSON payload.
    """

    name: str = "slack"

    def send(
        self,
        message: NotificationMessage,
    ) -> bool:

        payload = {
            "text": (
                f"*{message.subject}*\n"
                f"{message.body}"
            )
        }

        data = json.dumps(
            payload
        ).encode("utf-8")

        request = urllib.request.Request(
            self.url,
            data=data,
            headers={
                **self.headers,
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:

            with urllib.request.urlopen(
                request,
                timeout=self.timeout,
            ) as response:

                if 200 <= response.status < 300:
                    return True

                raise NotificationError(
                    f"Slack returned HTTP "
                    f"{response.status}"
                )

        except NotificationError:
            raise

        except Exception as exc:

            raise NotificationError(
                f"Slack delivery failed: {exc}"
            ) from exc