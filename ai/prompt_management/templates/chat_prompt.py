from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from .template import PromptTemplate
from .utils import validate_role


@dataclass(frozen=True)
class ChatMessage:
    role: str
    content: str

    def __post_init__(self) -> None:
        validate_role(self.role)
        if not isinstance(self.content, str) or not self.content.strip():
            raise ValueError("message content must be a non-empty string")

    def to_dict(self) -> dict[str, str]:
        return {"role": self.role, "content": self.content}


class ChatPromptTemplate:
    """Ordered chat messages rendered into provider-neutral message dictionaries."""

    def __init__(
        self,
        messages: Sequence[ChatMessage | Mapping[str, Any]],
        *,
        name: str | None = None,
    ) -> None:
        if isinstance(messages, (str, bytes)) or not isinstance(messages, Sequence):
            raise TypeError("messages must be a sequence of messages")
        if not messages:
            raise ValueError("messages must not be empty")
        if name is not None and (not isinstance(name, str) or not name.strip()):
            raise ValueError("name must be a non-empty string when provided")

        normalized: list[tuple[str, PromptTemplate]] = []
        for index, item in enumerate(messages):
            if isinstance(item, ChatMessage):
                role, content = item.role, item.content
            elif isinstance(item, Mapping):
                if set(item) != {"role", "content"}:
                    raise ValueError(
                        f"message {index} must contain exactly role and content"
                    )
                role, content = item["role"], item["content"]
                validate_role(role)
                if not isinstance(content, str) or not content.strip():
                    raise ValueError(
                        f"message {index} content must be a non-empty string"
                    )
            else:
                raise TypeError(f"message {index} must be ChatMessage or a mapping")

            normalized.append((role, PromptTemplate(content)))

        self._messages = tuple(normalized)
        self.name = name
        self.input_variables = tuple(
            dict.fromkeys(
                variable
                for _, template in self._messages
                for variable in template.input_variables
            )
        )

    def format_messages(self, **kwargs: Any) -> list[dict[str, str]]:
        missing = set(self.input_variables) - set(kwargs)
        extra = set(kwargs) - set(self.input_variables)
        if missing:
            raise ValueError(f"Missing template variables: {sorted(missing)}")
        if extra:
            raise ValueError(f"Unexpected template variables: {sorted(extra)}")

        rendered_messages: list[dict[str, str]] = []
        for role, template in self._messages:
            message_values = {
                name: kwargs[name] for name in template.input_variables
            }
            rendered_messages.append(
                {"role": role, "content": template.format(**message_values)}
            )
        return rendered_messages
    def render(self, values: Mapping[str, Any] | None = None, **kwargs: Any) -> list[dict[str, str]]:
        if values is not None and not isinstance(values, Mapping):
            raise TypeError("values must be a mapping")
        combined = dict(values or {})
        overlap = set(combined).intersection(kwargs)
        if overlap:
            raise ValueError(f"Variables supplied more than once: {sorted(overlap)}")
        combined.update(kwargs)
        return self.format_messages(**combined)

    def get_template_variables(self) -> tuple[str, ...]:
        return self.input_variables

