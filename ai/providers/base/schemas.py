@'
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping


@dataclass(frozen=True)
class ValidationIssue:
    """
    Single validation problem.

    field:
        Name/path of the invalid field.

    message:
        Human-readable explanation.

    code:
        Stable machine-readable validation code.
    """

    field: str
    message: str
    code: str = "validation_error"

    def __str__(self) -> str:
        return f"{self.field}: {self.message}"


@dataclass
class ValidationResult:
    """
    Result returned by provider request validation.
    """

    valid: bool = True
    issues: list[ValidationIssue] = field(
        default_factory=list
    )
    warnings: list[ValidationIssue] = field(
        default_factory=list
    )
    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    @property
    def errors(self) -> list[ValidationIssue]:
        return self.issues

    @property
    def is_valid(self) -> bool:
        return self.valid and not self.issues

    def add_error(
        self,
        *,
        field: str,
        message: str,
        code: str = "validation_error",
    ) -> None:
        self.issues.append(
            ValidationIssue(
                field=field,
                message=message,
                code=code,
            )
        )
        self.valid = False

    def add_warning(
        self,
        *,
        field: str,
        message: str,
        code: str = "validation_warning",
    ) -> None:
        self.warnings.append(
            ValidationIssue(
                field=field,
                message=message,
                code=code,
            )
        )

    def raise_for_errors(self) -> None:
        if self.is_valid:
            return

        message = "; ".join(
            str(issue)
            for issue in self.issues
        )

        raise ValueError(
            message or "Provider request validation failed."
        )


@dataclass(frozen=True)
class ProviderRequestSchema:
    """
    Provider-agnostic request schema.

    This represents the normalized contract passed from
    ModelNow's orchestration/routing layer toward a concrete
    provider adapter.

    Concrete providers can translate this normalized structure
    into OpenAI, Anthropic, Google, Azure, Bedrock, etc.
    request formats.
    """

    model: str

    messages: tuple[Mapping[str, Any], ...] = ()

    temperature: float | None = None

    max_tokens: int | None = None

    top_p: float | None = None

    stream: bool = False

    tools: tuple[Mapping[str, Any], ...] = ()

    tool_choice: Any = None

    response_format: Mapping[str, Any] | None = None

    stop: tuple[str, ...] = ()

    seed: int | None = None

    user: str | None = None

    request_id: str | None = None

    metadata: Mapping[str, Any] = field(
        default_factory=dict
    )

    @property
    def message_count(self) -> int:
        return len(self.messages)

    @property
    def tool_count(self) -> int:
        return len(self.tools)

    def to_dict(self) -> dict[str, Any]:
        return {
            "model": self.model,
            "messages": [
                dict(message)
                for message in self.messages
            ],
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "top_p": self.top_p,
            "stream": self.stream,
            "tools": [
                dict(tool)
                for tool in self.tools
            ],
            "tool_choice": self.tool_choice,
            "response_format": (
                dict(self.response_format)
                if self.response_format is not None
                else None
            ),
            "stop": list(self.stop),
            "seed": self.seed,
            "user": self.user,
            "request_id": self.request_id,
            "metadata": dict(self.metadata),
        }


__all__ = [
    "ProviderRequestSchema",
    "ValidationIssue",
    "ValidationResult",
]
'@ | Set-Content ".\ai\providers\base\schemas.py" -Encoding UTF8