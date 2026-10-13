"""Unified formatter interface for ModelNow Prompt Management."""

from typing import Any

from .json_formatter import JsonFormatter
from .markdown import MarkdownFormatter
from .utils import normalize_data, validate_format


class PromptFormatter:
    """Dispatch data to the requested output formatter."""

    def __init__(self) -> None:
        self.json_formatter = JsonFormatter()
        self.markdown_formatter = MarkdownFormatter()

    def format(self, data: Any, output_format: str = "text") -> str:
        selected = validate_format(output_format)
        normalized = normalize_data(data)

        if selected == "json":
            return self.json_formatter.format(normalized)

        if selected == "markdown":
            return self.markdown_formatter.format(normalized)

        if isinstance(normalized, str):
            return normalized

        return self.json_formatter.format(normalized)

    def format_prompt(
        self,
        prompt: str,
        output_format: str = "text",
    ) -> str:
        if not isinstance(prompt, str):
            raise TypeError("prompt must be a string.")
        if not prompt.strip():
            raise ValueError("prompt must not be empty.")
        return self.format(prompt, output_format)


def format_prompt(data: Any, output_format: str = "text") -> str:
    """Convenience function for callers that do not need a formatter instance."""
    return PromptFormatter().format(data, output_format)
