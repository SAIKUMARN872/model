from __future__ import annotations

from threading import RLock
from typing import Type

from .common import BaseReranker


class RerankerRegistry:
    """Thread-safe registry of concrete ModelNow rerankers."""

    def __init__(self) -> None:
        self._rerankers: dict[str, Type[BaseReranker]] = {}
        self._lock = RLock()

    @staticmethod
    def _normalize(provider_id: str) -> str:
        if not provider_id or not provider_id.strip():
            raise ValueError(
                "Reranker provider ID cannot be empty."
            )

        return (
            provider_id.strip()
            .lower()
            .replace("-", "_")
            .replace(" ", "_")
        )

    def register(
        self,
        provider_id: str,
        reranker_class: Type[BaseReranker],
        *,
        overwrite: bool = False,
    ) -> None:
        normalized = self._normalize(provider_id)

        if not isinstance(reranker_class, type):
            raise TypeError(
                "reranker_class must be a class."
            )

        if not issubclass(reranker_class, BaseReranker):
            raise TypeError(
                "reranker_class must inherit from BaseReranker."
            )

        with self._lock:
            if (
                normalized in self._rerankers
                and not overwrite
            ):
                raise ValueError(
                    f"Reranker '{normalized}' "
                    "is already registered."
                )

            self._rerankers[normalized] = reranker_class

    def get(
        self,
        provider_id: str,
    ) -> Type[BaseReranker]:
        normalized = self._normalize(provider_id)

        with self._lock:
            reranker = self._rerankers.get(normalized)

        if reranker is None:
            raise KeyError(
                f"Reranker '{normalized}' is not registered."
            )

        return reranker

    def exists(self, provider_id: str) -> bool:
        normalized = self._normalize(provider_id)

        with self._lock:
            return normalized in self._rerankers

    def remove(
        self,
        provider_id: str,
    ) -> Type[BaseReranker] | None:
        normalized = self._normalize(provider_id)

        with self._lock:
            return self._rerankers.pop(
                normalized,
                None,
            )

    def list(self) -> list[Type[BaseReranker]]:
        with self._lock:
            return list(self._rerankers.values())

    def names(self) -> list[str]:
        with self._lock:
            return sorted(self._rerankers.keys())

    def clear(self) -> None:
        with self._lock:
            self._rerankers.clear()

    def count(self) -> int:
        with self._lock:
            return len(self._rerankers)


__all__ = ["RerankerRegistry"]
