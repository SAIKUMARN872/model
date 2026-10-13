"""Salesforce connector configuration."""
from dataclasses import dataclass
import re
from urllib.parse import urlsplit

from ai.connectors.exceptions import ConnectorConfigurationError


@dataclass(frozen=True, slots=True)
class SalesforceConfig:
    instance_url: str
    allowed_hosts: tuple[str, ...]
    api_version: str = "v60.0"
    credential_env_var: str = "SALESFORCE_ACCESS_TOKEN"
    timeout_seconds: float = 15.0
    required_permissions: tuple[str, ...] = ("salesforce:read",)

    def __post_init__(self):
        try:
            parsed = urlsplit(self.instance_url)
            valid_url = (
                parsed.scheme == "https"
                and bool(parsed.hostname)
                and not parsed.username
                and not parsed.password
                and not parsed.query
                and not parsed.fragment
                and parsed.hostname.lower() in {
                    host.lower() for host in self.allowed_hosts
                }
                and parsed.path in ("", "/")
            )
        except (TypeError, ValueError):
            valid_url = False

        if not valid_url:
            raise ConnectorConfigurationError(
                "Salesforce instance URL must be HTTPS and use an explicitly allowlisted host."
            )
        if not self.allowed_hosts or any(
            not isinstance(host, str) or not host.strip()
            for host in self.allowed_hosts
        ):
            raise ConnectorConfigurationError("Explicit Salesforce allowed_hosts are required.")
        if not isinstance(self.api_version, str) or not re.fullmatch(
            r"v[0-9]{2,3}\.[0-9]+", self.api_version
        ):
            raise ConnectorConfigurationError("Invalid Salesforce API version.")
        if (
            isinstance(self.timeout_seconds, bool)
            or not isinstance(self.timeout_seconds, (int, float))
            or not 0 < self.timeout_seconds <= 120
        ):
            raise ConnectorConfigurationError("Invalid Salesforce timeout.")
        if not isinstance(self.credential_env_var, str) or not re.fullmatch(
            r"[A-Za-z_][A-Za-z0-9_]*", self.credential_env_var
        ):
            raise ConnectorConfigurationError("Invalid credential environment variable.")
