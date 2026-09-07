"""
Agent lifecycle management.

Responsible for starting, stopping, restarting, pausing,
resuming and tracking the lifecycle state of agents.
"""

from __future__ import annotations

import logging
from enum import Enum
from threading import RLock
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class LifecycleState(str, Enum):
    CREATED = "created"
    INITIALIZING = "initializing"
    READY = "ready"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPING = "stopping"
    STOPPED = "stopped"
    FAILED = "failed"


class LifecycleError(RuntimeError):
    """Raised when an invalid lifecycle operation is requested."""


class AgentLifecycle:
    """Manage the lifecycle state and operations of an agent."""

    def __init__(self, agent: Any):
        self.agent = agent
        self._state = LifecycleState.CREATED
        self._lock = RLock()
        self._error: Optional[str] = None

    @property
    def state(self) -> LifecycleState:
        with self._lock:
            return self._state

    @property
    def error(self) -> Optional[str]:
        with self._lock:
            return self._error

    def initialize(self) -> Any:
        with self._lock:
            if self._state not in {
                LifecycleState.CREATED,
                LifecycleState.STOPPED,
                LifecycleState.FAILED,
            }:
                return self.agent

            self._state = LifecycleState.INITIALIZING

            try:
                method = getattr(self.agent, "initialize", None)

                if callable(method):
                    result = method()

                    self._state = LifecycleState.READY
                    self._error = None

                    return result

                self._state = LifecycleState.READY
                self._error = None

                return self.agent

            except Exception as exc:
                self._state = LifecycleState.FAILED
                self._error = str(exc)

                logger.exception("Agent initialization failed")
                raise LifecycleError(
                    f"Failed to initialize agent: {exc}"
                ) from exc

    def start(self) -> Any:
        with self._lock:
            if self._state == LifecycleState.RUNNING:
                return self.agent

            if self._state == LifecycleState.CREATED:
                self.initialize()

            if self._state not in {
                LifecycleState.READY,
                LifecycleState.PAUSED,
            }:
                raise LifecycleError(
                    f"Cannot start agent from state: {self._state.value}"
                )

            try:
                method = getattr(self.agent, "start", None)

                if callable(method):
                    result = method()
                else:
                    result = self.agent

                self._state = LifecycleState.RUNNING
                self._error = None

                return result

            except Exception as exc:
                self._state = LifecycleState.FAILED
                self._error = str(exc)

                logger.exception("Agent start failed")
                raise LifecycleError(
                    f"Failed to start agent: {exc}"
                ) from exc

    def pause(self) -> Any:
        with self._lock:
            if self._state != LifecycleState.RUNNING:
                raise LifecycleError(
                    f"Cannot pause agent from state: {self._state.value}"
                )

            try:
                method = getattr(self.agent, "pause", None)

                if callable(method):
                    result = method()
                else:
                    result = self.agent

                self._state = LifecycleState.PAUSED

                return result

            except Exception as exc:
                self._state = LifecycleState.FAILED
                self._error = str(exc)

                raise LifecycleError(
                    f"Failed to pause agent: {exc}"
                ) from exc

    def resume(self) -> Any:
        with self._lock:
            if self._state != LifecycleState.PAUSED:
                raise LifecycleError(
                    f"Cannot resume agent from state: {self._state.value}"
                )

            try:
                method = getattr(self.agent, "resume", None)

                if callable(method):
                    result = method()
                else:
                    result = self.agent

                self._state = LifecycleState.RUNNING

                return result

            except Exception as exc:
                self._state = LifecycleState.FAILED
                self._error = str(exc)

                raise LifecycleError(
                    f"Failed to resume agent: {exc}"
                ) from exc

    def stop(self) -> Any:
        with self._lock:
            if self._state == LifecycleState.STOPPED:
                return self.agent

            self._state = LifecycleState.STOPPING

            try:
                method = getattr(self.agent, "stop", None)

                if callable(method):
                    result = method()
                else:
                    result = self.agent

                self._state = LifecycleState.STOPPED
                self._error = None

                return result

            except Exception as exc:
                self._state = LifecycleState.FAILED
                self._error = str(exc)

                logger.exception("Agent stop failed")
                raise LifecycleError(
                    f"Failed to stop agent: {exc}"
                ) from exc

    def restart(self) -> Any:
        with self._lock:
            if self._state not in {
                LifecycleState.RUNNING,
                LifecycleState.PAUSED,
                LifecycleState.READY,
                LifecycleState.STOPPED,
                LifecycleState.FAILED,
            }:
                raise LifecycleError(
                    f"Cannot restart agent from state: {self._state.value}"
                )

            self.stop()
            self.initialize()
            return self.start()

    def reset(self) -> None:
        with self._lock:
            self._state = LifecycleState.CREATED
            self._error = None

    def health(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "state": self._state.value,
                "healthy": self._state
                not in {
                    LifecycleState.FAILED,
                },
                "error": self._error,
            }