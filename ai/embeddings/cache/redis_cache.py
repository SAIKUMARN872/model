"""
Redis-backed cache for ModelNow.

Redis is imported lazily so the rest of the application
does not require Redis to be installed.
"""

from __future__ import annotations

import json
from typing import Any


class RedisCacheError(
    Exception
):
    """Base Redis cache exception."""


class RedisUnavailableError(
    RedisCacheError
):
    """Raised when Redis is unavailable."""


class RedisCache:
    """
    Redis-backed cache implementation.

    Requires:

        pip install redis

    Example:

        cache = RedisCache(
            host="localhost",
            port=6379,
            db=0,
        )
    """

    def __init__(
        self,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        password: str | None = None,
        prefix: str = "modelnow",
        decode_responses: bool = True,
        socket_timeout: float = 5.0,
        client: Any = None,
    ) -> None:

        self.host = host

        self.port = port

        self.db = db

        self.password = password

        self.prefix = prefix.strip(
            ":"
        )

        self.decode_responses = (
            decode_responses
        )

        self.socket_timeout = (
            socket_timeout
        )

        self._client = client

        if self._client is None:

            self._create_client()

    # --------------------------------------------------
    # Connection
    # --------------------------------------------------

    def _create_client(self) -> None:

        try:

            import redis

        except ImportError as exc:

            raise RedisUnavailableError(
                "Redis support requires the "
                "'redis' package. Install it with "
                "'pip install redis'."
            ) from exc

        try:

            self._client = redis.Redis(
                host=self.host,
                port=self.port,
                db=self.db,
                password=self.password,
                decode_responses=(
                    self.decode_responses
                ),
                socket_timeout=(
                    self.socket_timeout
                ),
            )

        except Exception as exc:

            raise RedisUnavailableError(
                f"Failed to create Redis client: {exc}"
            ) from exc

    @property
    def client(self) -> Any:

        if self._client is None:

            self._create_client()

        return self._client

    def ping(self) -> bool:

        try:

            return bool(
                self.client.ping()
            )

        except Exception as exc:

            raise RedisUnavailableError(
                f"Redis ping failed: {exc}"
            ) from exc

    # --------------------------------------------------
    # Keys
    # --------------------------------------------------

    def _key(
        self,
        key: str,
    ) -> str:

        return (
            f"{self.prefix}:{key}"
        )

    # --------------------------------------------------
    # Basic operations
    # --------------------------------------------------

    def get(
        self,
        key: str,
        default: Any = None,
    ) -> Any:

        try:

            value = self.client.get(
                self._key(key)
            )

            if value is None:

                return default

            return self._deserialize(
                value
            )

        except Exception as exc:

            raise RedisCacheError(
                f"Redis GET failed: {exc}"
            ) from exc

    def set(
        self,
        key: str,
        value: Any,
        ttl: float | None = None,
    ) -> bool:

        try:

            serialized = self._serialize(
                value
            )

            redis_key = self._key(
                key
            )

            if ttl is None:

                return bool(
                    self.client.set(
                        redis_key,
                        serialized,
                    )
                )

            ttl = float(ttl)

            if ttl <= 0:

                return bool(
                    self.client.delete(
                        redis_key
                    )
                )

            # Redis supports millisecond precision.
            milliseconds = max(
                1,
                int(ttl * 1000),
            )

            return bool(
                self.client.set(
                    redis_key,
                    serialized,
                    px=milliseconds,
                )
            )

        except Exception as exc:

            raise RedisCacheError(
                f"Redis SET failed: {exc}"
            ) from exc

    def delete(
        self,
        key: str,
    ) -> bool:

        try:

            return (
                self.client.delete(
                    self._key(key)
                )
                > 0
            )

        except Exception as exc:

            raise RedisCacheError(
                f"Redis DELETE failed: {exc}"
            ) from exc

    def exists(
        self,
        key: str,
    ) -> bool:

        try:

            return bool(
                self.client.exists(
                    self._key(key)
                )
            )

        except Exception as exc:

            raise RedisCacheError(
                f"Redis EXISTS failed: {exc}"
            ) from exc

    # --------------------------------------------------
    # TTL
    # --------------------------------------------------

    def ttl(
        self,
        key: str,
    ) -> int:

        try:

            return int(
                self.client.ttl(
                    self._key(key)
                )
            )

        except Exception as exc:

            raise RedisCacheError(
                f"Redis TTL failed: {exc}"
            ) from exc

    def expire(
        self,
        key: str,
        ttl: float,
    ) -> bool:

        if ttl <= 0:

            return self.delete(
                key
            )

        try:

            milliseconds = max(
                1,
                int(ttl * 1000),
            )

            return bool(
                self.client.pexpire(
                    self._key(key),
                    milliseconds,
                )
            )

        except Exception as exc:

            raise RedisCacheError(
                f"Redis EXPIRE failed: {exc}"
            ) from exc

    # --------------------------------------------------
    # Bulk operations
    # --------------------------------------------------

    def get_many(
        self,
        keys: list[str],
    ) -> dict[str, Any]:

        if not keys:
            return {}

        redis_keys = [
            self._key(key)
            for key in keys
        ]

        try:

            values = self.client.mget(
                redis_keys
            )

            result = {}

            for key, value in zip(
                keys,
                values,
            ):

                if value is not None:

                    result[key] = (
                        self._deserialize(
                            value
                        )
                    )

            return result

        except Exception as exc:

            raise RedisCacheError(
                f"Redis MGET failed: {exc}"
            ) from exc

    def set_many(
        self,
        values: dict[str, Any],
        ttl: float | None = None,
    ) -> None:

        if not values:
            return

        # Pipeline keeps bulk operations efficient.
        try:

            pipeline = self.client.pipeline()

            for key, value in values.items():

                serialized = self._serialize(
                    value
                )

                redis_key = self._key(
                    key
                )

                if ttl is None:

                    pipeline.set(
                        redis_key,
                        serialized,
                    )

                else:

                    milliseconds = max(
                        1,
                        int(
                            float(ttl)
                            * 1000
                        ),
                    )

                    pipeline.set(
                        redis_key,
                        serialized,
                        px=milliseconds,
                    )

            pipeline.execute()

        except Exception as exc:

            raise RedisCacheError(
                f"Redis bulk SET failed: {exc}"
            ) from exc

    def delete_many(
        self,
        keys: list[str],
    ) -> int:

        if not keys:
            return 0

        try:

            redis_keys = [
                self._key(key)
                for key in keys
            ]

            return int(
                self.client.delete(
                    *redis_keys
                )
            )

        except Exception as exc:

            raise RedisCacheError(
                f"Redis bulk DELETE failed: {exc}"
            ) from exc

    # --------------------------------------------------
    # Maintenance
    # --------------------------------------------------

    def clear(self) -> None:
        """
        Delete only keys belonging to this cache prefix.
        """

        pattern = (
            f"{self.prefix}:*"
        )

        try:

            keys = list(
                self.client.scan_iter(
                    match=pattern
                )
            )

            if keys:

                self.client.delete(
                    *keys
                )

        except Exception as exc:

            raise RedisCacheError(
                f"Redis CLEAR failed: {exc}"
            ) from exc

    def keys(self) -> list[str]:

        pattern = (
            f"{self.prefix}:*"
        )

        try:

            result = []

            for key in self.client.scan_iter(
                match=pattern
            ):

                if isinstance(
                    key,
                    bytes,
                ):

                    key = key.decode(
                        "utf-8"
                    )

                prefix = (
                    f"{self.prefix}:"
                )

                if key.startswith(
                    prefix
                ):

                    result.append(
                        key[len(prefix):]
                    )

            return result

        except Exception as exc:

            raise RedisCacheError(
                f"Redis KEYS failed: {exc}"
            ) from exc

    # --------------------------------------------------
    # Serialization
    # --------------------------------------------------

    @staticmethod
    def _serialize(
        value: Any,
    ) -> str:

        try:

            return json.dumps(
                value,
                default=lambda obj: (
                    obj.to_dict()
                    if hasattr(
                        obj,
                        "to_dict",
                    )
                    else str(obj)
                ),
            )

        except (
            TypeError,
            ValueError,
        ) as exc:

            raise RedisCacheError(
                f"Unable to serialize cache value: "
                f"{exc}"
            ) from exc

    @staticmethod
    def _deserialize(
        value: Any,
    ) -> Any:

        if isinstance(
            value,
            bytes,
        ):

            value = value.decode(
                "utf-8"
            )

        try:

            return json.loads(
                value
            )

        except (
            json.JSONDecodeError,
            TypeError,
            ValueError,
        ):

            return value