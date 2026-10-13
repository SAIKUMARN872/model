"""Configuration for connector instances."""

from __future__ import annotations

from dataclasses import dataclass, field
from urllib.parse import urlsplit


@dataclass(frozen=True)
class ConnectorConfig:
    base_url: str | None = None
    timeout_seconds: float = 15.0
    credential_env_vars: dict[str, str] = field(default_factory=dict)
    allowed_hosts: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if (
            isinstance(self.timeout_seconds, bool)
            or not isinstance(self.timeout_seconds, (int, float))
            or not 0 < self.timeout_seconds <= 120
        ):
            raise ValueError("timeout_seconds must be greater than 0 and at most 120.")

        if self.base_url is not None:
            parsed = urlsplit(self.base_url)
            if (
                parsed.scheme != "https"
                or not parsed.hostname
                or parsed.username
                or parsed.password
                or parsed.query
                or parsed.fragment
            ):
                raise ValueError("base_url must be a valid HTTPS URL without credentials.")

            if self.allowed_hosts and parsed.hostname.lower() not in {
                host.lower() for host in self.allowed_hosts
            }:
                raise ValueError("base_url host is not in allowed_hosts.")

        if not isinstance(self.credential_env_vars, dict):
            raise TypeError("credential_env_vars must be a dictionary.")
        if any(
            not isinstance(key, str) or not key.strip()
            or not isinstance(value, str) or not value.strip()
            for key, value in self.credential_env_vars.items()
        ):
            raise ValueError("Credential environment mappings must be non-empty strings.")

        if not isinstance(self.allowed_hosts, tuple) or any(
            not isinstance(host, str) or not host.strip()
            for host in self.allowed_hosts
        ):
            raise ValueError("allowed_hosts must be a tuple of host names.")
