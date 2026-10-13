"""Typed exceptions for the ModelNow memory subsystem."""


class MemoryErrorBase(Exception):
    """Base exception for memory operations."""


class MemoryValidationError(MemoryErrorBase, ValueError):
    """Raised when memory input violates a contract."""


class MemoryNotFoundError(MemoryErrorBase, LookupError):
    """Raised when a requested memory record does not exist."""


class MemoryConflictError(MemoryErrorBase):
    """Raised when a concurrent or versioned update conflicts."""


class MemoryStorageError(MemoryErrorBase):
    """Raised when a memory backend operation fails."""


class MemoryAuthorizationError(MemoryErrorBase, PermissionError):
    """Raised when a caller is not authorized to access a memory."""


class MemorySerializationError(MemoryErrorBase):
    """Raised when a memory record cannot be serialized safely."""


class MemoryBackendUnavailableError(MemoryStorageError):
    """Raised when a required backend is unavailable."""
