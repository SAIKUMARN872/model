@'
from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from typing import Any, Mapping

import boto3
from botocore.exceptions import (
    BotoCoreError,
    ClientError,
    ConnectTimeoutError,
    EndpointConnectionError,
    ReadTimeoutError,
)

from ai.providers.base.client import BaseClient
from ai.providers.base.config import ProviderConfig
from ai.providers.base.exceptions import (
    ProviderAuthenticationError,
    ProviderAuthorizationError,
    ProviderError,
    ProviderModelNotFoundError,
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderUnavailableError,
)
from ai.providers.base.response import StreamChunk

from .config import AWSBedrockConfig


class AWSBedrockClient(BaseClient):
    """AWS Bedrock Runtime transport for ModelNow."""

    provider_name = "aws_bedrock"

    def __init__(
        self,
        config: ProviderConfig,
        *,
        bedrock_config: AWSBedrockConfig | None = None,
    ) -> None:
        super().__init__(config)

        self.bedrock_config = (
            bedrock_config or AWSBedrockConfig.from_env()
        )

        self._session: boto3.Session | None = None
        self._client: Any | None = None

    @property
    def initialized(self) -> bool:
        return self._client is not None and not self.closed

    async def initialize(self) -> None:
        if self._client is not None:
            return

        def create_client() -> tuple[boto3.Session, Any]:
            session = boto3.Session(
                **self.bedrock_config.boto3_session_kwargs()
            )

            client = session.client(
                "bedrock-runtime",
                **self.bedrock_config.client_kwargs(),
            )

            return session, client

        try:
            self._session, self._client = await asyncio.to_thread(
                create_client
            )
            self._closed = False

        except Exception as exc:
            self._raise_mapped_error(exc)

    async def close(self) -> None:
        client = self._client

        if client is not None:
            close_method = getattr(client, "close", None)

            if close_method is not None:
                try:
                    await asyncio.to_thread(close_method)
                except Exception:
                    pass

        self._client = None
        self._session = None
        await super().close()

    def _require_client(self) -> Any:
        if self._client is None or self.closed:
            raise ProviderError(
                "AWS Bedrock client is not initialized.",
                provider=self.provider_name,
                retryable=False,
            )

        return self._client

    async def request(
        self,
        *,
        method: str,
        path: str,
        headers: Mapping[str, str] | None = None,
        json: Any = None,
        params: Mapping[str, str] | None = None,
    ) -> Any:
        """
        BaseClient transport contract.

        Bedrock Converse operations are exposed through dedicated
        methods because boto3 is operation-oriented rather than
        HTTP-path-oriented.
        """

        operation = path.strip("/").lower()

        if operation in {"converse", "model/converse"}:
            if not isinstance(json, dict):
                raise ProviderError(
                    "Bedrock Converse payload must be a dictionary.",
                    provider=self.provider_name,
                    retryable=False,
                )

            return await self.converse(json)

        raise ProviderError(
            f"Unsupported AWS Bedrock operation: {path}",
            provider=self.provider_name,
            retryable=False,
        )

    async def converse(
        self,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        client = self._require_client()

        try:
            return await asyncio.to_thread(
                client.converse,
                **payload,
            )

        except (
            ClientError,
            BotoCoreError,
            ConnectTimeoutError,
            EndpointConnectionError,
            ReadTimeoutError,
        ) as exc:
            self._raise_mapped_error(exc)

        raise AssertionError("Unreachable")

    async def converse_stream(
        self,
        payload: dict[str, Any],
    ) -> AsyncIterator[dict[str, Any]]:
        client = self._require_client()

        try:
            response = await asyncio.to_thread(
                client.converse_stream,
                **payload,
            )

            event_stream = response.get("stream")

            if event_stream is None:
                raise ProviderError(
                    "AWS Bedrock returned no streaming event stream.",
                    provider=self.provider_name,
                    retryable=False,
                )

            iterator = iter(event_stream)

            while True:
                event, finished = await asyncio.to_thread(
                    self._next_event,
                    iterator,
                )

                if finished:
                    break

                yield event

        except ProviderError:
            raise

        except (
            ClientError,
            BotoCoreError,
            ConnectTimeoutError,
            EndpointConnectionError,
            ReadTimeoutError,
        ) as exc:
            self._raise_mapped_error(exc)

    @staticmethod
    def _next_event(
        iterator: Any,
    ) -> tuple[dict[str, Any] | None, bool]:
        try:
            return next(iterator), False
        except StopIteration:
            return None, True

    @staticmethod
    def _error_code(exc: Exception) -> str:
        response = getattr(exc, "response", None)

        if isinstance(response, dict):
            error = response.get("Error", {})

            if isinstance(error, dict) and error.get("Code"):
                return str(error["Code"])

        return exc.__class__.__name__

    def _raise_mapped_error(self, exc: Exception) -> None:
        code = self._error_code(exc)

        response = getattr(exc, "response", None)

        status_code = None
        request_id = None

        if isinstance(response, dict):
            metadata = response.get("ResponseMetadata", {})

            if isinstance(metadata, dict):
                status_code = metadata.get("HTTPStatusCode")
                request_id = metadata.get("RequestId")

        message = str(exc)

        if code in {
            "UnrecognizedClientException",
            "InvalidClientTokenId",
            "ExpiredTokenException",
            "InvalidSignatureException",
        }:
            raise ProviderAuthenticationError(
                message,
                provider=self.provider_name,
                status_code=status_code,
                request_id=request_id,
                retryable=False,
            ) from exc

        if code in {
            "AccessDeniedException",
            "UnauthorizedOperation",
        }:
            raise ProviderAuthorizationError(
                message,
                provider=self.provider_name,
                status_code=status_code,
                request_id=request_id,
                retryable=False,
            ) from exc

        if code in {
            "ResourceNotFoundException",
            "ModelNotReadyException",
            "ModelNotSupportedException",
        }:
            raise ProviderModelNotFoundError(
                message,
                provider=self.provider_name,
                status_code=status_code,
                request_id=request_id,
                retryable=False,
            ) from exc

        if code in {
            "ThrottlingException",
            "TooManyRequestsException",
            "ServiceQuotaExceededException",
        }:
            raise ProviderRateLimitError(
                message,
                provider=self.provider_name,
                status_code=status_code,
                request_id=request_id,
                retryable=True,
            ) from exc

        if code in {
            "ServiceUnavailableException",
            "InternalServerException",
            "InternalFailure",
        }:
            raise ProviderUnavailableError(
                message,
                provider=self.provider_name,
                status_code=status_code,
                request_id=request_id,
                retryable=True,
            ) from exc

        if isinstance(
            exc,
            (ConnectTimeoutError, ReadTimeoutError),
        ):
            raise ProviderTimeoutError(
                message,
                provider=self.provider_name,
                status_code=status_code,
                request_id=request_id,
                retryable=True,
            ) from exc

        if isinstance(
            exc,
            (EndpointConnectionError, BotoCoreError),
        ):
            raise ProviderUnavailableError(
                message,
                provider=self.provider_name,
                status_code=status_code,
                request_id=request_id,
                retryable=True,
            ) from exc

        raise ProviderError(
            message,
            provider=self.provider_name,
            status_code=status_code,
            request_id=request_id,
            retryable=False,
        ) from exc


__all__ = ["AWSBedrockClient"]
'@ | Set-Content ".\ai\providers\llm\aws_bedrock\client.py"