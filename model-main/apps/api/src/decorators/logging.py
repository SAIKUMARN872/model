"""
Logging Decorators

Enterprise Logging Decorators

Features
--------
- Function Execution Logging
- Request Logging
- Response Logging
- Performance Timing
- Exception Logging
"""

from __future__ import annotations

import functools
import time
from typing import Any, Callable

from config.logging import log


# ==========================================================
# Execution Logger
# ==========================================================

def log_execution(func: Callable[..., Any]):
    """
    Log function execution time.
    """

    @functools.wraps(func)
    async def wrapper(*args, **kwargs):

        start = time.perf_counter()

        log.info(
            f"Executing {func.__module__}.{func.__name__}"
        )

        try:

            result = await func(*args, **kwargs)

            elapsed = round(
                time.perf_counter() - start,
                4,
            )

            log.info(
                f"{func.__name__} completed in {elapsed}s"
            )

            return result

        except Exception as exc:

            elapsed = round(
                time.perf_counter() - start,
                4,
            )

            log.exception(
                f"{func.__name__} failed after {elapsed}s",
                error=str(exc),
            )

            raise

    return wrapper


# ==========================================================
# Request Logger
# ==========================================================

def log_request(func: Callable[..., Any]):

    @functools.wraps(func)
    async def wrapper(*args, **kwargs):

        log.info(
            f"Incoming request -> {func.__name__}"
        )

        return await func(*args, **kwargs)

    return wrapper


# ==========================================================
# Response Logger
# ==========================================================

def log_response(func: Callable[..., Any]):

    @functools.wraps(func)
    async def wrapper(*args, **kwargs):

        response = await func(*args, **kwargs)

        log.info(
            f"Response generated <- {func.__name__}"
        )

        return response

    return wrapper


# ==========================================================
# Exception Logger
# ==========================================================

def log_exception(func: Callable[..., Any]):

    @functools.wraps(func)
    async def wrapper(*args, **kwargs):

        try:

            return await func(*args, **kwargs)

        except Exception as exc:

            log.exception(
                f"Exception in {func.__name__}",
                error=str(exc),
            )

            raise

    return wrapper


# ==========================================================
# Performance Logger
# ==========================================================

def log_performance(threshold: float = 1.0):
    """
    Log slow functions.

    threshold = seconds
    """

    def decorator(func: Callable[..., Any]):

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            start = time.perf_counter()

            result = await func(*args, **kwargs)

            elapsed = time.perf_counter() - start

            if elapsed >= threshold:

                log.warning(
                    f"Slow execution detected: "
                    f"{func.__name__} "
                    f"({elapsed:.3f}s)"
                )

            return result

        return wrapper

    return decorator


# ==========================================================
# Audit Logger
# ==========================================================

def audit(action: str):

    def decorator(func: Callable[..., Any]):

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):

            log.info(
                f"AUDIT -> {action}"
            )

            return await func(*args, **kwargs)

        return wrapper

    return decorator 