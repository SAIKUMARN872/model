from __future__ import annotations

from dataclasses import dataclass

from .registry import RerankerRegistry


@dataclass(frozen=True, slots=True)
class RerankerSelection:
    provider_id: str
    reranker_class: type


class RerankerSelector:
    """Selects a registered reranker implementation."""

    def __init__(
        self,
        registry: RerankerRegistry,
    ) -> None:
        self.registry = registry

    def select(
        self,
        provider_id: str,
    ) -> RerankerSelection:
        normalized = provider_id.strip().lower()

        reranker_class = self.registry.get(
            normalized
        )

        return RerankerSelection(
            provider_id=normalized,
            reranker_class=reranker_class,
        )

    def supports(
        self,
        provider_id: str,
    ) -> bool:
        return self.registry.exists(provider_id)


__all__ = [
    "RerankerSelection",
    "RerankerSelector",
]
