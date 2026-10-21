from typing import Any


def build_task_summary(task: Any) -> dict[str, Any]:
    """Return a compact, serializable summary of an automation task."""
    status = getattr(task, "status", "unknown")
    status_value = getattr(status, "value", status)

    return {
        "task_id": getattr(task, "task_id", ""),
        "description": getattr(task, "description", ""),
        "status": str(status_value),
        "action_count": len(getattr(task, "actions", [])),
        "completed_action_count": len(getattr(task, "results", [])),
        "error": getattr(task, "error", None),
    }
