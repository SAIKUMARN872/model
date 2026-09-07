"""
Spend Alerts package for the ModelNow Cost Engine.

Provides:

- Alert rules
- Alert evaluation
- Spend alert management
- Notification channels
- Alert notification delivery
"""

from .alerts import (
    AlertManager,
    AlertStatus,
    SpendAlert,
)

from .channels import (
    ConsoleChannel,
    EmailChannel,
    NotificationChannel,
    NotificationError,
    NotificationMessage,
    SlackWebhookChannel,
    WebhookChannel,
)

from .notifier import (
    AlertNotifier,
    NotificationResult,
)

from .rules import (
    AlertMetric,
    AlertOperator,
    AlertRule,
    AlertRuleEngine,
    AlertRuleError,
    AlertRuleResult,
    AlertSeverity,
)


__all__ = [
    # Alerts
    "AlertManager",
    "AlertStatus",
    "SpendAlert",

    # Channels
    "NotificationChannel",
    "NotificationMessage",
    "NotificationError",
    "ConsoleChannel",
    "EmailChannel",
    "WebhookChannel",
    "SlackWebhookChannel",

    # Notifier
    "AlertNotifier",
    "NotificationResult",

    # Rules
    "AlertMetric",
    "AlertOperator",
    "AlertRule",
    "AlertRuleEngine",
    "AlertRuleError",
    "AlertRuleResult",
    "AlertSeverity",
]


__version__ = "1.0.0"