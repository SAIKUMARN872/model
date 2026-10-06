from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Mapping, Optional


def _to_decimal(value: Any, default: Decimal = Decimal("0")) -> Decimal:
    if value is None:
        return default

    try:
        return Decimal(str(value))
    except Exception:
        return default


def _to_non_negative_decimal(
    value: Any,
    default: Decimal = Decimal("0"),
) -> Decimal:
    return max(Decimal("0"), _to_decimal(value, default))


@dataclass(frozen=True)
class PerformanceProfile:
    """
    Immutable performance measurement for one model execution.

    The profiler is intentionally provider-agnostic. It can be populated
    by OpenAI, Anthropic, Azure, Bedrock, local models, or other providers.
    """

    request_id: str
    model: str
    provider: str

    latency_ms: Decimal = Decimal("0")
    time_to_first_token_ms: Decimal = Decimal("0")

    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0

    throughput_tokens_per_second: Decimal = Decimal("0")

    success: bool = True
    error_type: Optional[str] = None
    error_message: Optional[str] = None

    started_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    completed_at: Optional[datetime] = None

    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not str(self.request_id).strip():
            raise ValueError("request_id must not be empty")

        if not str(self.model).strip():
            raise ValueError("model must not be empty")

        if not str(self.provider).strip():
            raise ValueError("provider must not be empty")

        latency = _to_non_negative_decimal(self.latency_ms)
        ttft = _to_non_negative_decimal(
            self.time_to_first_token_ms
        )

        input_tokens = max(0, int(self.input_tokens))
        output_tokens = max(0, int(self.output_tokens))
        total_tokens = max(0, int(self.total_tokens))

        if total_tokens == 0:
            total_tokens = input_tokens + output_tokens

        throughput = _to_non_negative_decimal(
            self.throughput_tokens_per_second
        )

        if throughput == Decimal("0") and total_tokens > 0 and latency > 0:
            throughput = (
                Decimal(total_tokens)
                / latency
                * Decimal("1000")
            )

        if self.success:
            error_type = None
            error_message = None
        else:
            error_type = (
                str(self.error_type).strip()
                if self.error_type is not None
                else None
            )
            error_message = (
                str(self.error_message).strip()
                if self.error_message is not None
                else None
            )

        object.__setattr__(self, "latency_ms", latency)
        object.__setattr__(
            self,
            "time_to_first_token_ms",
            ttft,
        )
        object.__setattr__(
            self,
            "input_tokens",
            input_tokens,
        )
        object.__setattr__(
            self,
            "output_tokens",
            output_tokens,
        )
        object.__setattr__(
            self,
            "total_tokens",
            total_tokens,
        )
        object.__setattr__(
            self,
            "throughput_tokens_per_second",
            throughput,
        )
        object.__setattr__(
            self,
            "error_type",
            error_type,
        )
        object.__setattr__(
            self,
            "error_message",
            error_message,
        )
        object.__setattr__(
            self,
            "metadata",
            dict(self.metadata),
        )

    @property
    def failed(self) -> bool:
        return not self.success

    @property
    def duration_seconds(self) -> Decimal:
        return self.latency_ms / Decimal("1000")

    def as_dict(self) -> dict[str, Any]:
        return {
            "request_id": self.request_id,
            "model": self.model,
            "provider": self.provider,
            "latency_ms": str(self.latency_ms),
            "time_to_first_token_ms": str(
                self.time_to_first_token_ms
            ),
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens,
            "throughput_tokens_per_second": str(
                self.throughput_tokens_per_second
            ),
            "success": self.success,
            "error_type": self.error_type,
            "error_message": self.error_message,
            "started_at": self.started_at.isoformat(),
            "completed_at": (
                self.completed_at.isoformat()
                if self.completed_at is not None
                else None
            ),
            "metadata": dict(self.metadata),
        }


class PerformanceProfiler:
    """
    Creates normalized performance profiles.

    This class does not execute models. It only records and normalizes
    measurements produced by the execution layer.
    """

    def profile(
        self,
        *,
        request_id: str,
        model: str,
        provider: str,
        latency_ms: Any = 0,
        time_to_first_token_ms: Any = 0,
        input_tokens: int = 0,
        output_tokens: int = 0,
        total_tokens: int = 0,
        success: bool = True,
        error_type: Optional[str] = None,
        error_message: Optional[str] = None,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
        metadata: Optional[Mapping[str, Any]] = None,
    ) -> PerformanceProfile:
        latency = _to_non_negative_decimal(latency_ms)
        total = max(0, int(total_tokens))

        if total == 0:
            total = max(0, int(input_tokens)) + max(
                0,
                int(output_tokens),
            )

        throughput = Decimal("0")

        if latency > 0 and total > 0:
            throughput = (
                Decimal(total)
                / latency
                * Decimal("1000")
            )

        return PerformanceProfile(
            request_id=request_id,
            model=model,
            provider=provider,
            latency_ms=latency,
            time_to_first_token_ms=_to_non_negative_decimal(
                time_to_first_token_ms
            ),
            input_tokens=max(0, int(input_tokens)),
            output_tokens=max(0, int(output_tokens)),
            total_tokens=total,
            throughput_tokens_per_second=throughput,
            success=bool(success),
            error_type=error_type,
            error_message=error_message,
            started_at=started_at or datetime.now(timezone.utc),
            completed_at=completed_at,
            metadata=metadata or {},
        )

    def profile_mapping(
        self,
        data: Mapping[str, Any],
    ) -> PerformanceProfile:
        if "request_id" not in data:
            raise ValueError("request_id is required")

        return self.profile(
            request_id=str(data["request_id"]),
            model=str(data.get("model", "")),
            provider=str(data.get("provider", "")),
            latency_ms=data.get("latency_ms", 0),
            time_to_first_token_ms=data.get(
                "time_to_first_token_ms",
                0,
            ),
            input_tokens=int(data.get("input_tokens", 0)),
            output_tokens=int(data.get("output_tokens", 0)),
            total_tokens=int(data.get("total_tokens", 0)),
            success=bool(data.get("success", True)),
            error_type=data.get("error_type"),
            error_message=data.get("error_message"),
            started_at=data.get("started_at"),
            completed_at=data.get("completed_at"),
            metadata=data.get("metadata", {}),
        )


def create_profiler() -> PerformanceProfiler:
    return PerformanceProfiler()


__all__ = [
    "PerformanceProfile",
    "PerformanceProfiler",
    "create_profiler",
]
