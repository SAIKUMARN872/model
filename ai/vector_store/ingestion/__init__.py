"""ModelNow vector-store ingestion public API."""

from ai.vector_store.ingestion.chunker import TextChunk, TextChunker
from ai.vector_store.ingestion.embeddings import (
    IngestionEmbeddingAdapter,
)
from ai.vector_store.ingestion.loader import LoadedSource, SourceLoader
from ai.vector_store.ingestion.utils import (
    SUPPORTED_EXTENSIONS,
    normalize_text,
    source_id_for_path,
    validate_chunk_settings,
    validate_source_id,
)

__all__ = [
    "IngestionEmbeddingAdapter",
    "LoadedSource",
    "SUPPORTED_EXTENSIONS",
    "SourceLoader",
    "TextChunk",
    "TextChunker",
    "normalize_text",
    "source_id_for_path",
    "validate_chunk_settings",
    "validate_source_id",
]
