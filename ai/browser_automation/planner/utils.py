"""Validation helpers for browser task plans."""

from __future__ import annotations

from ai.browser_automation.models import BrowserAction

_ALLOWED_ACTIONS = {
    "navigate", "click", "type", "fill", "select",
    "scroll", "wait", "press", "screenshot",
}


def validate_action(action: BrowserAction) -> None:
    if not isinstance(action, BrowserAction):
        raise TypeError("action must be a BrowserAction.")

    action_type = getattr(action.action_type, "value", action.action_type)
    action_type = str(action_type).strip().lower()
    if action_type not in _ALLOWED_ACTIONS:
        raise ValueError(f"Unsupported planned action type: {action_type}")

    if action_type in {"click", "type", "fill", "select", "press"}:
        if not isinstance(action.selector, str) or not action.selector.strip():
            raise ValueError(f"{action_type} requires a selector.")

    if action_type == "navigate":
        from ai.browser_automation.navigation.utils import validate_url
        if not isinstance(action.url, str):
            raise ValueError("navigate requires a URL.")
        validate_url(action.url)

    if action_type in {"type", "fill", "select", "press"}:
        if action.value is None:
            raise ValueError(f"{action_type} requires a value.")

    if action.selector is not None and len(action.selector) > 1000:
        raise ValueError("Selector is too long.")


def validate_actions(actions: list[BrowserAction], *, max_actions: int = 30) -> None:
    if not isinstance(actions, list):
        raise TypeError("actions must be a list.")
    if isinstance(max_actions, bool) or not isinstance(max_actions, int) or max_actions < 1:
        raise ValueError("max_actions must be a positive integer.")
    if len(actions) > max_actions:
        raise ValueError(f"Plan exceeds the {max_actions}-action limit.")
    for action in actions:
        validate_action(action)
