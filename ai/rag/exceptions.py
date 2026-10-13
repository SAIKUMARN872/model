"""Typed exceptions for ModelNow RAG operations."""

class RAGError(Exception):
    """Base exception for RAG failures."""


class RAGValidationError(RAGError, ValueError):
    """Input validation failed."""


class RAGConfigurationError(RAGError):
    """RAG components are configured incorrectly."""


class RAGIngestionError(RAGError):
    """Document loading or indexing failed."""


class RAGRetrievalError(RAGError):
    """Document retrieval failed."""


class RAGGenerationError(RAGError):
    """Answer generation failed."""


class RAGCacheError(RAGError):
    """RAG cache operations failed."""


class RAGEvaluationError(RAGError):
    """RAG evaluation failed."""


__all__ = [
    "RAGError",
    "RAGValidationError",
    "RAGConfigurationError",
    "RAGIngestionError",
    "RAGRetrievalError",
    "RAGGenerationError",
    "RAGCacheError",
    "RAGEvaluationError",
]
