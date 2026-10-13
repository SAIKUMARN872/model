from .models import (
    BGEModelInfo,
    DEFAULT_BGE_MODEL,
    DEFAULT_BGE_DIMENSION,
    DEFAULT_BGE_BATCH_SIZE,
    DEFAULT_BGE_MAX_SEQUENCE_LENGTH,
    BGE_QUERY_INSTRUCTION,
)
from .provider import BGEProvider
from .client import BGEEmbeddingClient
from .utils import prepare_passages, prepare_queries

__all__ = [
    "BGEModelInfo",
    "DEFAULT_BGE_MODEL",
    "DEFAULT_BGE_DIMENSION",
    "DEFAULT_BGE_BATCH_SIZE",
    "DEFAULT_BGE_MAX_SEQUENCE_LENGTH",
    "BGE_QUERY_INSTRUCTION",
    "BGEProvider",
    "BGEEmbeddingClient",
    "prepare_passages",
    "prepare_queries",
]
