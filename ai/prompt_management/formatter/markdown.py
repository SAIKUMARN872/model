"""Markdown rendering for prompts, sections, and structured data."""

from collections.abc import Mapping
from typing import Any

from .utils import normalize_data


def _render_value(value: Any, depth: int = 2) -> str:
    if isinstance(value, dict):
        sections = []
        for key, item in value.items():
            heading_level = min(depth, 6)
            heading = "#" * heading_level + " " + key
            body = _render_value(item, depth + 1)
            sections.append(f"{heading}\n\n{body}" if body else heading)
        return "\n\n".join(sections)

    if isinstance(value, list):
        if not value:
            return "_(empty list)_"

        lines = []
        for item in value:
            if isinstance(item, (dict, list)):
                rendered = _render_value(item, depth + 1)
                lines.append("-")
                lines.append(
                    "\n".join("  " + line for line in rendered.splitlines())
                )
            else:
                lines.append(f"- {item}")
        return "\n".join(lines)

    if value is None:
        return "_None_"
    if isinstance(value, bool):
        return "true" if value else "false"
    return str(value)


class MarkdownFormatter:
    """Render structured data as readable Markdown."""

    def format(self, data: Any) -> str:
        normalized = normalize_data(data)

        if isinstance(normalized, str):
            return normalized

        return _render_value(normalized)

    def format_sections(self, sections: Mapping[str, Any]) -> str:
        if not isinstance(sections, Mapping):
            raise TypeError("sections must be a mapping.")

        normalized = normalize_data(sections)
        if not normalized:
            raise ValueError("At least one section is required.")

        return _render_value(normalized)
