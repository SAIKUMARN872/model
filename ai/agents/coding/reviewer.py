from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ReviewResult:
    """Code-review summary and findings."""

    summary: str = "No review findings were supplied."
    issues: tuple[str, ...] = ()
    suggestions: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if not isinstance(self.summary, str):
            raise TypeError("summary must be a string")

        for field_name in ("issues", "suggestions"):
            value = getattr(self, field_name)

            if not isinstance(value, tuple) or any(
                not isinstance(item, str) or not item.strip()
                for item in value
            ):
                raise TypeError(
                    f"{field_name} must be a tuple of non-empty strings"
                )


class CodeReviewer:
    """Base contract for a model-backed code reviewer."""

    async def review(
        self,
        code: str,
        *,
        language: str = "python",
    ) -> ReviewResult:
        raise NotImplementedError(
            "Implement review() in a provider-specific reviewer"
        )


__all__ = ["CodeReviewer", "ReviewResult"]
