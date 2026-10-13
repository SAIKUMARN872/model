"""Register browser automation as a tool in ModelNow MCP."""

from __future__ import annotations

from typing import Any
import re

from ai.tool_platform.permissions import PermissionContext
from ai.tool_platform.registry import ToolRegistry, ToolSpec

from .constants import BrowserActionType, DEFAULT_TIMEOUT_MS
from .engine import BrowserAutomationEngine
from .executor import BrowserTaskExecutor
from .models import BrowserAction, BrowserTask


TOOL_NAME = "browser_automation_execute"

_ACTION_TYPES = (
    BrowserActionType.NAVIGATE,
    BrowserActionType.INSPECT,
    BrowserActionType.CLICK,
    BrowserActionType.FILL,
)

_ACTION_PROPERTIES = {
    "action_type": {
        "type": "string",
        "enum": [item.value for item in _ACTION_TYPES],
    },
    "selector": {"type": "string"},
    "value": {"type": "string"},
    "url": {"type": "string"},
    "description": {"type": "string"},
    "requires_approval": {"type": "boolean"},
}

_INPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "goal": {"type": "string", "minLength": 1, "maxLength": 2000},
        "start_url": {"type": "string", "maxLength": 4096},
        "task_id": {"type": "string", "maxLength": 200},
        "actions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": _ACTION_PROPERTIES,
                "required": ["action_type"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["goal"],
    "additionalProperties": False,
}


_SENSITIVE_INTENT_TERMS = (
    "buy", "purchase", "place order", "submit order", "checkout",
    "pay", "payment", "book", "confirm booking",
    "transfer money", "cancel booking",
)


def _contains_sensitive_intent(*values: str | None) -> bool:
    """Detect consequential intent despite punctuation such as '#buy-now'."""
    normalized = " ".join(
        re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()
        for value in values
        if isinstance(value, str)
    )
    return any(
        re.search(r"\b" + re.escape(term) + r"\b", normalized)
        for term in _SENSITIVE_INTENT_TERMS
    )


def _build_task(arguments: dict[str, Any]) -> BrowserTask:
    """Convert untrusted MCP arguments into validated browser models."""
    if not isinstance(arguments, dict):
        raise TypeError("Browser tool arguments must be an object.")

    allowed = {"goal", "start_url", "task_id", "actions"}
    unknown = set(arguments) - allowed
    if unknown:
        raise ValueError(f"Unknown browser task fields: {sorted(unknown)}")

    goal = arguments.get("goal")
    if not isinstance(goal, str) or not goal.strip():
        raise ValueError("goal must be a non-empty string.")

    start_url = arguments.get("start_url")
    if start_url is not None and not isinstance(start_url, str):
        raise TypeError("start_url must be a string.")

    task_id = arguments.get("task_id", "")
    if not isinstance(task_id, str):
        raise TypeError("task_id must be a string.")

    raw_actions = arguments.get("actions", [])
    if not isinstance(raw_actions, list):
        raise TypeError("actions must be a list.")

    actions = []
    allowed_action_fields = set(_ACTION_PROPERTIES)

    for index, raw in enumerate(raw_actions):
        if not isinstance(raw, dict):
            raise TypeError(f"actions[{index}] must be an object.")

        extra = set(raw) - allowed_action_fields
        if extra:
            raise ValueError(
                f"Unknown fields in actions[{index}]: {sorted(extra)}"
            )

        raw_type = raw.get("action_type")
        try:
            action_type = BrowserActionType(raw_type)
        except (ValueError, TypeError) as exc:
            raise ValueError(
                f"Unsupported action type in actions[{index}]."
            ) from exc

        if action_type not in _ACTION_TYPES:
            raise ValueError(
                f"Action type '{action_type.value}' is not exposed by this MCP adapter."
            )

        for field in ("selector", "value", "url", "description"):
            value = raw.get(field)
            if value is not None and not isinstance(value, str):
                raise TypeError(
                    f"actions[{index}].{field} must be a string."
                )

        requires_approval = raw.get("requires_approval", False)
        if not isinstance(requires_approval, bool):
            raise TypeError(
                f"actions[{index}].requires_approval must be a boolean."
            )

        action_description = raw.get("description", "")
        action_selector = raw.get("selector")
        action_value = raw.get("value")

        # Caller input cannot disable approval for a consequential click.
        sensitive_click = (
            action_type == BrowserActionType.CLICK
            and _contains_sensitive_intent(
                goal, action_description, action_selector, action_value
            )
        )

        actions.append(
            BrowserAction(
                action_type=action_type,
                selector=action_selector,
                value=action_value,
                url=raw.get("url"),
                description=action_description,
                requires_approval=requires_approval or sensitive_click,
            )
        )

    task = BrowserTask(
        goal=goal,
        start_url=start_url,
        actions=actions,
        task_id=task_id,
    )

    # Run the existing canonical validation before returning the task.
    from .security.validator import validate_browser_task

    validate_browser_task(task)
    return task


def register_browser_automation_tool(
    registry: ToolRegistry,
    *,
    permission_context: PermissionContext,
    engine: BrowserAutomationEngine | None = None,
    approval_callback=None,
    timeout_ms: int = DEFAULT_TIMEOUT_MS,
    headless: bool = True,
) -> ToolSpec:
    """Register the browser tool; use the same permission context in MCPEngine.

    Approval callbacks must be supplied by a trusted application component.
    No approval flag in an MCP request can substitute for that callback.
    """
    if not isinstance(registry, ToolRegistry):
        raise TypeError("registry must be a ToolRegistry.")
    if not isinstance(permission_context, PermissionContext):
        raise TypeError("A trusted PermissionContext is required.")
    if engine is not None and approval_callback is not None:
        raise ValueError(
            "Supply either an engine or an approval_callback, not both."
        )

    browser_engine = engine or BrowserAutomationEngine(
        approval_callback=approval_callback,
        timeout_ms=timeout_ms,
        headless=headless,
    )
    task_executor = BrowserTaskExecutor(browser_engine)

    async def execute_browser_task(**arguments):
        task = _build_task(arguments)
        result = await task_executor.execute(
            task,
            user_id=permission_context.user_id,
            permissions=permission_context.permissions,
        )
        return result.to_dict()

    spec = ToolSpec(
        name=TOOL_NAME,
        description=(
            "Execute a validated browser task using ModelNow browser automation. "
            "Sensitive actions require explicit approval from a trusted callback. "
            "Only navigate, inspect, click, and fill actions are exposed."
        ),
        handler=execute_browser_task,
        version="1.0.0",
        input_schema=_INPUT_SCHEMA,
        required_permissions=("browser:execute",),
        tags=("browser", "automation", "mcp"),
    )
    return registry.register(spec)
