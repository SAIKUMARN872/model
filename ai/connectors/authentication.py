"""Credential providers. Secrets are never included in provider errors."""

from __future__ import annotations

import os
from typing import Protocol, Mapping

from .exceptions import ConnectorAuthenticationError


class CredentialProvider(Protocol):
    def get_credentials(self, connector_name: str) -> Mapping[str, str]:
        """Return credentials for one connector."""


class EnvironmentCredentialProvider:
    """Load credentials from explicitly configured environment variable names."""

    def __init__(self, mappings: Mapping[str, Mapping[str, str]]) -> None:
        self._mappings = {
            name: dict(values) for name, values in mappings.items()
        }

    def get_credentials(self, connector_name: str) -> Mapping[str, str]:
        if connector_name not in self._mappings:
            return {}

        credentials: dict[str, str] = {}
        for key, env_name in self._mappings[connector_name].items():
            value = os.environ.get(env_name)
            if not value:
                raise ConnectorAuthenticationError(
                    f"Required credential '{key}' is not configured."
                )
            credentials[key] = value
        return credentials
