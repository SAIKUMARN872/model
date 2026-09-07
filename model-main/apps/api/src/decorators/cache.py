"""
Cache Decorators

Enterprise Cache Decorators

Features
--------
- Response Caching
- Cache Invalidation
- TTL Support
- Async Compatible
"""

from __future__ import annotations

import functools
import hashlib
import json
from typing import Any, Callable

from cache.cache import cache


# ==========================================================
# Cache Response
# ==========================================================

def cache_response(ttl: int = 300):
    """
    Cache function response.

    Example:
        @cache_response(ttl=300)
        async def get_models():
            ...
    """

    def decorator(func: Callable[..., Any]):

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            key_data = {
                "function": func.__module__ + "." + func.__name__,
                "args": str(args),
                "kwargs": str(kwargs),
            }

            cache_key = hashlib.sha256(
                json.dumps(
                    key_data,
                    sort_keys=True,
                ).encode()
            ).hexdigest()

            cached = await cache.get(cache_key)

            if cached is not None:
                return cached

            result = await func(*args, **kwargs)

            await cache.set(
                cache_key,
                result,
                ttl=ttl,
            )

            return result

        return wrapper

    return decorator


# ==========================================================
# Invalidate Cache
# ==========================================================

def invalidate_cache(pattern: str):
    """
    Delete cache after successful execution.

    Example:
        @invalidate_cache("models:*")
        async def create_model():
            ...
    """

    def decorator(func: Callable[..., Any]):

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            result = await func(*args, **kwargs)

            await cache.delete_pattern(pattern)

            return result

        return wrapper

    return decorator


# ==========================================================
# Cache Exists
# ==========================================================

def cache_exists(key: str):
    """
    Return cached value if exists.
    """

    def decorator(func: Callable[..., Any]):

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            value = await cache.get(key)

            if value is not None:
                return value

            result = await func(*args, **kwargs)

            await cache.set(key, result)

            return result

        return wrapper

    return decorator


# ==========================================================
# Skip Cache
# ==========================================================

def skip_cache(func: Callable[..., Any]):

    @functools.wraps(func)
    async def wrapper(*args, **kwargs):

        return await func(*args, **kwargs)

    return wrapper


# ==========================================================
# Refresh Cache
# ==========================================================

def refresh_cache(key: str, ttl: int = 300):
    """
    Always refresh cache.
    """

    def decorator(func: Callable[..., Any]):

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            result = await func(*args, **kwargs)

            await cache.set(
                key,
                result,
                ttl=ttl,
            )

            return result

        return wrapper

    return decorator 