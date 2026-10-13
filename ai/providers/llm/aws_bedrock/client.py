from __future__ import annotations

import asyncio
from typing import Any, AsyncIterator

from .config import AWSBedrockConfig


class AWSBedrockClient:
    def __init__(
        self,
        config: AWSBedrockConfig,
    ) -> None:
        self.config = config
        self._runtime_client = None
        self._control_client = None

    def _create_clients(self) -> None:
        if (
            self._runtime_client is not None
            and self._control_client is not None
        ):
            return

        try:
            import boto3
        except ImportError as exc:
            raise RuntimeError(
                "boto3 is required for AWS Bedrock. "
                "Install it with: pip install boto3"
            ) from exc

        session = boto3.Session(
            **self.config.boto3_session_kwargs()
        )

        runtime_kwargs = (
            self.config.runtime_client_kwargs()
        )

        self._runtime_client = (
            session.client(
                "bedrock-runtime",
                **runtime_kwargs,
            )
        )

        self._control_client = (
            session.client(
                "bedrock",
                region_name=self.config.region,
            )
        )

    @property
    def runtime_client(self):
        self._create_clients()
        return self._runtime_client

    @property
    def control_client(self):
        self._create_clients()
        return self._control_client

    def converse(
        self,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        return self.runtime_client.converse(
            **payload
        )

    async def chat(
        self,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        return await asyncio.to_thread(
            self.converse,
            payload,
        )

    def converse_stream(
        self,
        payload: dict[str, Any],
    ):
        return self.runtime_client.converse_stream(
            **payload
        )

    async def stream(
        self,
        payload: dict[str, Any],
    ) -> AsyncIterator[dict[str, Any]]:
        response = await asyncio.to_thread(
            self.converse_stream,
            payload,
        )

        for event in response.get(
            "stream",
            [],
        ):
            yield event

    def list_foundation_models(
        self,
    ) -> list[dict[str, Any]]:
        paginator = (
            self.control_client.get_paginator(
                "list_foundation_models"
            )
        )

        models: list[dict[str, Any]] = []

        for page in paginator.paginate():
            models.extend(
                page.get(
                    "modelSummaries",
                    [],
                )
            )

        return models

    async def list_models(
        self,
    ) -> list[dict[str, Any]]:
        return await asyncio.to_thread(
            self.list_foundation_models
        )

    def get_foundation_model(
        self,
        model_id: str,
    ) -> dict[str, Any]:
        return self.control_client.get_foundation_model(
            modelIdentifier=model_id
        )

    async def health_check(self) -> bool:
        try:
            await asyncio.to_thread(
                self.list_foundation_models
            )
            return True
        except Exception:
            return False

    def close(self) -> None:
        for client in (
            self._runtime_client,
            self._control_client,
        ):
            if client is None:
                continue

            close_method = getattr(
                client,
                "close",
                None,
            )

            if callable(close_method):
                close_method()

        self._runtime_client = None
        self._control_client = None
