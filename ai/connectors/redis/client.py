"""Redis client exposing bounded read-only operations."""
from ai.connectors.exceptions import ConnectorConfigurationError, ConnectorRequestError


class RedisClient:
    def __init__(self, client, *, max_results=100):
        if isinstance(max_results, bool) or not isinstance(max_results, int) or not 1 <= max_results <= 100:
            raise ValueError("max_results must be from 1 to 100")
        self._client = client
        self._max_results = max_results

    @classmethod
    def from_environment(cls, config):
        import os
        from urllib.parse import urlsplit

        url = os.getenv(config.url_env_var)
        if not url:
            raise ConnectorConfigurationError(
                "Redis connection URL environment variable is required"
            )
        try:
            parsed = urlsplit(url)
            if (
                parsed.scheme not in ("redis", "rediss")
                or not parsed.hostname
                or parsed.fragment
            ):
                raise ValueError
            if parsed.port is not None and not 1 <= parsed.port <= 65535:
                raise ValueError
        except (ValueError, TypeError):
            raise ConnectorConfigurationError("Invalid Redis connection URL") from None

        try:
            import redis
        except ImportError:
            raise ConnectorConfigurationError(
                "Install redis to use the Redis connector"
            ) from None

        try:
            client = redis.Redis.from_url(
                url,
                socket_connect_timeout=config.timeout_seconds,
                socket_timeout=config.timeout_seconds,
                decode_responses=True,
                ssl_cert_reqs="required" if parsed.scheme == "rediss" else None,
            )
        except Exception:
            raise ConnectorConfigurationError(
                "Could not configure Redis client"
            ) from None
        return cls(client, max_results=config.max_results)

    def ping(self):
        try:
            return bool(self._client.ping())
        except Exception:
            raise ConnectorRequestError("Redis health check failed") from None

    def list_keys(self, pattern="*", limit=50):
        if not isinstance(pattern, str) or not pattern or len(pattern) > 128:
            raise ValueError("Invalid key pattern")
        if any(ord(char) < 32 for char in pattern):
            raise ValueError("Invalid key pattern")
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= self._max_results:
            raise ValueError("Invalid key limit")
        try:
            found = []
            for key in self._client.scan_iter(match=pattern, count=min(limit, 100)):
                found.append(key)
                if len(found) >= limit:
                    break
            return found
        except Exception:
            raise ConnectorRequestError("Redis key scan failed") from None

    def get_key_type(self, key):
        self._validate_key(key)
        try:
            return self._client.type(key)
        except Exception:
            raise ConnectorRequestError("Redis type lookup failed") from None

    def get_value(self, key, limit=50):
        self._validate_key(key)
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= self._max_results:
            raise ValueError("Invalid result limit")
        try:
            kind = self._client.type(key)
            if kind == "none":
                return {"type": "none", "value": None}
            if kind == "string":
                return {"type": kind, "value": self._client.get(key)}
            if kind == "hash":
                value = self._client.hscan(key, cursor=0, count=limit)[1]
                return {"type": kind, "value": dict(list(value.items())[:limit])}
            if kind == "list":
                return {"type": kind, "value": self._client.lrange(key, 0, limit - 1)}
            if kind == "set":
                values = self._client.sscan(key, cursor=0, count=limit)[1]
                return {"type": kind, "value": list(values)[:limit]}
            if kind == "zset":
                values = self._client.zrange(key, 0, limit - 1, withscores=True)
                return {"type": kind, "value": values}
            return {"type": kind, "value": None, "message": "Unsupported Redis data type"}
        except Exception:
            raise ConnectorRequestError("Redis value retrieval failed") from None

    @staticmethod
    def _validate_key(key):
        if not isinstance(key, str) or not key or len(key.encode("utf-8")) > 512:
            raise ValueError("Invalid Redis key")
        if any(ord(char) < 32 for char in key):
            raise ValueError("Invalid Redis key")
