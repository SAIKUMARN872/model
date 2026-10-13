from __future__ import annotations

from dataclasses import dataclass

from .cache import LatencyCache
from .cache_policy import (
    CachePolicy,
    CacheStrategy,
)
from .redis_cache import RedisLatencyCache
from .utils import (
    build_cache_key,
    deserialize_value,
    is_expired,
    remaining_ttl,
    serialize_value,
)


@dataclass
class FakeRedis:
    """Minimal Redis-compatible test double."""

    def __init__(self) -> None:
        self.data: dict[str, str] = {}
        self.expiry: dict[str, int] = {}

    def setex(
        self,
        key: str,
        ttl: int,
        value: str,
    ) -> bool:
        self.data[key] = value
        self.expiry[key] = ttl
        return True

    def get(self, key: str) -> str | None:
        return self.data.get(key)

    def delete(self, *keys: str) -> int:
        deleted = 0

        for key in keys:
            if key in self.data:
                del self.data[key]
                self.expiry.pop(key, None)
                deleted += 1

        return deleted

    def exists(self, key: str) -> int:
        return int(key in self.data)

    def ttl(self, key: str) -> int:
        if key not in self.data:
            return -2

        return self.expiry.get(key, -1)

    def scan_iter(self, match: str):
        prefix = match.rstrip("*")

        for key in list(self.data):
            if key.startswith(prefix):
                yield key

    def ping(self) -> bool:
        return True


def main() -> None:
    policy = CachePolicy(
        enabled=True,
        ttl_seconds=60.0,
        strategy=CacheStrategy.TTL,
        max_entries=2,
    )

    cache = LatencyCache(policy)

    assert cache.set(
        "key-1",
        {"response": "hello"},
    ) is True

    assert cache.get("key-1") == {
        "response": "hello",
    }

    assert cache.hits == 1
    assert cache.misses == 0
    print("CACHE SET/GET: PASS")

    assert cache.contains("key-1") is True
    assert cache.ttl("key-1") > 0.0
    print("CACHE CONTAINS/TTL: PASS")

    assert cache.delete("key-1") is True
    assert cache.contains("key-1") is False
    print("CACHE DELETE: PASS")

    assert cache.get("missing") is None
    assert cache.misses == 1
    print("CACHE MISS: PASS")

    cache.set("key-2", "value-2")
    cache.set("key-3", "value-3")
    cache.set("key-4", "value-4")

    assert cache.size == 2
    assert cache.contains("key-2") is False
    assert cache.contains("key-4") is True
    print("MAX ENTRY LIMIT: PASS")

    stream_policy = CachePolicy(
        cache_streaming=False,
    )

    stream_cache = LatencyCache(stream_policy)

    assert stream_cache.set(
        "stream-key",
        "stream-value",
        stream=True,
    ) is False

    assert stream_cache.size == 0
    print("STREAM POLICY: PASS")

    failure_policy = CachePolicy(
        cache_failures=False,
    )

    failure_cache = LatencyCache(failure_policy)

    assert failure_cache.set(
        "failure-key",
        "failure-value",
        success=False,
    ) is False

    assert failure_cache.size == 0
    print("FAILURE POLICY: PASS")

    disabled_policy = CachePolicy(
        enabled=False,
    )

    disabled_cache = LatencyCache(disabled_policy)

    assert disabled_cache.set(
        "disabled-key",
        "value",
    ) is False

    assert disabled_cache.size == 0
    print("DISABLED CACHE: PASS")

    key_a = build_cache_key(
        model_id="openai:gpt-5",
        provider="openai",
        messages=[
            {
                "role": "user",
                "content": "Hello",
            }
        ],
    )

    key_b = build_cache_key(
        model_id="openai:gpt-5",
        provider="openai",
        messages=[
            {
                "role": "user",
                "content": "Hello",
            }
        ],
    )

    assert key_a == key_b
    assert key_a.startswith("modelnow:latency:")
    print("CACHE KEY: PASS")

    serialized = serialize_value(
        {
            "answer": "hello",
            "score": 0.95,
        }
    )

    assert deserialize_value(serialized) == {
        "answer": "hello",
        "score": 0.95,
    }
    print("SERIALIZATION: PASS")

    assert is_expired(
        created_at=100.0,
        ttl_seconds=60.0,
        now=159.0,
    ) is False

    assert is_expired(
        created_at=100.0,
        ttl_seconds=60.0,
        now=160.0,
    ) is True

    assert remaining_ttl(
        created_at=100.0,
        ttl_seconds=60.0,
        now=125.0,
    ) == 35.0

    print("EXPIRATION: PASS")

    fake_redis = FakeRedis()

    redis_cache = RedisLatencyCache(
        policy=policy,
        client=fake_redis,
    )

    assert redis_cache.ping() is True

    assert redis_cache.set(
        "modelnow:latency:test",
        {
            "response": "cached",
        },
    ) is True

    assert redis_cache.get(
        "modelnow:latency:test",
    ) == {
        "response": "cached",
    }

    assert redis_cache.contains(
        "modelnow:latency:test",
    ) is True

    assert redis_cache.ttl(
        "modelnow:latency:test",
    ) == 60.0

    print("REDIS ADAPTER: PASS")

    assert redis_cache.delete(
        "modelnow:latency:test",
    ) is True

    assert redis_cache.get(
        "modelnow:latency:test",
    ) is None

    print("REDIS DELETE: PASS")

    redis_cache.set(
        "modelnow:latency:one",
        "one",
    )

    redis_cache.set(
        "modelnow:latency:two",
        "two",
    )

    assert redis_cache.clear() == 2
    print("REDIS CLEAR: PASS")

    print("MODELNOW LATENCY CACHE TEST: PASS")


if __name__ == "__main__":
    main()
