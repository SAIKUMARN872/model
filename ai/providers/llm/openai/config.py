from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class OpenAIConfig:
    api_key: str | None = None
    organization: str | None = None
    project: str | None = None
    base_url: str | None = None
    timeout_seconds: float = 60.0
    max_retries: int = 3

    @classmethod
    def from_env(cls) -> "OpenAIConfig":
        return cls(
            api_key=os.getenv("OPENAI_API_KEY"),
            organization=os.getenv("OPENAI_ORG_ID"),
            project=os.getenv("OPENAI_PROJECT_ID"),
            base_url=os.getenv("OPENAI_BASE_URL"),
            timeout_seconds=float(
                os.getenv("OPENAI_TIMEOUT_SECONDS", "60")
            ),
            max_retries=int(
                os.getenv("OPENAI_MAX_RETRIES", "3")
            ),
        )

    def client_kwargs(self) -> dict:
        kwargs: dict = {}

        if self.api_key:
            kwargs["api_key"] = self.api_key

        if self.organization:
            kwargs["organization"] = self.organization

        if self.project:
            kwargs["project"] = self.project

        if self.base_url:
            kwargs["base_url"] = self.base_url

        kwargs["timeout"] = self.timeout_seconds
        kwargs["max_retries"] = self.max_retries

        return kwargs


__all__ = ["OpenAIConfig"]

