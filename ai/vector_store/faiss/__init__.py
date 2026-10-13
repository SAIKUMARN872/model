"""FAISS backend for ModelNow vector storage."""

from ai.vector_store.faiss.client import FaissClient
from ai.vector_store.faiss.collections import FaissCollectionManager
from ai.vector_store.faiss.index import FaissIndex
from ai.vector_store.faiss.search import FaissSearch
from ai.vector_store.faiss.utils import (
    validate_collection_name,
    validate_dimension,
    validate_embedding,
    validate_top_k,
)

__all__ = [
    "FaissClient",
    "FaissCollectionManager",
    "FaissIndex",
    "FaissSearch",
    "validate_collection_name",
    "validate_dimension",
    "validate_embedding",
    "validate_top_k",
]
