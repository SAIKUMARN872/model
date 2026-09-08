"""
ModelNow Tools package.

Central public interface for tool registration,
discovery, validation and execution.
"""

from .constants import (
    DEFAULT_CATEGORY,
    DEFAULT_MAX_RETRIES,
    DEFAULT_MAX_TOOL_CALLS,
    DEFAULT_RETRY_DELAY,
    DEFAULT_TOOL_TIMEOUT,
    DEFAULT_TOOL_VERSION,
    TOOL_CATEGORIES,
    TOOL_STATUS_BLOCKED,
    TOOL_STATUS_FAILED,
    TOOL_STATUS_PENDING,
    TOOL_STATUS_RUNNING,
    TOOL_STATUS_SUCCESS,
    TOOL_STATUS_TIMEOUT,
)

from .engine import (
    RegisteredTool,
    ToolEngine,
    ToolEngineConfig,
)

from .exceptions import (
    ToolConfigurationError,
    ToolError,
    ToolExecutionError,
    ToolLimitExceededError,
    ToolNotFoundError,
    ToolPermissionError,
    ToolRegistrationError,
    ToolTimeoutError,
    ToolValidationError,
)

from .interfaces import (
    ToolEngineInterface,
    ToolExecutorInterface,
    ToolFunction,
    ToolRegistryInterface,
)

from .models import (
    ToolCall,
    ToolDefinition,
    ToolExecutionRecord,
    ToolResult,
)

from .schemas import (
    build_tool_schema,
    infer_parameters,
    python_type_to_json_type,
    validate_arguments,
    validate_schema,
)

from .utils import (
    elapsed_ms,
    generate_tool_id,
    get_description,
    is_async_callable,
    normalize_tool_name,
    safe_error,
    serialize_value,
    timer_start,
    validate_tool_name,
)


__all__ = [
    # Engine
    "ToolEngine",
    "ToolEngineConfig",
    "RegisteredTool",

    # Models
    "ToolDefinition",
    "ToolCall",
    "ToolResult",
    "ToolExecutionRecord",

    # Interfaces
    "ToolFunction",
    "ToolRegistryInterface",
    "ToolExecutorInterface",
    "ToolEngineInterface",

    # Schema
    "build_tool_schema",
    "infer_parameters",
    "python_type_to_json_type",
    "validate_arguments",
    "validate_schema",

    # Exceptions
    "ToolError",
    "ToolNotFoundError",
    "ToolRegistrationError",
    "ToolExecutionError",
    "ToolValidationError",
    "ToolTimeoutError",
    "ToolPermissionError",
    "ToolConfigurationError",
    "ToolLimitExceededError",

    # Utilities
    "normalize_tool_name",
    "validate_tool_name",
    "generate_tool_id",
    "is_async_callable",
    "get_description",
    "timer_start",
    "elapsed_ms",
    "serialize_value",
    "safe_error",

    # Constants
    "DEFAULT_TOOL_TIMEOUT",
    "DEFAULT_MAX_RETRIES",
    "DEFAULT_RETRY_DELAY",
    "DEFAULT_MAX_TOOL_CALLS",
    "DEFAULT_TOOL_VERSION",
    "DEFAULT_CATEGORY",
    "TOOL_CATEGORIES",
    "TOOL_STATUS_PENDING",
    "TOOL_STATUS_RUNNING",
    "TOOL_STATUS_SUCCESS",
    "TOOL_STATUS_FAILED",
    "TOOL_STATUS_TIMEOUT",
    "TOOL_STATUS_BLOCKED",
]