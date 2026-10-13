"""Public validation facade for tool inputs."""

from .validator import ToolInputValidationError, validate_arguments

__all__ = ["ToolInputValidationError", "validate_arguments"]
