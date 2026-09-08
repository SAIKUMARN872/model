"""
ModelNow Memory package.

Provides memory storage, conversation history,
context construction, searching, and memory utilities.
"""

from .context import (
    MemoryContext,
)

from .history import (
    HistoryEntry,
    HistoryError,
    HistoryStore,
)

from .memory_manager import (
    MemoryError,
    MemoryManager,
    MemoryNotFoundError,
    MemoryRecord,
    MemorySearchResult,
)

from .utils import (
    approximate_tokens,
    build_context_text,
    keyword_match,
    merge_dicts,
    normalize_key,
    normalize_text,
    rank_memories,
    sanitize_metadata,
    truncate_text,
)


__all__ = [
    # Context
    "MemoryContext",

    # History
    "HistoryEntry",
    "HistoryStore",
    "HistoryError",

    # Memory
    "MemoryManager",
    "MemoryRecord",
    "MemorySearchResult",
    "MemoryError",
    "MemoryNotFoundError",

    # Utilities
    "normalize_text",
    "normalize_key",
    "approximate_tokens",
    "truncate_text",
    "sanitize_metadata",
    "keyword_match",
    "rank_memories",
    "build_context_text",
    "merge_dicts",
]


__version__ = "1.0.0"