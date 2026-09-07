"""
Quota definitions and quota state management.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from threading import RLock
from typing import Any


class QuotaPeriod(str, Enum):
    """
    Supported quota periods.
    """

    REQUEST = "request"
    MINUTE = "minute"
    HOUR = "hour"
    DAY = "day"
    MONTH = "month"


@dataclass(frozen=True)
class QuotaLimit:
    """
    Defines limits for a scope.

    Limits are optional. None means unlimited.
    """

    scope_id: str

    max_requests: int | None = None
    max_tokens: int | None = None
    max_input_tokens: int | None = None
    max_output_tokens: int | None = None

    period: QuotaPeriod = QuotaPeriod.DAY

    enabled: bool = True

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:
        if not self.scope_id:
            raise ValueError(
                "scope_id cannot be empty"
            )

        limits = (
            self.max_requests,
            self.max_tokens,
            self.max_input_tokens,
            self.max_output_tokens,
        )

        for value in limits:
            if value is not None and value < 0:
                raise ValueError(
                    "Quota limits cannot be negative"
                )


@dataclass
class QuotaUsage:
    """
    Current quota consumption.
    """

    scope_id: str

    requests: int = 0
    tokens: int = 0

    input_tokens: int = 0
    output_tokens: int = 0

    reserved_requests: int = 0
    reserved_tokens: int = 0

    period_started_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    def __post_init__(self) -> None:
        values = (
            self.requests,
            self.tokens,
            self.input_tokens,
            self.output_tokens,
            self.reserved_requests,
            self.reserved_tokens,
        )

        if any(value < 0 for value in values):
            raise ValueError(
                "Quota usage cannot be negative"
            )

    @property
    def effective_requests(self) -> int:
        return (
            self.requests
            + self.reserved_requests
        )

    @property
    def effective_tokens(self) -> int:
        return (
            self.tokens
            + self.reserved_tokens
        )

    @property
    def available_requests(
        self,
    ) -> int | None:
        return None

    @property
    def available_tokens(
        self,
    ) -> int | None:
        return None


class QuotaStore:
    """
    Thread-safe in-memory quota store.

    This is intentionally independent of persistence.
    A database-backed implementation can replace this
    class later.
    """

    def __init__(self) -> None:
        self._limits: dict[str, QuotaLimit] = {}
        self._usage: dict[str, QuotaUsage] = {}

        self._lock = RLock()

    def set_limit(
        self,
        limit: QuotaLimit,
    ) -> QuotaLimit:

        with self._lock:
            self._limits[limit.scope_id] = limit

            if limit.scope_id not in self._usage:
                self._usage[
                    limit.scope_id
                ] = QuotaUsage(
                    scope_id=limit.scope_id
                )

        return limit

    def get_limit(
        self,
        scope_id: str,
    ) -> QuotaLimit | None:

        with self._lock:
            return self._limits.get(scope_id)

    def require_limit(
        self,
        scope_id: str,
    ) -> QuotaLimit:

        limit = self.get_limit(scope_id)

        if limit is None:
            raise KeyError(
                f"Quota not found: {scope_id}"
            )

        return limit

    def get_usage(
        self,
        scope_id: str,
    ) -> QuotaUsage:

        with self._lock:

            usage = self._usage.get(scope_id)

            if usage is None:
                usage = QuotaUsage(
                    scope_id=scope_id
                )

                self._usage[
                    scope_id
                ] = usage

            return usage

    def reset(
        self,
        scope_id: str,
    ) -> QuotaUsage:

        with self._lock:

            usage = QuotaUsage(
                scope_id=scope_id,
                period_started_at=(
                    datetime.now(timezone.utc)
                ),
            )

            self._usage[
                scope_id
            ] = usage

            return usage

    def reserve(
        self,
        scope_id: str,
        requests: int = 0,
        tokens: int = 0,
    ) -> QuotaUsage:

        if requests < 0:
            raise ValueError(
                "requests cannot be negative"
            )

        if tokens < 0:
            raise ValueError(
                "tokens cannot be negative"
            )

        with self._lock:

            usage = self.get_usage(scope_id)

            limit = self.get_limit(scope_id)

            if limit is not None:

                if (
                    limit.max_requests is not None
                    and (
                        usage.effective_requests
                        + requests
                        > limit.max_requests
                    )
                ):
                    raise ValueError(
                        "Request quota exceeded"
                    )

                if (
                    limit.max_tokens is not None
                    and (
                        usage.effective_tokens
                        + tokens
                        > limit.max_tokens
                    )
                ):
                    raise ValueError(
                        "Token quota exceeded"
                    )

            usage.reserved_requests += requests
            usage.reserved_tokens += tokens

            usage.updated_at = (
                datetime.now(timezone.utc)
            )

            return usage

    def release(
        self,
        scope_id: str,
        requests: int = 0,
        tokens: int = 0,
    ) -> QuotaUsage:

        with self._lock:

            usage = self.get_usage(scope_id)

            usage.reserved_requests = max(
                0,
                usage.reserved_requests - requests,
            )

            usage.reserved_tokens = max(
                0,
                usage.reserved_tokens - tokens,
            )

            usage.updated_at = (
                datetime.now(timezone.utc)
            )

            return usage

    def commit(
        self,
        scope_id: str,
        requests: int = 1,
        tokens: int = 0,
        input_tokens: int = 0,
        output_tokens: int = 0,
    ) -> QuotaUsage:

        if requests < 0:
            raise ValueError(
                "requests cannot be negative"
            )

        if tokens < 0:
            raise ValueError(
                "tokens cannot be negative"
            )

        if input_tokens < 0:
            raise ValueError(
                "input_tokens cannot be negative"
            )

        if output_tokens < 0:
            raise ValueError(
                "output_tokens cannot be negative"
            )

        with self._lock:

            usage = self.get_usage(scope_id)

            usage.reserved_requests = max(
                0,
                usage.reserved_requests - requests,
            )

            usage.reserved_tokens = max(
                0,
                usage.reserved_tokens - tokens,
            )

            usage.requests += requests
            usage.tokens += tokens

            usage.input_tokens += input_tokens
            usage.output_tokens += output_tokens

            usage.updated_at = (
                datetime.now(timezone.utc)
            )

            return usage

    def all_limits(
        self,
    ) -> dict[str, QuotaLimit]:

        with self._lock:
            return dict(self._limits)

    def all_usage(
        self,
    ) -> dict[str, QuotaUsage]:

        with self._lock:
            return dict(self._usage)