"""
Constants used by the embeddings subsystem.
"""

from __future__ import annotations


DEFAULT_PROVIDER = "sentence_transformers"

DEFAULT_MODEL = (
    "sentence-transformers/all-MiniLM-L6-v2"
)

SUPPORTED_PROVIDERS = (
    "bge",
    "e5",
    "jina",
    "nomic",
    "openai",
    "sentence_transformers",
    "voyage",
)

SUPPORTED_METRICS = (
    "cosine",
    "dot",
    "dot_product",
    "euclidean",
    "l2",
)

DEFAULT_BATCH_SIZE = 32

DEFAULT_MAX_TEXT_LENGTH = 8192

QUERY = "query"

DOCUMENT = "document"

EMBEDDING = "embedding"

VECTOR = "vector"