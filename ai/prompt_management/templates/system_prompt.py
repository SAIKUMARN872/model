from __future__ import annotations

from typing import Any

from .template import PromptTemplate
from .utils import validate_template_source


class SystemPromptTemplate(PromptTemplate):
    """Prompt template intended for system-level instructions."""

    def __init__(
        self,
        template: str,
        input_variables: list[str] | tuple[str, ...] | None = None,
        *,
        name: str | None = None,
    ) -> None:
        validate_template_source(template)
        if not template.strip():
            raise ValueError("system prompt must not be empty")
        super().__init__(template, input_variables, name=name)

    def build(self, **kwargs: Any) -> str:
        return self.format(**kwargs)
