"""Document CRUD operations for FAISS collections."""

from __future__ import annotations

import hashlib
from typing import Any

from ai.vector_store.exceptions import (
    VectorDocumentNotFoundError,
    VectorDocumentValidationError,
)
from ai.vector_store.models import VectorCollectionInfo, VectorDocument
from ai.vector_store.faiss.client import FaissClient


class FaissCollectionManager:
    def __init__(self, client: FaissClient | None = None) -> None:
        self.client = client or FaissClient()

    @staticmethod
    def _numeric_id(document_id: str) -> int:
        digest = hashlib.sha256(document_id.encode("utf-8")).digest()
        return int.from_bytes(digest[:8], "big") & ((1 << 63) - 1)

    def create_collection(self, name: str, dimension: int) -> VectorCollectionInfo:
        state = self.client.create_collection(name, dimension)
        return VectorCollectionInfo(name=state["name"], count=0)

    def add_documents(self, collection_name: str, documents: list[VectorDocument]) -> int:
        state = self.client.get_collection(collection_name)
        ids: list[int] = []
        vectors: list[list[float]] = []
        records: dict[str, dict[str, Any]] = {}

        for doc in documents:
            if not isinstance(doc, VectorDocument):
                raise VectorDocumentValidationError("Expected VectorDocument items")
            if doc.embedding is None:
                raise VectorDocumentValidationError(f"Missing embedding: {doc.document_id}")
            if len(doc.embedding) != state["dimension"]:
                raise VectorDocumentValidationError("Embedding dimension mismatch")
            if doc.document_id in state["documents"] or doc.document_id in records:
                raise VectorDocumentValidationError(f"Duplicate document: {doc.document_id}")
            numeric_id = self._numeric_id(doc.document_id)
            if numeric_id in state["index"].existing_ids() or numeric_id in ids:
                raise VectorDocumentValidationError("Document ID hash collision")
            ids.append(numeric_id)
            vectors.append(doc.embedding)
            records[doc.document_id] = {
                "numeric_id": numeric_id,
                "text": doc.text,
                "metadata": doc.metadata,
            }

        if not documents:
            return 0
        state["index"].add(ids, vectors)
        state["documents"].update(records)
        self.client._save_state(state)
        return len(documents)

    def get_document(self, collection_name: str, document_id: str) -> VectorDocument | None:
        state = self.client.get_collection(collection_name)
        record = state["documents"].get(document_id)
        if record is None:
            return None
        return VectorDocument(
            document_id=document_id,
            text=record["text"],
            metadata=record.get("metadata", {}),
        )

    def update_document(self, collection_name: str, document: VectorDocument) -> None:
        state = self.client.get_collection(collection_name)
        old = state["documents"].get(document.document_id)
        if old is None:
            raise VectorDocumentNotFoundError(document.document_id)
        if document.embedding is None or len(document.embedding) != state["dimension"]:
            raise VectorDocumentValidationError("A valid, dimension-matched embedding is required")
        state["index"].remove([old["numeric_id"]])
        state["index"].add([old["numeric_id"]], [document.embedding])
        state["documents"][document.document_id] = {
            "numeric_id": old["numeric_id"],
            "text": document.text,
            "metadata": document.metadata,
        }
        self.client._save_state(state)

    def delete_documents(self, collection_name: str, document_ids: list[str]) -> int:
        state = self.client.get_collection(collection_name)
        found = [doc_id for doc_id in document_ids if doc_id in state["documents"]]
        if not found:
            return 0
        state["index"].remove([state["documents"][doc_id]["numeric_id"] for doc_id in found])
        for doc_id in found:
            del state["documents"][doc_id]
        self.client._save_state(state)
        return len(found)

    def list_collections(self) -> list[VectorCollectionInfo]:
        return [
            VectorCollectionInfo(name=item["name"], count=item["count"])
            for item in self.client.list_collections()
        ]

    def delete_collection(self, collection_name: str) -> None:
        if not self.client.delete_collection(collection_name):
            raise KeyError(f"Collection not found: {collection_name}")
