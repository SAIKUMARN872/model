"""
ModelNow Indexing Package.

Provides document chunking, embedding generation,
vector indexing, search and optimization.
"""

from .builder import (
    BuilderConfig,
    Document,
    IndexBuilder,
    IndexChunk,
)

from .manager import (
    IndexDimensionError,
    IndexErrorBase,
    IndexManager,
    IndexNotFoundError,
    IndexStats,
    SearchResult,
)

from .optimizer import (
    IndexOptimizer,
    OptimizationConfig,
    OptimizationReport,
)

from .utils import (
    batch_items,
    chunk_text,
    content_hash,
    cosine_similarity,
    document_hash,
    estimate_characters,
    estimate_tokens,
    generate_id,
    merge_metadata,
    normalize_text,
    tokenize,
    utc_now,
    validate_dimension,
)


__all__ = [
    # Builder
    "Document",
    "IndexChunk",
    "BuilderConfig",
    "IndexBuilder",

    # Manager
    "IndexManager",
    "SearchResult",
    "IndexStats",
    "IndexErrorBase",
    "IndexNotFoundError",
    "IndexDimensionError",

    # Optimizer
    "IndexOptimizer",
    "OptimizationConfig",
    "OptimizationReport",

    # Utilities
    "utc_now",
    "generate_id",
    "normalize_text",
    "tokenize",
    "estimate_tokens",
    "estimate_characters",
    "content_hash",
    "document_hash",
    "cosine_similarity",
    "chunk_text",
    "batch_items",
    "merge_metadata",
    "validate_dimension",
]


__version__ = "1.0.0"