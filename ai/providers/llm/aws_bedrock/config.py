@'
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class AWSBedrockConfig:
    """Configuration for the AWS Bedrock Runtime provider."""

    region_name: str = "us-east-1"

    access_key_id: str | None = None
    secret_access_key: str | None = None
    session_token: str | None = None
    profile_name: str | None = None

    timeout_seconds: float = 60.0
    max_retries: int = 3

    endpoint_url: str | None = None
    verify_ssl: bool = True

    @classmethod
    def from_env(cls) -> "AWSBedrockConfig":
        """Build configuration from AWS/ModelNow environment variables."""

        return cls(
            region_name=os.getenv(
                "AWS_REGION",
                os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
            ),
            access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            session_token=os.getenv("AWS_SESSION_TOKEN"),
            profile_name=os.getenv("AWS_PROFILE"),
            timeout_seconds=float(
                os.getenv("AWS_BEDROCK_TIMEOUT_SECONDS", "60")
            ),
            max_retries=int(
                os.getenv("AWS_BEDROCK_MAX_RETRIES", "3")
            ),
            endpoint_url=os.getenv("AWS_BEDROCK_ENDPOINT_URL"),
            verify_ssl=os.getenv(
                "AWS_BEDROCK_VERIFY_SSL",
                "true",
            ).lower()
            not in {"0", "false", "no"},
        )

    def boto3_session_kwargs(self) -> dict[str, str]:
        """Arguments used when creating boto3.Session."""

        kwargs: dict[str, str] = {}

        if self.profile_name:
            kwargs["profile_name"] = self.profile_name

        if self.region_name:
            kwargs["region_name"] = self.region_name

        return kwargs

    def client_kwargs(self) -> dict:
        """Arguments used when creating the Bedrock Runtime client."""

        kwargs: dict = {}

        if self.endpoint_url:
            kwargs["endpoint_url"] = self.endpoint_url

        if self.access_key_id:
            kwargs["aws_access_key_id"] = self.access_key_id

        if self.secret_access_key:
            kwargs["aws_secret_access_key"] = self.secret_access_key

        if self.session_token:
            kwargs["aws_session_token"] = self.session_token

        kwargs["verify"] = self.verify_ssl

        return kwargs


__all__ = ["AWSBedrockConfig"]
'@ | Set-Content ".\ai\providers\llm\aws_bedrock\config.py"