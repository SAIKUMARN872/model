"""Embedding cache facade with memory or Redis backend."""

import threading
from dataclasses import dataclass

from ai.embeddings.exceptions import EmbeddingProviderError
from .memory_cache import MemoryEmbeddingCache
from .redis_cache import RedisEmbeddingCache
from .utils import make_cache_key, validate_embedding


@dataclass(frozen=True, slots=True)
class EmbeddingCacheStats:
    hits: int
    misses: int
    writes: int
    errors: int


class EmbeddingCache:
    """Cache one embedding per model/text/configuration.

    Redis errors fail open by default: callers can recompute embeddings rather
    than making cache availability a prerequisite for inference. Set
    fail_open=False when cache errors must fail the operation.
    """

    def __init__(
        self,
        backend="memory",
        *,
        ttl_seconds=3600,
        max_entries=10_000,
        redis_url=None,
        namespace="modelnow:embeddings",
        fail_open=True,
    ):
        if not isinstance(fail_open, bool):
            raise ValueError("fail_open must be a boolean")

        self.backend_name = backend
        self.fail_open = fail_open
        self._lock = threading.Lock()
        self._hits = self._misses = self._writes = self._errors = 0

        if backend == "memory":
            self._backend = MemoryEmbeddingCache(
                max_entries=max_entries,
                ttl_seconds=ttl_seconds,
            )
        elif backend == "redis":
            self._backend = RedisEmbeddingCache(
                url=redis_url,
                namespace=namespace,
                ttl_seconds=ttl_seconds,
            )
        else:
            raise ValueError("backend must be 'memory' or 'redis'")

    @staticmethod
    def make_key(model_name, text, *, normalize=True, dimensions=None):
        return make_cache_key(
            model_name,
            text,
            normalize=normalize,
            dimensions=dimensions,
        )

    def _handle_error(self, operation, exc):
        with self._lock:
            self._errors += 1
        if not self.fail_open:
            raise EmbeddingProviderError(
                f"Embedding cache {operation} failed: {exc}"
            ) from exc

    def get(self, model_name, text, *, normalize=True, dimensions=None):
        key = self.make_key(
            model_name, text, normalize=normalize, dimensions=dimensions
        )
        try:
            if isinstance(self._backend, RedisEmbeddingCache):
                value = self._backend.get(key, expected_dimension=dimensions)
            else:
                value = self._backend.get(key)

            if value is None:
                with self._lock:
                    self._misses += 1
                return None

            vector = validate_embedding(value, dimensions)
            with self._lock:
                self._hits += 1
            return vector

        except Exception as exc:
            self._handle_error("read", exc)
            return None

    def set(
        self,
        model_name,
        text,
        vector,
        *,
        normalize=True,
        dimensions=None,
        ttl_seconds=None,
    ):
        key = self.make_key(
            model_name, text, normalize=normalize, dimensions=dimensions
        )
        validated = validate_embedding(vector, dimensions)
        try:
            if ttl_seconds is None:
                self._backend.set(key, validated)
            else:
                self._backend.set(key, validated, ttl_seconds=ttl_seconds)
            with self._lock:
                self._writes += 1
            return True
        except Exception as exc:
            self._handle_error("write", exc)
            return False

    def get_or_compute(
        self,
        model_name,
        text,
        compute,
        *,
        normalize=True,
        dimensions=None,
    ):
        cached = self.get(
            model_name, text, normalize=normalize, dimensions=dimensions
        )
        if cached is not None:
            return cached

        vector = validate_embedding(compute(), dimensions)
        self.set(
            model_name,
            text,
            vector,
            normalize=normalize,
            dimensions=dimensions,
        )
        return vector

    def delete(self, model_name, text, *, normalize=True, dimensions=None):
        key = self.make_key(
            model_name, text, normalize=normalize, dimensions=dimensions
        )
        try:
            return self._backend.delete(key)
        except Exception as exc:
            self._handle_error("delete", exc)
            return False

    def clear(self):
        try:
            return self._backend.clear()
        except Exception as exc:
            self._handle_error("clear", exc)
            return False

    def stats(self):
        with self._lock:
            return EmbeddingCacheStats(
                hits=self._hits,
                misses=self._misses,
                writes=self._writes,
                errors=self._errors,
            )

    def close(self):
        try:
            self._backend.close()
        except Exception as exc:
            self._handle_error("close", exc)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        self.close()
        return False
