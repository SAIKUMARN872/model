from concurrent.futures import ThreadPoolExecutor
from threading import RLock

from ..exceptions import AgentExecutionError


class AgentScheduler:
    """Schedules manager executions on a bounded worker pool."""

    def __init__(self, manager, max_workers=4, thread_name_prefix="modelnow-agent"):
        if not isinstance(max_workers, int) or isinstance(max_workers, bool):
            raise ValueError("max_workers must be a positive integer")
        if max_workers < 1:
            raise ValueError("max_workers must be a positive integer")

        self.manager = manager
        self._executor = ThreadPoolExecutor(
            max_workers=max_workers,
            thread_name_prefix=thread_name_prefix,
        )
        self._lock = RLock()
        self._closed = False

    def submit(self, request):
        with self._lock:
            if self._closed:
                raise AgentExecutionError("Agent scheduler is shut down")
            return self._executor.submit(self.manager.execute, request)

    def shutdown(self, wait=True, cancel_futures=False):
        with self._lock:
            if self._closed:
                return
            self._closed = True
        self._executor.shutdown(wait=wait, cancel_futures=cancel_futures)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.shutdown()
        return False
