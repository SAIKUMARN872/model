from __future__ import annotations

from dataclasses import dataclass
from time import monotonic
from threading import Lock


@dataclass(frozen=True)
class ProfileStage:
    name: str
    duration_ms: float


@dataclass(frozen=True)
class LatencyProfile:
    request_id: str
    total_latency_ms: float
    stages: tuple[ProfileStage, ...]
    metadata: dict[str, object]


class LatencyProfiler:
    """Measures latency across named execution stages."""

    def __init__(self) -> None:
        self._profiles: list[LatencyProfile] = []
        self._lock = Lock()

    @staticmethod
    def _validate_request_id(request_id: str) -> str:
        value = str(request_id).strip()

        if not value:
            raise ValueError("request_id cannot be empty")

        return value

    @staticmethod
    def _validate_duration(
        duration_ms: float,
    ) -> float:
        value = float(duration_ms)

        if value < 0:
            raise ValueError(
                "duration_ms cannot be negative"
            )

        return value

    def start(
        self,
        request_id: str,
    ) -> "ProfileSession":
        return ProfileSession(
            profiler=self,
            request_id=self._validate_request_id(
                request_id
            ),
        )

    def record(
        self,
        profile: LatencyProfile,
    ) -> None:
        if not profile.request_id.strip():
            raise ValueError(
                "request_id cannot be empty"
            )

        if profile.total_latency_ms < 0:
            raise ValueError(
                "total_latency_ms cannot be negative"
            )

        with self._lock:
            self._profiles.append(profile)

    def profiles(self) -> tuple[LatencyProfile, ...]:
        with self._lock:
            return tuple(self._profiles)

    def latest(
        self,
        request_id: str,
    ) -> LatencyProfile | None:
        request_id = self._validate_request_id(
            request_id
        )

        with self._lock:
            for profile in reversed(self._profiles):
                if profile.request_id == request_id:
                    return profile

        return None

    def clear(self) -> None:
        with self._lock:
            self._profiles.clear()


class ProfileSession:
    """Context-style latency measurement for one request."""

    def __init__(
        self,
        *,
        profiler: LatencyProfiler,
        request_id: str,
    ) -> None:
        self._profiler = profiler
        self.request_id = request_id
        self._started_at = monotonic()
        self._stage_started_at: float | None = None
        self._stage_name: str | None = None
        self._stages: list[ProfileStage] = []
        self._metadata: dict[str, object] = {}
        self._finished = False

    def start_stage(self, name: str) -> None:
        if self._finished:
            raise RuntimeError(
                "profile session is already finished"
            )

        if self._stage_name is not None:
            raise RuntimeError(
                "another stage is already active"
            )

        normalized = str(name).strip()

        if not normalized:
            raise ValueError(
                "stage name cannot be empty"
            )

        self._stage_name = normalized
        self._stage_started_at = monotonic()

    def end_stage(self) -> ProfileStage:
        if self._stage_name is None:
            raise RuntimeError(
                "no stage is currently active"
            )

        assert self._stage_started_at is not None

        duration_ms = (
            monotonic()
            - self._stage_started_at
        ) * 1000.0

        stage = ProfileStage(
            name=self._stage_name,
            duration_ms=duration_ms,
        )

        self._stages.append(stage)
        self._stage_name = None
        self._stage_started_at = None

        return stage

    def stage(self, name: str):
        return _StageContext(self, name)

    def set_metadata(
        self,
        key: str,
        value: object,
    ) -> None:
        normalized = str(key).strip()

        if not normalized:
            raise ValueError(
                "metadata key cannot be empty"
            )

        self._metadata[normalized] = value

    def finish(self) -> LatencyProfile:
        if self._finished:
            raise RuntimeError(
                "profile session is already finished"
            )

        if self._stage_name is not None:
            self.end_stage()

        total_latency_ms = (
            monotonic()
            - self._started_at
        ) * 1000.0

        profile = LatencyProfile(
            request_id=self.request_id,
            total_latency_ms=total_latency_ms,
            stages=tuple(self._stages),
            metadata=dict(self._metadata),
        )

        self._profiler.record(profile)
        self._finished = True

        return profile


class _StageContext:
    def __init__(
        self,
        session: ProfileSession,
        name: str,
    ) -> None:
        self._session = session
        self._name = name

    def __enter__(self) -> ProfileSession:
        self._session.start_stage(self._name)
        return self._session

    def __exit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ) -> bool:
        self._session.end_stage()
        return False


__all__ = [
    "ProfileStage",
    "LatencyProfile",
    "LatencyProfiler",
    "ProfileSession",
]
