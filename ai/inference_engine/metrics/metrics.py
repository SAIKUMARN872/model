from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class InferenceMetrics:
    """Aggregated inference metrics."""

    request_count: int = 0
    success_count: int = 0
    failure_count: int = 0

    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0

    estimated_cost: float = 0.0

    latency_ms_total: float = 0.0
    latency_ms_samples: int = 0

    ttft_ms_total: float = 0.0
    ttft_ms_samples: int = 0

    def record_success(
        self,
        *,
        input_tokens: int = 0,
        output_tokens: int = 0,
        total_tokens: int = 0,
        estimated_cost: float = 0.0,
        latency_ms: float | None = None,
        time_to_first_token_ms: float | None = None,
    ) -> None:
        self.request_count += 1
        self.success_count += 1

        self.input_tokens += input_tokens
        self.output_tokens += output_tokens
        self.total_tokens += total_tokens
        self.estimated_cost += estimated_cost

        if latency_ms is not None:
            self.latency_ms_total += latency_ms
            self.latency_ms_samples += 1

        if time_to_first_token_ms is not None:
            self.ttft_ms_total += time_to_first_token_ms
            self.ttft_ms_samples += 1

    def record_failure(self) -> None:
        self.request_count += 1
        self.failure_count += 1

    @property
    def success_rate(self) -> float:
        if self.request_count == 0:
            return 0.0

        return self.success_count / self.request_count

    @property
    def average_latency_ms(self) -> float:
        if self.latency_ms_samples == 0:
            return 0.0

        return (
            self.latency_ms_total
            / self.latency_ms_samples
        )

    @property
    def average_ttft_ms(self) -> float:
        if self.ttft_ms_samples == 0:
            return 0.0

        return (
            self.ttft_ms_total
            / self.ttft_ms_samples
        )


@dataclass
class MetricsRegistry:
    """Store metrics globally, by backend and by model."""

    overall: InferenceMetrics = field(
        default_factory=InferenceMetrics
    )

    by_backend: dict[str, InferenceMetrics] = field(
        default_factory=dict
    )

    by_model: dict[str, InferenceMetrics] = field(
        default_factory=dict
    )

    def _backend_metrics(
        self,
        backend: str,
    ) -> InferenceMetrics:
        return self.by_backend.setdefault(
            backend,
            InferenceMetrics(),
        )

    def _model_metrics(
        self,
        model: str,
    ) -> InferenceMetrics:
        return self.by_model.setdefault(
            model,
            InferenceMetrics(),
        )

    def record_success(
        self,
        *,
        backend: str,
        model: str,
        input_tokens: int = 0,
        output_tokens: int = 0,
        total_tokens: int = 0,
        estimated_cost: float = 0.0,
        latency_ms: float | None = None,
        time_to_first_token_ms: float | None = None,
    ) -> None:
        values = {
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "estimated_cost": estimated_cost,
            "latency_ms": latency_ms,
            "time_to_first_token_ms": (
                time_to_first_token_ms
            ),
        }

        self.overall.record_success(**values)

        self._backend_metrics(
            backend
        ).record_success(**values)

        self._model_metrics(
            model
        ).record_success(**values)

    def record_failure(
        self,
        *,
        backend: str,
        model: str,
    ) -> None:
        self.overall.record_failure()

        self._backend_metrics(
            backend
        ).record_failure()

        self._model_metrics(
            model
        ).record_failure()

    def reset(self) -> None:
        self.overall = InferenceMetrics()
        self.by_backend.clear()
        self.by_model.clear()


__all__ = [
    "InferenceMetrics",
    "MetricsRegistry",
]
