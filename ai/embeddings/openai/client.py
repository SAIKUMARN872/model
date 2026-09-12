"""
Low-level OpenAI embedding API client.
"""

from __future__ import annotations

from typing import Any

from .models import (
    OpenAIEmbeddingConfig,
)
from .utils import (
    get_api_key,
    normalize_embeddings,
    validate_embeddings,
    validate_texts,
)


class OpenAIClientError(Exception):
    """Base OpenAI embedding client error."""


class OpenAIClient:
    """
    Wrapper around the official OpenAI Python client.

    The OpenAI package is imported lazily so the rest of
    ModelNow can still load without the dependency installed.
    """

    def __init__(
        self,
        config: OpenAIEmbeddingConfig | None = None,
    ) -> None:

        self.config = (
            config
            or OpenAIEmbeddingConfig()
        )

        self._client: Any = None

    def load(self) -> Any:

        if self._client is not None:
            return self._client

        try:

            from openai import OpenAI

        except ImportError as exc:

            raise OpenAIClientError(
                "The openai package is required. "
                "Install it with: pip install openai"
            ) from exc

        api_key = get_api_key(
            self.config.api_key
        )

        kwargs = dict(
            self.config.client_kwargs
        )

        kwargs.setdefault(
            "api_key",
            api_key,
        )

        kwargs.setdefault(
            "timeout",
            self.config.timeout,
        )

        kwargs.setdefault(
            "max_retries",
            self.config.max_retries,
        )

        if self.config.base_url:

            kwargs.setdefault(
                "base_url",
                self.config.base_url,
            )

        if self.config.organization:

            kwargs.setdefault(
                "organization",
                self.config.organization,
            )

        self._client = OpenAI(
            **kwargs
        )

        return self._client

    @property
    def client(self) -> Any:
        return self.load()

    def embed(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        texts = validate_texts(
            texts
        )

        kwargs: dict[str, Any] = {
            "model": self.config.model_name,
            "input": texts,
            "encoding_format": (
                self.config.encoding_format
            ),
        }

        if self.config.dimensions:

            kwargs[
                "dimensions"
            ] = self.config.dimensions

        if self.config.user:

            kwargs["user"] = self.config.user

        try:

            response = (
                self.client.embeddings.create(
                    **kwargs
                )
            )

        except Exception as exc:

            raise OpenAIClientError(
                f"OpenAI embedding request failed: "
                f"{exc}"
            ) from exc

        data = getattr(
            response,
            "data",
            None,
        )

        if data is None:

            raise OpenAIClientError(
                "OpenAI response contains no data"
            )

        # API normally returns data in index order.
        data = sorted(
            data,
            key=lambda item: getattr(
                item,
                "index",
                0,
            ),
        )

        embeddings = [
            item.embedding
            for item in data
        ]

        embeddings = validate_embeddings(
            embeddings,
            len(texts),
        )

        if self.config.normalize_embeddings:

            embeddings = normalize_embeddings(
                embeddings
            )

        return embeddings

    def usage(
        self,
        texts: list[str],
    ) -> int:

        texts = validate_texts(
            texts
        )

        try:

            response = (
                self.client.embeddings.create(
                    model=self.config.model_name,
                    input=texts,
                )
            )

            usage = getattr(
                response,
                "usage",
                None,
            )

            if usage is None:
                return 0

            return int(
                getattr(
                    usage,
                    "total_tokens",
                    0,
                )
            )

        except Exception:

            return 0

    def info(self) -> dict[str, Any]:

        return {
            "provider": "openai",
            "model_name": (
                self.config.model_name
            ),
            "dimensions": (
                self.config.dimensions
            ),
            "batch_size": (
                self.config.batch_size
            ),
            "normalized": (
                self.config.normalize_embeddings
            ),
        }