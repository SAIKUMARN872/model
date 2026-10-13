from __future__ import annotations

from .bge.provider import BGEProvider
from .cohere.provider import CohereRerankerProvider
from .jina.provider import JinaRerankerProvider
from .mixedbread.provider import MixedbreadRerankerProvider
from .registry import RerankerRegistry


def create_default_reranker_registry() -> RerankerRegistry:
    """Create a registry containing all four reranker providers."""
    registry = RerankerRegistry()

    registry.register("bge", BGEProvider)
    registry.register("cohere", CohereRerankerProvider)
    registry.register("jina", JinaRerankerProvider)
    registry.register("mixedbread", MixedbreadRerankerProvider)

    return registry


__all__ = ["create_default_reranker_registry"]
