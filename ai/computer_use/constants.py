from enum import Enum


class ComputerUseStatus(str, Enum):
    IDLE = "idle"
    INITIALIZING = "initializing"
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    VERIFYING = "verifying"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class InputType(str, Enum):
    MOUSE = "mouse"
    KEYBOARD = "keyboard"


class MouseAction(str, Enum):
    MOVE = "move"
    CLICK = "click"
    DOUBLE_CLICK = "double_click"
    RIGHT_CLICK = "right_click"
    DRAG = "drag"
    SCROLL = "scroll"


class KeyboardAction(str, Enum):
    TYPE = "type"
    PRESS = "press"
    HOTKEY = "hotkey"


class WindowState(str, Enum):
    NORMAL = "normal"
    MINIMIZED = "minimized"
    MAXIMIZED = "maximized"
    CLOSED = "closed"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ApprovalStatus(str, Enum):
    NOT_REQUIRED = "not_required"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class VerificationStatus(str, Enum):
    PENDING = "pending"
    PASSED = "passed"
    FAILED = "failed"


DEFAULT_SCREENSHOT_FORMAT = "png"
DEFAULT_TIMEOUT_SECONDS = 30
DEFAULT_ACTION_TIMEOUT_SECONDS = 10
MAX_ACTION_RETRIES = 3
