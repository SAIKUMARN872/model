from __future__ import annotations

from dataclasses import dataclass

from .utils import normalize_whitespace, remove_duplicate_lines, validate_prompt


@dataclass(frozen=True)
class RewriteResult:
    original_prompt: str
    rewritten_prompt: str
    transformations: tuple[str, ...]


class PromptRewriter:
    def rewrite(self, prompt: str) -> RewriteResult:
        validate_prompt(prompt)
        current = prompt
        transformations: list[str] = []

        normalized = normalize_whitespace(current)
        if normalized != current:
            transformations.append("normalize_whitespace")
            current = normalized

        deduplicated = remove_duplicate_lines(current)
        if deduplicated != current:
            transformations.append("remove_duplicate_lines")
            current = deduplicated

        # Normalize once more after removing repeated lines.
        final = normalize_whitespace(current)
        if final != current:
            transformations.append("normalize_whitespace_after_deduplication")
            current = final

        return RewriteResult(
            original_prompt=prompt,
            rewritten_prompt=current,
            transformations=tuple(transformations),
        )
