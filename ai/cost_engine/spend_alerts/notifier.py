"""
Spend alert notification service.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import RLock
from typing import Any

from .alerts import SpendAlert
from .channels import (
    ConsoleChannel,
    NotificationChannel,
    NotificationError,
    NotificationMessage,
)


@dataclass(frozen=True)
class NotificationResult:
    """
    Result of sending an alert notification.
    """

    alert_id: str

    channel: str

    success: bool

    error: str | None = None

    sent_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )


class AlertNotifier:
    """
    Sends spend alerts through registered channels.
    """

    def __init__(
        self,
        channels: list[NotificationChannel] | None = None,
    ) -> None:

        self._channels: dict[
            str,
            NotificationChannel,
        ] = {}

        self._lock = RLock()

        for channel in (
            channels
            if channels is not None
            else [ConsoleChannel()]
        ):
            self.register(channel)

    def register(
        self,
        channel: NotificationChannel,
    ) -> None:

        with self._lock:

            self._channels[
                channel.name
            ] = channel

    def unregister(
        self,
        channel_name: str,
    ) -> bool:

        with self._lock:

            if channel_name not in self._channels:
                return False

            del self._channels[
                channel_name
            ]

            return True

    def get_channel(
        self,
        channel_name: str,
    ) -> NotificationChannel | None:

        with self._lock:
            return self._channels.get(
                channel_name
            )

    def channels(
        self,
    ) -> list[str]:

        with self._lock:
            return list(
                self._channels.keys()
            )

    def notify(
        self,
        alert: SpendAlert,
        channel_names: list[str] | None = None,
    ) -> list[NotificationResult]:

        if channel_names is None:

            with self._lock:
                channels = list(
                    self._channels.values()
                )

        else:

            channels = []

            for name in channel_names:

                channel = self.get_channel(
                    name
                )

                if channel is not None:
                    channels.append(channel)

        message = NotificationMessage(
            subject=(
                f"{alert.severity.value.upper()} "
                f"Spend Alert: "
                f"{alert.rule_name}"
            ),
            body=alert.message,
            alert_id=alert.alert_id,
            severity=alert.severity.value,
            metadata={
                "metric": alert.metric.value,
                "value": str(alert.value),
                "threshold": str(
                    alert.threshold
                ),
                "scope_id": alert.scope_id,
                "currency": alert.currency,
                **alert.metadata,
            },
        )

        results: list[
            NotificationResult
        ] = []

        for channel in channels:

            try:

                success = channel.send(
                    message
                )

                results.append(
                    NotificationResult(
                        alert_id=alert.alert_id,
                        channel=channel.name,
                        success=success,
                    )
                )

            except NotificationError as exc:

                results.append(
                    NotificationResult(
                        alert_id=alert.alert_id,
                        channel=channel.name,
                        success=False,
                        error=str(exc),
                    )
                )

            except Exception as exc:

                results.append(
                    NotificationResult(
                        alert_id=alert.alert_id,
                        channel=channel.name,
                        success=False,
                        error=str(exc),
                    )
                )

        return results

    def notify_many(
        self,
        alerts: list[SpendAlert],
        channel_names: list[str] | None = None,
    ) -> list[NotificationResult]:

        results: list[
            NotificationResult
        ] = []

        for alert in alerts:

            results.extend(
                self.notify(
                    alert,
                    channel_names=channel_names,
                )
            )

        return results