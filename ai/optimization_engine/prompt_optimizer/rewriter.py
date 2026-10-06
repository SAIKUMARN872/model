from __future__ import annotations

from dataclasses import dataclass

from .utils import (
    normalize_prompt,
    remove_repeated_blank_lines,
    remove_repeated_spaces,
)


@dataclass(frozen=True)
class PromptRewriteResult:
    original_prompt: str
    rewritten_prompt: str
    changed: bool
    characters_saved: int


class PromptRewriter:
    def __init__(
        self,
        *,
        add_structure: bool = True,
        normalize_whitespace: bool = True,
    ) -> None:
        self.add_structure = add_structure
        self.normalize_whitespace = normalize_whitespace

    def rewrite(
        self,
        prompt: str,
    ) -> PromptRewriteResult:
        if not isinstance(prompt, str):
            raise TypeError("prompt must be a string")

        original = prompt
        rewritten = prompt

        if self.normalize_whitespace:
            rewritten = normalize_prompt(rewritten)
            rewritten = remove_repeated_spaces(rewritten)
            rewritten = remove_repeated_blank_lines(rewritten)

        if self.add_structure:
            rewritten = self._add_structure(rewritten)

        rewritten = rewritten.strip()

        characters_saved = max(
            0,
            len(original) - len(rewritten),
        )

        return PromptRewriteResult(
            original_prompt=original,
            rewritten_prompt=rewritten,
            changed=original != rewritten,
            characters_saved=characters_saved,
        )

    def _add_structure(
        self,
        prompt: str,
    ) -> str:
        if not prompt:
            return prompt

        lines = [
            line.strip()
            for line in prompt.splitlines()
            if line.strip()
        ]

        if not lines:
            return ""

        first_line = lines[0].lower()

        if (
            first_line.startswith("instruction:")
            or first_line.startswith("task:")
            or first_line.startswith("request:")
        ):
            return "\n".join(lines)

        return "Task:\n" + "\n".join(lines)

    def rewrite_instruction(
        self,
        instruction: str,
    ) -> PromptRewriteResult:
        if not isinstance(instruction, str):
            raise TypeError("instruction must be a string")

        return self.rewrite(instruction)

    def rewrite_with_context(
        self,
        instruction: str,
        context: str,
    ) -> PromptRewriteResult:
        if not isinstance(instruction, str):
            raise TypeError("instruction must be a string")

        if not isinstance(context, str):
            raise TypeError("context must be a string")

        instruction_result = self.rewrite(instruction)

        context_text = normalize_prompt(context)

        if context_text:
            rewritten = (
                f"{instruction_result.rewritten_prompt}"
                f"\n\nContext:\n{context_text}"
            )
        else:
            rewritten = instruction_result.rewritten_prompt

        return PromptRewriteResult(
            original_prompt=(
                instruction
                if not context
                else f"{instruction}\n\n{context}"
            ),
            rewritten_prompt=rewritten,
            changed=(
                rewritten
                != (
                    instruction
                    if not context
                    else f"{instruction}\n\n{context}"
                )
            ),
            characters_saved=max(
                0,
                len(instruction)
                + (len(context) + 2 if context else 0)
                - len(rewritten),
            ),
        )


def create_default_rewriter() -> PromptRewriter:
    return PromptRewriter()


__all__ = [
    "PromptRewriteResult",
    "PromptRewriter",
    "create_default_rewriter",
]
