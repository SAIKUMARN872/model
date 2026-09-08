"""
Code review utilities for ModelNow.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable


class CodeReviewError(Exception):
    """Base exception for code review."""


@dataclass
class ReviewIssue:
    """
    Represents a single code review issue.
    """

    severity: str

    message: str

    line: int | None = None

    category: str = "general"

    suggestion: str = ""

    def to_dict(self) -> dict[str, Any]:

        return {
            "severity": self.severity,
            "message": self.message,
            "line": self.line,
            "category": self.category,
            "suggestion": self.suggestion,
        }


@dataclass
class CodeReviewRequest:
    """
    Represents a code review request.
    """

    code: str

    language: str = "python"

    filename: str | None = None

    requirements: list[str] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.code.strip():
            raise ValueError(
                "Code cannot be empty"
            )


@dataclass
class CodeReviewResult:
    """
    Result of a code review.
    """

    success: bool

    score: float

    issues: list[ReviewIssue] = field(
        default_factory=list
    )

    summary: str = ""

    corrected_code: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "success": self.success,
            "score": self.score,
            "issues": [
                issue.to_dict()
                for issue in self.issues
            ],
            "summary": self.summary,
            "corrected_code": self.corrected_code,
            "metadata": dict(
                self.metadata
            ),
        }


class CodeReviewer:
    """
    Code reviewer.

    Supports a provider handler for LLM-based review and
    basic Python validation without an external dependency.
    """

    def __init__(
        self,
        handler: Callable[..., Any] | None = None,
    ) -> None:

        self.handler = handler

    async def review(
        self,
        request: CodeReviewRequest,
    ) -> CodeReviewResult:

        issues = self.basic_review(
            request
        )

        provider_result = None

        if self.handler is not None:

            try:

                from .utils import execute_handler

                provider_result = (
                    await execute_handler(
                        self.handler,
                        request,
                    )
                )

            except Exception as exc:

                issues.append(
                    ReviewIssue(
                        severity="warning",
                        category="provider",
                        message=(
                            "External code review failed: "
                            f"{exc}"
                        ),
                    )
                )

        if provider_result:

            issues.extend(
                self._parse_provider_issues(
                    provider_result
                )
            )

        score = self.calculate_score(
            issues
        )

        success = not any(
            issue.severity
            in {"critical", "error"}
            for issue in issues
        )

        summary = self.build_summary(
            issues,
            score,
        )

        corrected_code = None

        if isinstance(
            provider_result,
            dict,
        ):

            corrected_code = (
                provider_result.get(
                    "corrected_code"
                )
            )

        return CodeReviewResult(
            success=success,
            score=score,
            issues=issues,
            summary=summary,
            corrected_code=corrected_code,
            metadata=request.metadata,
        )

    def basic_review(
        self,
        request: CodeReviewRequest,
    ) -> list[ReviewIssue]:

        issues: list[ReviewIssue] = []

        if request.language.lower() != "python":
            return issues

        try:

            compile(
                request.code,
                request.filename or "<code>",
                "exec",
            )

        except SyntaxError as exc:

            issues.append(
                ReviewIssue(
                    severity="critical",
                    category="syntax",
                    message=(
                        f"Syntax error: {exc.msg}"
                    ),
                    line=exc.lineno,
                    suggestion=(
                        "Fix the Python syntax error."
                    ),
                )
            )

            return issues

        lines = request.code.splitlines()

        for index, line in enumerate(
            lines,
            start=1,
        ):

            stripped = line.strip()

            if "TODO" in stripped:

                issues.append(
                    ReviewIssue(
                        severity="warning",
                        category="quality",
                        message="TODO remains in code.",
                        line=index,
                        suggestion=(
                            "Implement or remove the TODO."
                        ),
                    )
                )

            if "eval(" in stripped:

                issues.append(
                    ReviewIssue(
                        severity="critical",
                        category="security",
                        message=(
                            "Use of eval() detected."
                        ),
                        line=index,
                        suggestion=(
                            "Avoid eval() for untrusted input."
                        ),
                    )
                )

            if "exec(" in stripped:

                issues.append(
                    ReviewIssue(
                        severity="critical",
                        category="security",
                        message=(
                            "Use of exec() detected."
                        ),
                        line=index,
                        suggestion=(
                            "Avoid dynamic execution."
                        ),
                    )
                )

            if "password" in stripped.lower():

                issues.append(
                    ReviewIssue(
                        severity="warning",
                        category="security",
                        message=(
                            "Possible password handling "
                            "detected."
                        ),
                        line=index,
                        suggestion=(
                            "Use secure secret management."
                        ),
                    )
                )

        if len(lines) > 500:

            issues.append(
                ReviewIssue(
                    severity="warning",
                    category="maintainability",
                    message=(
                        "File contains more than "
                        "500 lines."
                    ),
                    suggestion=(
                        "Consider splitting the module."
                    ),
                )
            )

        return issues

    @staticmethod
    def calculate_score(
        issues: list[ReviewIssue],
    ) -> float:

        score = 100.0

        penalties = {
            "critical": 30.0,
            "error": 20.0,
            "warning": 5.0,
            "info": 1.0,
        }

        for issue in issues:

            score -= penalties.get(
                issue.severity.lower(),
                1.0,
            )

        return max(
            0.0,
            min(100.0, score),
        )

    @staticmethod
    def build_summary(
        issues: list[ReviewIssue],
        score: float,
    ) -> str:

        if not issues:
            return (
                f"Code review passed with a "
                f"score of {score:.1f}/100."
            )

        critical = sum(
            issue.severity == "critical"
            for issue in issues
        )

        errors = sum(
            issue.severity == "error"
            for issue in issues
        )

        warnings = sum(
            issue.severity == "warning"
            for issue in issues
        )

        return (
            f"Code review score: {score:.1f}/100. "
            f"Critical: {critical}, "
            f"Errors: {errors}, "
            f"Warnings: {warnings}."
        )

    @staticmethod
    def _parse_provider_issues(
        result: Any,
    ) -> list[ReviewIssue]:

        if not isinstance(
            result,
            dict,
        ):
            return []

        raw_issues = result.get(
            "issues",
            [],
        )

        if not isinstance(
            raw_issues,
            list,
        ):
            return []

        parsed: list[ReviewIssue] = []

        for item in raw_issues:

            if isinstance(
                item,
                ReviewIssue,
            ):

                parsed.append(item)

                continue

            if isinstance(
                item,
                dict,
            ):

                parsed.append(
                    ReviewIssue(
                        severity=str(
                            item.get(
                                "severity",
                                "info",
                            )
                        ),
                        message=str(
                            item.get(
                                "message",
                                "",
                            )
                        ),
                        line=item.get(
                            "line"
                        ),
                        category=str(
                            item.get(
                                "category",
                                "general",
                            )
                        ),
                        suggestion=str(
                            item.get(
                                "suggestion",
                                "",
                            )
                        ),
                    )
                )

        return parsed