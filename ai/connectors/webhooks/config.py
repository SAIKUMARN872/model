"""Static webhook destination configuration."""
from dataclasses import dataclass
import re

from ai.connectors.exceptions import ConnectorConfigurationError

_NAME = re.compile(r"^[a-z][a-z0-9_.-]{0,63}$")
_ENV = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


@dataclass(frozen=True, slots=True)
class WebhookOperationConfig:
    name: str
    url: str
    allowed_hosts: tuple[str, ...]
    signing_secret_env_var: str | None = None
    required_permissions: tuple[str, ...] = ("webhooks:deliver",)
    headers: dict[str, str] | None = None

    def __post_init__(self):
        if not isinstance(self.name, str) or not _NAME.fullmatch(self.name):
            raise ConnectorConfigurationError("Invalid webhook operation name.")
        if not isinstance(self.url, str) or not self.url:
            raise ConnectorConfigurationError("Webhook destination URL is required.")
        if not self.allowed_hosts or any(
            not isinstance(host, str) or not host or "/" in host or ":" in host
            for host in self.allowed_hosts
        ):
            raise ConnectorConfigurationError("Explicit webhook host allowlist is required.")
        if self.signing_secret_env_var is not None and (
            not isinstance(self.signing_secret_env_var, str)
            or not _ENV.fullmatch(self.signing_secret_env_var)
        ):
            raise ConnectorConfigurationError("Invalid webhook secret environment variable.")
        if not isinstance(self.required_permissions, tuple) or any(
            not isinstance(p, str) or not p for p in self.required_permissions
        ):
            raise ConnectorConfigurationError("Invalid webhook permissions.")
        if self.headers is not None and not isinstance(self.headers, dict):
            raise ConnectorConfigurationError("Webhook headers must be a mapping.")


@dataclass(frozen=True, slots=True)
class WebhookConfig:
    operations: tuple[WebhookOperationConfig, ...]
    timeout_seconds: float = 15.0
    enable_delivery: bool = False
    required_permissions: tuple[str, ...] = ("webhooks:deliver",)

    def __post_init__(self):
        if not isinstance(self.operations, tuple) or not self.operations:
            raise ConnectorConfigurationError("At least one webhook operation must be configured.")
        names = [op.name for op in self.operations]
        if len(names) != len(set(names)):
            raise ConnectorConfigurationError("Webhook operation names must be unique.")
        if isinstance(self.timeout_seconds, bool) or not isinstance(self.timeout_seconds, (int, float)) or not 0 < self.timeout_seconds <= 120:
            raise ConnectorConfigurationError("Invalid webhook timeout.")
        if not isinstance(self.enable_delivery, bool):
            raise ConnectorConfigurationError("enable_delivery must be boolean.")
