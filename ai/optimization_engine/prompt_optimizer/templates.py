from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PromptTemplate:
    name: str
    instruction_prefix: str = ""
    context_prefix: str = ""
    output_prefix: str = ""
    suffix: str = ""

    def render(
        self,
        instruction: str,
        *,
        context: str = "",
        output_format: str = "",
    ) -> str:
        parts: list[str] = []

        if self.instruction_prefix:
            parts.append(
                f"{self.instruction_prefix}{instruction.strip()}"
            )
        else:
            parts.append(instruction.strip())

        if context:
            context_text = context.strip()

            if self.context_prefix:
                parts.append(
                    f"{self.context_prefix}{context_text}"
                )
            else:
                parts.append(context_text)

        if output_format:
            output_text = output_format.strip()

            if self.output_prefix:
                parts.append(
                    f"{self.output_prefix}{output_text}"
                )
            else:
                parts.append(output_text)

        if self.suffix:
            parts.append(self.suffix.strip())

        return "\n\n".join(
            part for part in parts if part
        )


def create_instruction_template() -> PromptTemplate:
    return PromptTemplate(
        name="instruction",
        instruction_prefix="Instruction:\n",
    )


def create_context_template() -> PromptTemplate:
    return PromptTemplate(
        name="context",
        instruction_prefix="Task:\n",
        context_prefix="Context:\n",
    )


def create_structured_template() -> PromptTemplate:
    return PromptTemplate(
        name="structured",
        instruction_prefix="Task:\n",
        context_prefix="Context:\n",
        output_prefix="Output format:\n",
    )


def create_default_templates() -> dict[str, PromptTemplate]:
    templates = [
        create_instruction_template(),
        create_context_template(),
        create_structured_template(),
    ]

    return {
        template.name: template
        for template in templates
    }


def get_template(
    name: str,
) -> PromptTemplate:
    templates = create_default_templates()

    try:
        return templates[name]
    except KeyError as exc:
        raise ValueError(
            f"unknown prompt template: {name}"
        ) from exc


__all__ = [
    "PromptTemplate",
    "create_context_template",
    "create_default_templates",
    "create_instruction_template",
    "create_structured_template",
    "get_template",
]
