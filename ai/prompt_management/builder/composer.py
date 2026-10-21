from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ai.prompt_management.builder.utils import validate_text


@dataclass(frozen=True, slots=True)
class PromptParts:
    user_input: str
    system_instructions: str = ""
    context: str = ""
    additional_instructions: tuple[str, ...] = ()
    metadata: dict[str, Any] = field(default_factory=dict)


class PromptComposer:
    """Compose a prompt from clearly separated, ordered sections."""

    def compose(self, parts: PromptParts) -> str:
        user_input = validate_text(parts.user_input, "user_input")
        sections: list[str] = []

        if parts.system_instructions.strip():
            sections.append(
                "SYSTEM INSTRUCTIONS:\n"
                + validate_text(parts.system_instructions, "system_instructions")
            )

        if parts.context.strip():
            sections.append(
                "CONTEXT:\n" + validate_text(parts.context, "context")
            )

        for instruction in parts.additional_instructions:
            sections.append(
                "ADDITIONAL INSTRUCTION:\n"
                + validate_text(instruction, "additional_instruction")
            )

        sections.append("USER INPUT:\n" + user_input)
        return "\n\n".join(sections)
