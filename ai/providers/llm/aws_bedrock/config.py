from __future__ import annotations

import os
from dataclasses import dataclass

from ai.providers.base.config import ProviderConfig


DEFAULT_AWS_REGION = "us-east-1"


@dataclass(frozen=True)
class AWSBedrockConfig:
    region: str = DEFAULT_AWS_REGION
    access_key_id: str | None = None
    secret_access_key: str | None = None
    session_token: str | None = None
    profile_name: str | None = None
    endpoint_url: str | None = None
    timeout_seconds: int = 60
    connect_timeout_seconds: int = 10
    max_retries: int = 3
    retry_enabled: bool = True
    enabled: bool = True

    @property
    def configured(self) -> bool:
        return bool(
            self.access_key_id
            and self.secret_access_key
        ) or bool(self.profile_name)

    @classmethod
    def from_env(cls) -> "AWSBedrockConfig":
        return cls(
            region=(
                os.getenv("AWS_BEDROCK_REGION")
                or os.getenv("AWS_REGION")
                or os.getenv("AWS_DEFAULT_REGION")
                or DEFAULT_AWS_REGION
            ),
            access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            session_token=os.getenv("AWS_SESSION_TOKEN"),
            profile_name=os.getenv("AWS_PROFILE"),
            endpoint_url=os.getenv("AWS_BEDROCK_ENDPOINT_URL"),
            timeout_seconds=int(
                os.getenv(
                    "AWS_BEDROCK_TIMEOUT_SECONDS",
                    "60",
                )
            ),
            connect_timeout_seconds=int(
                os.getenv(
                    "AWS_BEDROCK_CONNECT_TIMEOUT_SECONDS",
                    "10",
                )
            ),
            max_retries=int(
                os.getenv(
                    "AWS_BEDROCK_MAX_RETRIES",
                    "3",
                )
            ),
            retry_enabled=(
                os.getenv(
                    "AWS_BEDROCK_RETRY_ENABLED",
                    "true",
                ).lower()
                in {"1", "true", "yes", "on"}
            ),
            enabled=(
                os.getenv(
                    "AWS_BEDROCK_ENABLED",
                    "true",
                ).lower()
                in {"1", "true", "yes", "on"}
            ),
        )

    @classmethod
    def from_provider_config(
        cls,
        config: ProviderConfig,
    ) -> "AWSBedrockConfig":
        metadata = config.extra_metadata

        return cls(
            region=(
                metadata.get("region")
                or os.getenv(
                    "AWS_BEDROCK_REGION",
                    DEFAULT_AWS_REGION,
                )
            ),
            access_key_id=(
                metadata.get("access_key_id")
                or os.getenv("AWS_ACCESS_KEY_ID")
            ),
            secret_access_key=(
                metadata.get("secret_access_key")
                or os.getenv("AWS_SECRET_ACCESS_KEY")
            ),
            session_token=(
                metadata.get("session_token")
                or os.getenv("AWS_SESSION_TOKEN")
            ),
            profile_name=(
                metadata.get("profile_name")
                or os.getenv("AWS_PROFILE")
            ),
            endpoint_url=(
                config.base_url
                or metadata.get("endpoint_url")
                or os.getenv("AWS_BEDROCK_ENDPOINT_URL")
            ),
            timeout_seconds=config.timeout_seconds,
            connect_timeout_seconds=config.connect_timeout_seconds,
            max_retries=config.max_retries,
            retry_enabled=config.retry_enabled,
            enabled=config.enabled,
        )

    def boto3_session_kwargs(self) -> dict:
        kwargs: dict = {}

        if self.profile_name:
            kwargs["profile_name"] = self.profile_name

        if self.region:
            kwargs["region_name"] = self.region

        if self.access_key_id:
            kwargs["aws_access_key_id"] = self.access_key_id

        if self.secret_access_key:
            kwargs["aws_secret_access_key"] = (
                self.secret_access_key
            )

        if self.session_token:
            kwargs["aws_session_token"] = self.session_token

        return kwargs

    def runtime_client_kwargs(self) -> dict:
        kwargs = {
            "config": {
                "connect_timeout": self.connect_timeout_seconds,
                "read_timeout": self.timeout_seconds,
                "retries": {
                    "max_attempts": self.max_retries,
                    "mode": "standard",
                },
            }
        }

        if self.endpoint_url:
            kwargs["endpoint_url"] = self.endpoint_url

        return kwargs

    def with_updates(
        self,
        **updates,
    ) -> "AWSBedrockConfig":
        values = {
            "region": self.region,
            "access_key_id": self.access_key_id,
            "secret_access_key": self.secret_access_key,
            "session_token": self.session_token,
            "profile_name": self.profile_name,
            "endpoint_url": self.endpoint_url,
            "timeout_seconds": self.timeout_seconds,
            "connect_timeout_seconds": self.connect_timeout_seconds,
            "max_retries": self.max_retries,
            "retry_enabled": self.retry_enabled,
            "enabled": self.enabled,
        }

        values.update(updates)

        return AWSBedrockConfig(**values)
