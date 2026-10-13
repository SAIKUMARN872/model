"""Shared constants for the ModelNow vector store."""

DEFAULT_COLLECTION_NAME = "modelnow_knowledge"
DEFAULT_TOP_K = 5
MAX_TOP_K = 100

DEFAULT_DISTANCE_METRIC = "cosine"

SUPPORTED_DISTANCE_METRICS = frozenset({
    "cosine",
    "l2",
    "ip",
})

DEFAULT_PERSIST_DIRECTORY = ".modelnow/vector_store"
DEFAULT_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

COLLECTION_METADATA_KEY = "modelnow"
