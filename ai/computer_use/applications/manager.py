from __future__ import annotations

from threading import RLock
from typing import Any

from ..exceptions import ApplicationNotFoundError
from ..models import Application
from ..utils import generate_id
from .application import ApplicationAdapter


class ApplicationManager:
    """Track applications launched through an injected adapter."""

    def __init__(self, adapter: ApplicationAdapter) -> None:
        if not isinstance(adapter, ApplicationAdapter):
            raise TypeError("adapter must be an ApplicationAdapter.")
        self.adapter = adapter
        self._lock = RLock()
        self._applications: dict[str, Application] = {}

    def launch(self, name: str) -> Application:
        result = self.adapter.launch(name)
        key = name.strip()
        if isinstance(result, Application):
            app = result
        else:
            process_id = getattr(result, "pid", None)
            app_id = getattr(result, "application_id", None) or generate_id("app")
            app_name = getattr(result, "name", None) or key
            app = Application(
                application_id=str(app_id),
                name=str(app_name),
                process_id=process_id if isinstance(process_id, int) else None,
                running=True,
                metadata={"backend_result_type": type(result).__name__},
            )
        app.running = True
        with self._lock:
            self._applications[key.casefold()] = app
            return self._copy(app)

    def close(self, name: str) -> None:
        if not isinstance(name, str) or not name.strip():
            raise ValueError("application name must be a non-empty string.")
        key = name.strip().casefold()
        with self._lock:
            app = self._applications.get(key)
            if app is None or not app.running:
                raise ApplicationNotFoundError(
                    f"Application '{name}' is not tracked as running."
                )
            self.adapter.close(app.name)
            app.running = False

    def get(self, name: str) -> Application:
        if not isinstance(name, str) or not name.strip():
            raise ValueError("application name must be a non-empty string.")
        with self._lock:
            app = self._applications.get(name.strip().casefold())
            if app is None:
                raise ApplicationNotFoundError(
                    f"Application '{name}' is not tracked."
                )
            return self._copy(app)

    def list(self) -> list[Application]:
        with self._lock:
            return [self._copy(app) for app in self._applications.values()]

    @staticmethod
    def _copy(app: Application) -> Application:
        from copy import deepcopy
        return deepcopy(app)
