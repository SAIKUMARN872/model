from enum import Enum

DEFAULT_TIMEOUT_MS = 15000
MAX_ACTIONS_PER_TASK = 50


class BrowserActionType(str, Enum):
    NAVIGATE = "navigate"
    INSPECT = "inspect"
    CLICK = "click"
    FILL = "fill"
    SCREENSHOT = "screenshot"


class BrowserTaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    AWAITING_APPROVAL = "awaiting_approval"
    COMPLETED = "completed"
    FAILED = "failed"
