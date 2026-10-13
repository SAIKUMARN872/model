"""Backend-independent orchestration for ModelNow vector storage."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .schemas import EngineStatus, SearchRequest, SearchResponse, VectorStoreConfig
from .utils import (
    validate_backend_name,
    validate_collection_name,
    validate_dimension,
    validate_metadata,
    validate_top_k,
    validate_vector,
)


class VectorStoreEngine:
    """Validate and delegate vector operations to an injected store adapter.

    The adapter must implement add_documents() and search(). Other operations
    are forwarded only when the adapter exposes the corresponding method.
    """

    def __init__(self, store: Any, config: VectorStoreConfig) -> None:
        if store is None:
            raise ValueError("store adapter is required")
        if not isinstance(config, VectorStoreConfig):
            raise ValueError("config must be a VectorStoreConfig")

        self.store = store
        self.config = VectorStoreConfig(
            backend=validate_backend_name(config.backend),
            collection_name=validate_collection_name(config.collection_name),
            dimension=validate_dimension(config.dimension),
            metadata=validate_metadata(config.metadata),
        )

    @property
    def backend(self) -> str:
        return self.config.backend

    def status(self) -> EngineStatus:
        initialized = self.store is not None
        health_method = getattr(self.store, "is_ready", None)
        if not callable(health_method):
            health_method = getattr(self.store, "health_check", None)

        if callable(health_method):
            try:
                healthy = bool(health_method())
                return EngineStatus(
                    initialized=initialized,
                    backend=self.backend,
                    healthy=healthy,
                    message="Adapter health check completed",
                )
            except Exception as exc:
                return EngineStatus(
                    initialized=initialized,
                    backend=self.backend,
                    healthy=False,
                    message=f"Adapter health check failed: {type(exc).__name__}",
                )

        return EngineStatus(
            initialized=initialized,
            backend=self.backend,
            healthy=None,
            message="No adapter health-check method is available",
        )

    def add_documents(self, documents: list[Any]) -> Any:
        if not isinstance(documents, list) or not documents:
            raise ValueError("documents must be a non-empty list")

        add_method = getattr(self.store, "add_documents", None)
        if not callable(add_method):
            raise NotImplementedError(
                f"Backend {self.backend!r} does not implement add_documents()"
            )

        for document in documents:
            doc_id = (
                document.get("document_id", document.get("id"))
                if isinstance(document, Mapping)
                else getattr(document, "document_id", None)
            )
            text = (
                document.get("text")
                if isinstance(document, Mapping)
                else getattr(document, "text", None)
            )
            if not isinstance(doc_id, str) or not doc_id.strip():
                raise ValueError("every document requires a document_id")
            if not isinstance(text, str) or not text.strip():
                raise ValueError(f"document {doc_id!r} requires non-empty text")

        return add_method(documents)

    def search(
        self,
        query_vector: list[float] | tuple[float, ...] | None = None,
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
        *,
        request: SearchRequest | None = None,
    ) -> SearchResponse:
        if request is not None:
            if not isinstance(request, SearchRequest):
                raise ValueError("request must be a SearchRequest")
            query_vector = request.query_vector
            top_k = request.top_k
            filters = request.filters

        top_k = validate_top_k(top_k)
        vector = validate_vector(query_vector, self.config.dimension)
        normalized_filters = validate_metadata(filters)

        search_method = getattr(self.store, "search", None)
        if not callable(search_method):
            raise NotImplementedError(
                f"Backend {self.backend!r} does not implement search()"
            )

        results = search_method(
            query_vector=vector,
            top_k=top_k,
            filters=normalized_filters,
        )

        # Normalize common adapter return shapes.
        if isinstance(results, Mapping):
            results = results.get("results", results.get("documents", []))
        if results is None:
            results = []
        if isinstance(results, (str, bytes)) or not isinstance(results, (list, tuple)):
            raise TypeError("backend search() must return a list, tuple, mapping, or None")

        results = list(results)
        return SearchResponse(
            results=results[:top_k],
            count=min(len(results), top_k),
            backend=self.backend,
        )

    def get_document(self, document_id: str) -> Any:
        method = getattr(self.store, "get_document", None)
        if not callable(method):
            raise NotImplementedError("Adapter does not implement get_document()")
        if not isinstance(document_id, str) or not document_id.strip():
            raise ValueError("document_id must be a non-empty string")
        return method(document_id.strip())

    def delete_documents(self, document_ids: list[str]) -> Any:
        method = getattr(self.store, "delete_documents", None)
        if not callable(method):
            raise NotImplementedError("Adapter does not implement delete_documents()")
        if not isinstance(document_ids, list) or not document_ids:
            raise ValueError("document_ids must be a non-empty list")
        if any(not isinstance(item, str) or not item.strip() for item in document_ids):
            raise ValueError("all document IDs must be non-empty strings")
        return method([item.strip() for item in document_ids])

    def list_collections(self) -> Any:
        method = getattr(self.store, "list_collections", None)
        if not callable(method):
            raise NotImplementedError("Adapter does not implement list_collections()")
        return method()

    def delete_collection(self, collection_name: str | None = None) -> Any:
        method = getattr(self.store, "delete_collection", None)
        if not callable(method):
            raise NotImplementedError("Adapter does not implement delete_collection()")
        target = validate_collection_name(collection_name or self.config.collection_name)
        return method(target)
