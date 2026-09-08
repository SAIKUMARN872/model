"""
AI Tools package.

Provides tool adapters, registration, discovery,
schemas, and execution.
"""

from .adapter import (
    ToolAdapter,
    ToolCall,
    ToolDefinition,
    adapt_tool,
)

from .executor import (
    ToolExecutionError,
    ToolExecutionResult,
    ToolExecutor,
    ToolExecutorConfig,
    ToolTimeoutError,
)

from .tool_registry import (
    ToolRegistry,
)

from .utils import (
    current_time,
    elapsed_ms,
    execute_callable,
    generate_tool_id,
    get_function_description,
    get_function_parameters,
    is_async_callable,
    normalize_tool_name,
    safe_exception_message,
    serialize_value,
    validate_arguments,
    validate_tool_name,
)


__all__ = [
    # Adapter
    "ToolAdapter",
    "ToolDefinition",
    "ToolCall",
    "adapt_tool",

    # Registry
    "ToolRegistry",

    # Executor
    "ToolExecutor",
    "ToolExecutorConfig",
    "ToolExecutionResult",
    "ToolExecutionError",
    "ToolTimeoutError",

    # Utilities
    "generate_tool_id",
    "normalize_tool_name",
    "validate_tool_name",
    "is_async_callable",
    "execute_callable",
    "serialize_value",
    "safe_exception_message",
    "get_function_description",
    "get_function_parameters",
    "validate_arguments",
    "current_time",
    "elapsed_ms",
]


__version__ = "1.0.0"