"""
Constants for the ModelNow tool system.
"""

DEFAULT_TOOL_TIMEOUT = 30.0

DEFAULT_MAX_RETRIES = 2

DEFAULT_RETRY_DELAY = 0.5

DEFAULT_MAX_TOOL_CALLS = 20

DEFAULT_TOOL_VERSION = "1.0.0"

TOOL_STATUS_PENDING = "pending"
TOOL_STATUS_RUNNING = "running"
TOOL_STATUS_SUCCESS = "success"
TOOL_STATUS_FAILED = "failed"
TOOL_STATUS_TIMEOUT = "timeout"
TOOL_STATUS_BLOCKED = "blocked"

TOOL_CATEGORIES = {
    "general",
    "search",
    "research",
    "coding",
    "database",
    "filesystem",
    "api",
    "communication",
    "automation",
    "custom",
}

DEFAULT_CATEGORY = "general"