"""Slack connector configuration."""
from dataclasses import dataclass
import re

from ai.connectors.exceptions import ConnectorConfigurationError

_ENV = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


@dataclass(frozen=True, slots=True)
class SlackConfig:
    credential_env_var: str = "SLACK_ACCESS_TOKEN"
    timeout_seconds: float = 15.0
    max_page_size: int = 100
    required_permissions: tuple[str, ...] = ("slack:read",)

    def __post_init__(self):
        if not isinstance(self.credential_env_var, str) or not _ENV.fullmatch(self.credential_env_var):
            raise ConnectorConfigurationError("Invalid Slack credential environment variable.")
        if isinstance(self.timeout_seconds, bool) or not isinstance(self.timeout_seconds, (int, float)) or not 0 < self.timeout_seconds <= 120:
            raise ConnectorConfigurationError("Invalid Slack timeout.")
        if isinstance(self.max_page_size, bool) or not isinstance(self.max_page_size, int) or not 1 <= self.max_page_size <= 200:
            raise ConnectorConfigurationError("Invalid Slack page size.")
