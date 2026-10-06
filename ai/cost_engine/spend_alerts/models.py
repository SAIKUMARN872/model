from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, Optional


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"


@dataclass(frozen=True)
class SpendAlertRule:
    """Defines when a spend alert should be triggered."""

    rule_id: str
    name: str
    threshold: Decimal
    severity: AlertSeverity = AlertSeverity.WARNING
    currency: str = "USD"
    enabled: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class SpendAlert:
    """Represents a triggered spend alert."""

    alert_id: str
    rule_id: str
    current_spend: Decimal
    threshold: Decimal
    severity: AlertSeverity
    status: AlertStatus = AlertStatus.ACTIVE
    currency: str = "USD"
    model: Optional[str] = None
    provider: Optional[str] = None
    entity_id: Optional[str] = None
    message: str = ""
    triggered_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class SpendAlertSummary:
    """Aggregated spend alert information."""

    total_rules: int = 0
    enabled_rules: int = 0
    total_alerts: int = 0
    active_alerts: int = 0
    warning_alerts: int = 0
    critical_alerts: int = 0
    total_spend: Decimal = Decimal("0")
    currency: str = "USD"


__all__ = [
    "AlertSeverity",
    "AlertStatus",
    "SpendAlertRule",
    "SpendAlert",
    "SpendAlertSummary",
]
