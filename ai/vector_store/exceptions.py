"""Exceptions raised by the ModelNow vector-store subsystem."""


class VectorStoreError(Exception):
    """Base exception for vector-store operations."""


class VectorStoreConfigurationError(VectorStoreError):
    """Raised when vector-store configuration is invalid."""


class VectorCollectionNotFoundError(VectorStoreError):
    """Raised when a requested collection does not exist."""


class VectorDocumentNotFoundError(VectorStoreError):
    """Raised when a requested document does not exist."""


class VectorDocumentValidationError(VectorStoreError, ValueError):
    """Raised when a document or embedding is invalid."""


class VectorStoreConnectionError(VectorStoreError):
    """Raised when the vector database cannot be accessed."""


class VectorStoreOperationError(VectorStoreError):
    """Raised when a vector-store operation fails."""
