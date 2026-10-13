from __future__ import annotations

from collections.abc import AsyncIterator

from .fallback import FallbackManager
from .interfaces import InferenceBackend
from .load_balancer import LoadBalancer
from .metrics import (
    InferenceProfiler,
    InferenceTelemetryEvent,
    MetricsRegistry,
    TelemetryCollector,
)
from .models import (
    InferenceHealth,
    InferenceRequest,
    InferenceResult,
)
from .retry import RetryExecutor, RetryStrategy


class InferenceEngine:
    """Coordinate inference backends, load balancing, retry, fallback, metrics, and telemetry."""

    def __init__(
        self,
        backends: list[InferenceBackend] | None = None,
        retry_executor: RetryExecutor | None = None,
        fallback_manager: FallbackManager | None = None,
        load_balancer: LoadBalancer | None = None,
        metrics: MetricsRegistry | None = None,
        telemetry: TelemetryCollector | None = None,
    ) -> None:
        self._backends: dict[str, InferenceBackend] = {}

        self._retry_executor = (
            retry_executor
            or RetryExecutor(
                RetryStrategy()
            )
        )

        self._fallback_manager = (
            fallback_manager
            or FallbackManager()
        )

        self._load_balancer = (
            load_balancer
            or LoadBalancer()
        )

        self._metrics = (
            metrics
            or MetricsRegistry()
        )

        self._telemetry = (
            telemetry
            or TelemetryCollector()
        )

        for backend in backends or []:
            self.register_backend(backend)

    @property
    def metrics(self) -> MetricsRegistry:
        return self._metrics

    @property
    def telemetry(self) -> TelemetryCollector:
        return self._telemetry

    def register_backend(
        self,
        backend: InferenceBackend,
    ) -> None:
        key = backend.backend_type.value

        if key in self._backends:
            raise ValueError(
                f"Inference backend already registered: {key}"
            )

        self._backends[key] = backend

    def unregister_backend(
        self,
        backend_type: str,
    ) -> None:
        self._backends.pop(
            backend_type.strip().lower(),
            None,
        )

    def get_backend(
        self,
        backend_type: str,
    ) -> InferenceBackend | None:
        return self._backends.get(
            backend_type.strip().lower()
        )

    def backend_types(self) -> list[str]:
        return list(self._backends.keys())

    async def initialize(self) -> None:
        for backend in self._backends.values():
            await backend.initialize()

    async def close(self) -> None:
        for backend in self._backends.values():
            await backend.close()

    async def _select_backend(
        self,
        request: InferenceRequest,
    ) -> InferenceBackend:
        return await self._load_balancer.select(
            request=request,
            backends=list(
                self._backends.values()
            ),
        )

    async def _execute_backend(
        self,
        backend: InferenceBackend,
        request: InferenceRequest,
    ) -> InferenceResult:
        return await self._retry_executor.execute(
            lambda: backend.infer(request)
        )

    def _record_telemetry(
        self,
        *,
        event_type: str,
        request: InferenceRequest,
        backend: InferenceBackend | None = None,
        result: InferenceResult | None = None,
        metadata: dict[str, object] | None = None,
    ) -> None:
        self._telemetry.record(
            InferenceTelemetryEvent(
                event_type=event_type,
                request_id=(
                    result.request_id
                    if result is not None
                    else request.request_id
                ),
                model=(
                    result.model
                    if result is not None
                    else request.model
                ),
                backend=(
                    result.backend.value
                    if result is not None
                    else (
                        backend.backend_type.value
                        if backend is not None
                        else None
                    )
                ),
                metadata=dict(metadata or {}),
            )
        )

    def _record_success(
        self,
        result: InferenceResult,
        *,
        latency_ms: float | None = None,
    ) -> None:
        usage = result.usage

        self._metrics.record_success(
            backend=result.backend.value,
            model=result.model,
            input_tokens=usage.input_tokens,
            output_tokens=usage.output_tokens,
            total_tokens=usage.total_tokens,
            estimated_cost=usage.estimated_cost,
            latency_ms=(
                result.latency_ms
                if result.latency_ms is not None
                else latency_ms
            ),
            time_to_first_token_ms=(
                result.time_to_first_token_ms
            ),
        )

    def _record_failure(
        self,
        request: InferenceRequest,
        backend: InferenceBackend,
    ) -> None:
        self._metrics.record_failure(
            backend=backend.backend_type.value,
            model=request.model,
        )

    async def infer(
        self,
        request: InferenceRequest,
    ) -> InferenceResult:
        primary = await self._select_backend(
            request
        )

        self._record_telemetry(
            event_type="inference.started",
            request=request,
            backend=primary,
        )

        profiler = InferenceProfiler()
        profiler.start()

        try:
            result = await self._execute_backend(
                primary,
                request,
            )

            latency_ms = profiler.stop()

            self._record_success(
                result,
                latency_ms=latency_ms,
            )

            self._record_telemetry(
                event_type="inference.completed",
                request=request,
                backend=primary,
                result=result,
                metadata={
                    "latency_ms": (
                        result.latency_ms
                        if result.latency_ms is not None
                        else latency_ms
                    ),
                    "status": result.status.value,
                },
            )

            return result

        except Exception as primary_error:
            profiler.stop()

            self._record_failure(
                request,
                primary,
            )

            self._record_telemetry(
                event_type="inference.failed",
                request=request,
                backend=primary,
                metadata={
                    "error_type": type(primary_error).__name__,
                },
            )

            try:
                fallback_profiler = InferenceProfiler()
                fallback_profiler.start()

                result = await self._fallback_manager.execute(
                    request=request,
                    backends=list(
                        self._backends.values()
                    ),
                    failed_backend=primary,
                )

                fallback_latency_ms = (
                    fallback_profiler.stop()
                )

                self._record_success(
                    result,
                    latency_ms=fallback_latency_ms,
                )

                self._record_telemetry(
                    event_type="inference.completed",
                    request=request,
                    result=result,
                    metadata={
                        "fallback": True,
                        "latency_ms": (
                            result.latency_ms
                            if result.latency_ms is not None
                            else fallback_latency_ms
                        ),
                        "status": result.status.value,
                    },
                )

                return result

            except Exception:
                raise primary_error

    async def stream(
        self,
        request: InferenceRequest,
    ) -> AsyncIterator[InferenceResult]:
        backend = await self._select_backend(
            request
        )

        async for result in backend.stream(
            request
        ):
            yield result

    async def health_check(
        self,
    ) -> list[InferenceHealth]:
        results: list[InferenceHealth] = []

        for backend in self._backends.values():
            results.append(
                await backend.health_check()
            )

        return results


__all__ = ["InferenceEngine"]