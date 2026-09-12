"""
Low-level Voyage AI API client.
"""

from __future__ import annotations

from typing import Any

from .models import VoyageConfig
from .utils import (
    get_api_key,
    validate_embeddings,
    validate_texts,
)


class VoyageClientError(Exception):
    """Base Voyage client error."""


class VoyageClient:
    """
    Wrapper around the Voyage AI Python SDK.

    The dependency is loaded lazily so that ModelNow
    can still import when voyageai is not installed.
    """

    def __init__(
        self,
        config: VoyageConfig | None = None,
    ) -> None:

        self.config = (
            config
            or VoyageConfig()
        )

        self._client: Any = None

    def load(self) -> Any:

        if self._client is not None:
            return self._client

        try:

            import voyageai

        except ImportError as exc:

            raise VoyageClientError(
                "voyageai is required. "
                "Install it with: "
                "pip install voyageai"
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

        if self.config.base_url:

            kwargs.setdefault(
                "base_url",
                self.config.base_url,
            )

        try:

            self._client = voyageai.Client(
                **kwargs
            )

        except Exception as exc:

            raise VoyageClientError(
                f"Failed to initialize Voyage client: "
                f"{exc}"
            ) from exc

        return self._client

    @property
    def client(self) -> Any:
        return self.load()

    @property
    def loaded(self) -> bool:
        return self._client is not None

    def unload(self) -> None:
        self._client = None

    def embed(
        self,
        texts: list[str],
        input_type: str | None = None,
    ) -> list[list[float]]:

        texts = validate_texts(
            texts
        )

        kwargs: dict[str, Any] = {
            "model": self.config.model_name,
            "texts": texts,
        }

        effective_input_type = (
            input_type
            or self.config.input_type
        )

        if effective_input_type:

            kwargs[
                "input_type"
            ] = effective_input_type

        if self.config.truncation is not None:

            kwargs[
                "truncation"
            ] = self.config.truncation

        if self.config.output_dimension:

            kwargs[
                "output_dimension"
            ] = self.config.output_dimension

        if self.config.output_dtype:

            kwargs[
                "output_dtype"
            ] = self.config.output_dtype

        try:

            response = self.client.embed(
                **kwargs
            )

        except Exception as exc:

            raise VoyageClientError(
                f"Voyage embedding request failed: "
                f"{exc}"
            ) from exc

        embeddings = getattr(
            response,
            "embeddings",
            None,
        )

        if embeddings is None:

            raise VoyageClientError(
                "Voyage response contains no embeddings"
            )

        return validate_embeddings(
            embeddings,
            len(texts),
        )

    def embed_queries(
        self,
        queries: list[str],
    ) -> list[list[float]]:

        return self.embed(
            queries,
            input_type="query",
        )

    def embed_documents(
        self,
        documents: list[str],
    ) -> list[list[float]]:

        return self.embed(
            documents,
            input_type="document",
        )

    def info(self) -> dict[str, Any]:

        return {
            "provider": "voyage",
            "model_name": (
                self.config.model_name
            ),
            "batch_size": (
                self.config.batch_size
            ),
            "input_type": (
                self.config.input_type
            ),
            "output_dimension": (
                self.config.output_dimension
            ),
            "output_dtype": (
                self.config.output_dtype
            ),
            "loaded": self.loaded,
        }