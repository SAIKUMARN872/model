"""
ModelNow Coding package.

Provides code generation, code review, validation,
and an executable coding agent.
"""

from .coding_agent import (
    CodingAgent,
    CodingAgentConfig,
    CodingAgentConfigurationError,
    CodingAgentError,
)

from .generator import (
    CodeGenerationError,
    CodeGenerationRequest,
    CodeGenerationResult,
    CodeGenerator,
)

from .reviewer import (
    CodeReviewError,
    CodeReviewRequest,
    CodeReviewResult,
    CodeReviewer,
    ReviewIssue,
)

from .utils import (
    compile_python,
    count_characters,
    count_lines,
    detect_language,
    extract_code_block,
    is_async_callable,
    normalize_language,
    run_python_code,
    run_sync,
    validate_python,
)


__all__ = [
    # Coding Agent
    "CodingAgent",
    "CodingAgentConfig",
    "CodingAgentError",
    "CodingAgentConfigurationError",

    # Generator
    "CodeGenerator",
    "CodeGenerationRequest",
    "CodeGenerationResult",
    "CodeGenerationError",

    # Reviewer
    "CodeReviewer",
    "CodeReviewRequest",
    "CodeReviewResult",
    "ReviewIssue",
    "CodeReviewError",

    # Utilities
    "extract_code_block",
    "validate_python",
    "compile_python",
    "run_python_code",
    "count_lines",
    "count_characters",
    "detect_language",
    "normalize_language",
    "is_async_callable",
    "run_sync",
]


__version__ = "1.0.0"