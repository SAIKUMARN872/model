"""Optional Redis-backed embedding cache."""

import os

from .utils import deserialize_embedding, serialize_embedding


class RedisEmbeddingCache:
    """Redis backend. The caller owns the Redis connection lifecycle."""

    def __init__(
        self,
        url=None,
        *,
        client=None,
        namespace="modelnow:embeddings",
        ttl_seconds=3600,
        socket_timeout=2.0,
    ):
        if not isinstance(namespace, str) or not namespace.strip():
            raise ValueError("namespace must be a non-empty string")
        if (
            isinstance(ttl_seconds, bool)
            or not isinstance(ttl_seconds, (int, float))
            or ttl_seconds <= 0
        ):
            raise ValueError("ttl_seconds must be positive")
        if (
            isinstance(socket_timeout, bool)
            or not isinstance(socket_timeout, (int, float))
            or socket_timeout <= 0
        ):
            raise ValueError("socket_timeout must be positive")

        self.namespace = namespace.strip().rstrip(":")
        self.ttl_seconds = ttl_seconds
        self._owns_client = client is None

        if client is None:
            redis_url = url or os.environ.get("MODELNOW_REDIS_URL")
            if not redis_url:
                raise ValueError(
                    "Provide url or set MODELNOW_REDIS_URL to enable Redis"
                )
            try:
                import redis
            except ImportError as exc:
                raise RuntimeError(
                    "Redis backend requires the 'redis' Python package"
                ) from exc

            client = redis.Redis.from_url(
                redis_url,
                socket_connect_timeout=socket_timeout,
                socket_timeout=socket_timeout,
                decode_responses=False,
                health_check_interval=30,
            )

        self._client = client

    def _key(self, key):
        if not isinstance(key, str) or not key:
            raise ValueError("Cache key must be a non-empty string")
        return f"{self.namespace}:{key}"

    def get(self, key, expected_dimension=None):
        payload = self._client.get(self._key(key))
        if payload is None:
            return None
        return deserialize_embedding(payload, expected_dimension)

    def set(self, key, vector, ttl_seconds=None):
        ttl = self.ttl_seconds if ttl_seconds is None else ttl_seconds
        if (
            isinstance(ttl, bool)
            or not isinstance(ttl, (int, float))
            or ttl <= 0
        ):
            raise ValueError("TTL must be positive")

        payload = serialize_embedding(vector)
        return bool(
            self._client.set(
                self._key(key),
                payload,
                ex=max(1, int(ttl)),
            )
        )

    def delete(self, key):
        return bool(self._client.delete(self._key(key)))

    def clear(self):
        # Only keys in this backend's namespace are removed.
        pattern = f"{self.namespace}:*"
        cursor = 0
        removed = 0
        while True:
            cursor, keys = self._client.scan(
                cursor=cursor, match=pattern, count=500
            )
            if keys:
                removed += self._client.delete(*keys)
            if cursor == 0:
                return removed

    def close(self):
        if self._owns_client:
            self._client.close()
