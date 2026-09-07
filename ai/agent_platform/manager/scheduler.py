"""
Agent scheduler.

Provides delayed and recurring execution of agent tasks.
"""

from __future__ import annotations

import logging
import threading
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Callable, Dict, Optional

logger = logging.getLogger(__name__)


@dataclass
class ScheduledTask:
    """Represents a scheduled agent task."""

    task_id: str
    agent_id: str
    callback: Callable[..., Any]
    run_at: datetime

    interval: Optional[float] = None
    args: tuple = field(default_factory=tuple)
    kwargs: Dict[str, Any] = field(default_factory=dict)

    cancelled: bool = False
    completed: bool = False


class AgentScheduler:
    """Thread-based scheduler for agent execution."""

    def __init__(self):
        self._tasks: Dict[str, ScheduledTask] = {}
        self._timers: Dict[str, threading.Timer] = {}
        self._lock = threading.RLock()

    def schedule(
        self,
        agent_id: str,
        callback: Callable[..., Any],
        *,
        delay: float = 0,
        args: tuple = (),
        kwargs: Optional[Dict[str, Any]] = None,
    ) -> str:
        task_id = str(uuid.uuid4())

        run_at = datetime.now() + timedelta(
            seconds=max(0, delay)
        )

        task = ScheduledTask(
            task_id=task_id,
            agent_id=agent_id,
            callback=callback,
            run_at=run_at,
            args=args,
            kwargs=kwargs or {},
        )

        with self._lock:
            self._tasks[task_id] = task

            timer = threading.Timer(
                max(0, delay),
                self._execute,
                args=(task_id,),
            )

            timer.daemon = True
            self._timers[task_id] = timer
            timer.start()

        logger.info(
            "Scheduled task %s for agent %s",
            task_id,
            agent_id,
        )

        return task_id

    def schedule_interval(
        self,
        agent_id: str,
        callback: Callable[..., Any],
        interval: float,
        *,
        args: tuple = (),
        kwargs: Optional[Dict[str, Any]] = None,
    ) -> str:
        if interval <= 0:
            raise ValueError("interval must be greater than zero")

        task_id = str(uuid.uuid4())

        task = ScheduledTask(
            task_id=task_id,
            agent_id=agent_id,
            callback=callback,
            run_at=datetime.now()
            + timedelta(seconds=interval),
            interval=interval,
            args=args,
            kwargs=kwargs or {},
        )

        with self._lock:
            self._tasks[task_id] = task
            self._schedule_timer(task)

        return task_id

    def cancel(self, task_id: str) -> bool:
        with self._lock:
            task = self._tasks.get(task_id)

            if task is None:
                return False

            task.cancelled = True

            timer = self._timers.get(task_id)

            if timer is not None:
                timer.cancel()

            self._tasks.pop(task_id, None)
            self._timers.pop(task_id, None)

            logger.info("Cancelled task: %s", task_id)

            return True

    def get(self, task_id: str) -> Optional[ScheduledTask]:
        with self._lock:
            return self._tasks.get(task_id)

    def list_tasks(self) -> Dict[str, ScheduledTask]:
        with self._lock:
            return dict(self._tasks)

    def clear(self) -> None:
        with self._lock:
            task_ids = list(self._tasks.keys())

        for task_id in task_ids:
            self.cancel(task_id)

    def shutdown(self) -> None:
        self.clear()

    def _schedule_timer(self, task: ScheduledTask) -> None:
        timer = threading.Timer(
            task.interval or 0,
            self._execute,
            args=(task.task_id,),
        )

        timer.daemon = True

        self._timers[task.task_id] = timer
        timer.start()

    def _execute(self, task_id: str) -> None:
        with self._lock:
            task = self._tasks.get(task_id)

            if task is None or task.cancelled:
                return

        try:
            task.callback(
                *task.args,
                **task.kwargs,
            )

        except Exception:
            logger.exception(
                "Scheduled task failed: %s",
                task_id,
            )

        finally:
            with self._lock:
                task = self._tasks.get(task_id)

                if task is None:
                    return

                if (
                    task.interval is not None
                    and not task.cancelled
                ):
                    task.run_at = (
                        datetime.now()
                        + timedelta(
                            seconds=task.interval
                        )
                    )

                    self._schedule_timer(task)

                else:
                    task.completed = True
                    self._tasks.pop(task_id, None)
                    self._timers.pop(task_id, None)