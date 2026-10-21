"""Validation and helper functions for ModelNow document indexing."""

from __future__ import annotations

import hashlib
import math
from typing import Any, Iterable

from ai.vector_store.models import VectorDocument


DEFAULT_BATCH_SIZE = 64
MAX_BATCH_SIZE = 4096


def validate_batch_size(batch_size: int) -> int:
    if isinstance(batch_size, bool) or not isinstance(batch_size, int):
        raise TypeError("batch_size must be an integer")
    if not 1 <= batch_size <= MAX_BATCH_SIZE:
        raise ValueError(f"batch_size must be between 1 and {MAX_BATCH_SIZE}")
    return batch_size


def validate_collection_name(name: str) -> str:
    if not isinstance(name, str) or not name.strip():
        raise ValueError("collection_name must be a non-empty string")
    name = name.strip()
    if len(name) > 128 or name in {".", ".."}:
        raise ValueError("Invalid collection name")
    if any(ch not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.-" for ch in name):
        raise ValueError("Collection name contains unsupported characters")
    if not name[0].isalnum():
        raise ValueError("Collection name must start with a letter or number")
    return name


def generate_document_id(text: str, *, namespace: str = "") -> str:
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Document text must be a non-empty string")
    if not isinstance(namespace, str):
        raise TypeError("namespace must be a string")
    digest = hashlib.sha256(
        f"{namespace}\0{text}".encode("utf-8")
    ).hexdigest()
    return digest


def validate_document(document: VectorDocument) -> VectorDocument:
    if not isinstance(document, VectorDocument):
        raise TypeError("Every item must be a VectorDocument")

    if not document.document_id.strip():
        raise ValueError("Document ID cannot be empty")
    if not document.text.strip():
        raise ValueError("Document text cannot be empty")

    if document.embedding is not None:
        for value in document.embedding:
            if not math.isfinite(float(value)):
                raise ValueError("Embedding values must be finite")

    return document


def validate_documents(
    documents: Iterable[VectorDocument],
) -> list[VectorDocument]:
    if isinstance(documents, (str, bytes)):
        raise TypeError("documents must be an iterable of VectorDocument objects")

    result = list(documents)
    for document in result:
        validate_document(document)
    return result


def estimate_text_tokens(text: str) -> int:
    """Rough token estimate for planning only, not model tokenization."""
    if not isinstance(text, str):
        raise TypeError("text must be a string")
    return max(1, math.ceil(len(text) / 4)) if text else 0
