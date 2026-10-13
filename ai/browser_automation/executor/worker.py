"""Asynchronous worker for browser task execution."""

import asyncio
import inspect
from dataclasses import dataclass
from typing import Any, Iterable

from .utils import normalize_task_id, validate_timeout


@dataclass(frozen=True)
class BrowserWorkerResult:
    task_id: str
    success: bool
    result: Any = None
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "success": self.success,
            "result": self.result,
            "error": self.error,
        }


class BrowserTaskWorker:
    """Run browser tasks through an injected executor.

    This worker does not bypass executor permissions or approval checks.
    """

    def __init__(self, executor: Any, timeout: float = 120.0) -> None:
        if executor is None or not callable(getattr(executor, "execute", None)):
            raise ValueError("executor must expose an execute method.")

        self.executor = executor
        self.timeout = validate_timeout(timeout)

    async def run(
        self,
        task: Any,
        *,
        user_id: str,
        permissions: Iterable[str],
        timeout: float | None = None,
    ) -> BrowserWorkerResult:
        task_id_value = getattr(task, "task_id", None)

        try:
            task_id = normalize_task_id(task_id_value)
        except ValueError:
            task_id = "unknown"

        effective_timeout = (
            self.timeout if timeout is None else validate_timeout(timeout)
        )

        if not isinstance(user_id, str) or not user_id.strip():
            return BrowserWorkerResult(
                task_id=task_id,
                success=False,
                error="A valid user identity is required.",
            )

        if isinstance(permissions, (str, bytes)):
            return BrowserWorkerResult(
                task_id=task_id,
                success=False,
                error="Permissions must be an iterable of permission strings.",
            )

        try:
            permission_list = tuple(permissions)
        except TypeError:
            return BrowserWorkerResult(
                task_id=task_id,
                success=False,
                error="Permissions must be an iterable of permission strings.",
            )

        if any(not isinstance(permission, str) for permission in permission_list):
            return BrowserWorkerResult(
                task_id=task_id,
                success=False,
                error="Every permission must be a string.",
            )

        try:
            execution = self.executor.execute(
                task,
                user_id=user_id.strip(),
                permissions=permission_list,
            )

            if inspect.isawaitable(execution):
                result = await asyncio.wait_for(
                    execution,
                    timeout=effective_timeout,
                )
            else:
                result = execution

            success = getattr(result, "success", None)
            if success is None:
                success = getattr(result, "status", None) in {
                    "completed",
                    "success",
                    "succeeded",
                }

            return BrowserWorkerResult(
                task_id=task_id,
                success=bool(success),
                result=result,
                error=None if success else "Browser task did not complete successfully.",
            )

        except asyncio.TimeoutError:
            return BrowserWorkerResult(
                task_id=task_id,
                success=False,
                error="Browser task timed out.",
            )
        except Exception:
            return BrowserWorkerResult(
                task_id=task_id,
                success=False,
                error="Browser task execution failed.",
            )
