from __future__ import annotations

import os
from dataclasses import dataclass, replace


@dataclass(frozen=True)
class ProviderConfig:
    """
    Shared configuration for every ModelNow AI provider.

    Provider-specific configuration should be layered on top
    of this class rather than duplicating common settings.
    """

    provider_id: str

    api_key: str | None = None
    base_url: str | None = None

    timeout_seconds: float = 60.0
    connect_timeout_seconds: float = 10.0

    max_retries: int = 3
    retry_enabled: bool = True

    enabled: bool = True

    organization: str | None = None

    default_headers: tuple[tuple[str, str], ...] = ()
    metadata: tuple[tuple[str, str], ...] = ()

    @classmethod
    def from_env(
        cls,
        provider_id: str,
        *,
        api_key_env: str | None = None,
        base_url_env: str | None = None,
    ) -> "ProviderConfig":
        """
        Build provider configuration from environment variables.

        Provider-specific API keys and URLs can be supplied through
        explicit environment variable names.
        """

        api_key = (
            os.getenv(api_key_env)
            if api_key_env
            else None
        )

        base_url = (
            os.getenv(base_url_env)
            if base_url_env
            else None
        )

        return cls(
            provider_id=provider_id,
            api_key=api_key,
            base_url=base_url,
            timeout_seconds=float(
                os.getenv(
                    "MODELNOW_PROVIDER_TIMEOUT",
                    "60",
                )
            ),
            connect_timeout_seconds=float(
                os.getenv(
                    "MODELNOW_PROVIDER_CONNECT_TIMEOUT",
                    "10",
                )
            ),
            max_retries=int(
                os.getenv(
                    "MODELNOW_PROVIDER_MAX_RETRIES",
                    "3",
                )
            ),
            retry_enabled=_env_bool(
                "MODELNOW_PROVIDER_RETRY_ENABLED",
                True,
            ),
            enabled=_env_bool(
                "MODELNOW_PROVIDER_ENABLED",
                True,
            ),
        )

    def with_updates(self, **kwargs) -> "ProviderConfig":
        """
        Return a new immutable configuration with updated values.
        """

        return replace(self, **kwargs)

    @property
    def headers(self) -> dict[str, str]:
        """Return configured default HTTP headers."""

        return dict(self.default_headers)

    @property
    def extra_metadata(self) -> dict[str, str]:
        """Return configuration metadata as a dictionary."""

        return dict(self.metadata)


def _env_bool(
    name: str,
    default: bool,
) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }

