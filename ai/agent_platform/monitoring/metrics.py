"""Thread-safe counters and duration observations."""

from threading import RLock


class AgentPlatformMetrics:
    """Stores in-process counters and numeric observation summaries."""

    def __init__(self):
        self._lock = RLock()
        self._counters = {}
        self._observations = {}

    def increment(self, name, value=1):
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            raise TypeError("Counter increment must be numeric")
        with self._lock:
            self._counters[name] = self._counters.get(name, 0) + value
            return self._counters[name]

    def observe(self, name, value):
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            raise TypeError("Observation must be numeric")
        with self._lock:
            summary = self._observations.setdefault(
                name,
                {"count": 0, "total": 0, "min": None, "max": None},
            )
            summary["count"] += 1
            summary["total"] += value
            summary["min"] = (
                value if summary["min"] is None
                else min(summary["min"], value)
            )
            summary["max"] = (
                value if summary["max"] is None
                else max(summary["max"], value)
            )
            return dict(summary)

    def snapshot(self):
        with self._lock:
            return {
                "counters": dict(self._counters),
                "observations": {
                    name: dict(values)
                    for name, values in self._observations.items()
                },
            }

    def reset(self):
        with self._lock:
            self._counters.clear()
            self._observations.clear()
