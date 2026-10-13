from typing import Any


def require_selector(selector: str | None, action_name: str) -> str:
    """Validate and return a non-empty browser selector."""
    if not isinstance(selector, str) or not selector.strip():
        raise ValueError(
            f"{action_name} requires a non-empty selector."
        )
    return selector.strip()


def action_result(action: str, **details: Any) -> dict[str, Any]:
    """Build a consistent result dictionary for a browser action."""
    return {"action": action, **details}
