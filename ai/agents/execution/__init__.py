"""
ModelNow Execution package.

Provides task execution, retries, timeouts,
task registration, scheduling, and execution history.
"""

from .executor import (
    ExecutionConfig,
    ExecutionError,
    ExecutionResult,
    ExecutionRetryError,
    ExecutionTimeoutError,
    TaskExecutor,
)

from .runner import (
    ExecutionRunner,
    RunnerError,
    RunnerStoppedError,
    Task,
)

from .scheduler import (
    ScheduledTask,
    ScheduledTaskNotFoundError,
    SchedulerError,
    TaskScheduler,
)

from .utils import (
    elapsed_ms,
    ensure_callable,
    execute_callable,
    execute_with_timeout,
    is_async_callable,
    run_sync,
    safe_error,
    serialize_result,
    utc_now,
)


__all__ = [
    # Executor
    "TaskExecutor",
    "ExecutionConfig",
    "ExecutionResult",
    "ExecutionError",
    "ExecutionTimeoutError",
    "ExecutionRetryError",

    # Runner
    "ExecutionRunner",
    "Task",
    "RunnerError",
    "RunnerStoppedError",

    # Scheduler
    "TaskScheduler",
    "ScheduledTask",
    "SchedulerError",
    "ScheduledTaskNotFoundError",

    # Utilities
    "utc_now",
    "elapsed_ms",
    "ensure_callable",
    "execute_callable",
    "execute_with_timeout",
    "is_async_callable",
    "run_sync",
    "safe_error",
    "serialize_result",
]


__version__ = "1.0.0"