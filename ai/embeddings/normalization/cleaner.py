"""
Text cleaning functionality for embeddings.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Callable

from .utils import (
    normalize_for_embedding,
    strip_html,
    validate_text,
)


@dataclass
class CleanerConfig:
    """Configuration for text cleaning."""

    remove_html: bool = True

    remove_urls: bool = False

    remove_emails: bool = False

    remove_extra_whitespace: bool = True

    preserve_newlines: bool = True

    lowercase: bool = False


class TextCleaner:
    """Cleans text before embedding."""

    URL_PATTERN = re.compile(
        r"https?://\S+|www\.\S+",
        re.IGNORECASE,
    )

    EMAIL_PATTERN = re.compile(
        r"\b[A-Za-z0-9._%+-]+@"
        r"[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    )

    def __init__(
        self,
        config: CleanerConfig | None = None,
    ) -> None:

        self.config = (
            config
            or CleanerConfig()
        )

    def clean(
        self,
        text: str,
    ) -> str:

        text = validate_text(
            text
        )

        if self.config.remove_html:

            text = strip_html(
                text
            )

        if self.config.remove_urls:

            text = self.URL_PATTERN.sub(
                " ",
                text,
            )

        if self.config.remove_emails:

            text = self.EMAIL_PATTERN.sub(
                " ",
                text,
            )

        if self.config.lowercase:

            text = text.lower()

        if self.config.remove_extra_whitespace:

            if self.config.preserve_newlines:

                lines = []

                for line in text.split("\n"):

                    line = re.sub(
                        r"[ \t]+",
                        " ",
                        line,
                    ).strip()

                    if line:
                        lines.append(line)

                text = "\n".join(
                    lines
                )

            else:

                text = re.sub(
                    r"\s+",
                    " ",
                    text,
                ).strip()

        return normalize_for_embedding(
            text
        )

    def clean_many(
        self,
        texts: list[str],
    ) -> list[str]:

        return [
            self.clean(text)
            for text in texts
        ]

    def add_rule(
        self,
        rule: Callable[[str], str],
    ) -> None:

        if not callable(rule):

            raise TypeError(
                "Cleaning rule must be callable"
            )

        # Dynamically add a custom cleaning rule.
        if not hasattr(
            self,
            "_custom_rules",
        ):

            self._custom_rules = []

        self._custom_rules.append(
            rule
        )

    def clean_with_rules(
        self,
        text: str,
    ) -> str:

        text = self.clean(
            text
        )

        for rule in getattr(
            self,
            "_custom_rules",
            [],
        ):

            text = rule(
                text
            )

            if not isinstance(
                text,
                str,
            ):

                raise TypeError(
                    "Cleaning rules must return strings"
                )

        return normalize_for_embedding(
            text
        )