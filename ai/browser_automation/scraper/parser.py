"""
HTML parser utilities.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from html.parser import HTMLParser
from typing import Any

from .utils import clean_text


@dataclass
class ParsedHTML:
    """Parsed HTML result."""

    title: str = ""

    text: str = ""

    headings: list[str] = field(
        default_factory=list
    )

    links: list[str] = field(
        default_factory=list
    )

    images: list[str] = field(
        default_factory=list
    )

    metadata: dict[str, str] = field(
        default_factory=dict
    )


class HTMLDocumentParser(
    HTMLParser
):
    """
    Lightweight HTML parser.

    It extracts:

    - title
    - text
    - headings
    - links
    - images
    - common metadata
    """

    def __init__(
        self,
    ) -> None:

        super().__init__(
            convert_charrefs=True
        )

        self.result = ParsedHTML()

        self._inside_title = False

        self._current_heading: list[str] = []

        self._inside_heading = False

        self._text_parts: list[str] = []

    def handle_starttag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:

        attributes = dict(attrs)

        tag = tag.lower()

        if tag == "title":

            self._inside_title = True

        elif tag in {
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
        }:

            self._inside_heading = True

            self._current_heading = []

        elif tag == "a":

            href = attributes.get(
                "href"
            )

            if href:

                self.result.links.append(
                    href
                )

        elif tag == "img":

            src = attributes.get(
                "src"
            )

            if src:

                self.result.images.append(
                    src
                )

        elif tag == "meta":

            name = (
                attributes.get("name")
                or attributes.get("property")
            )

            content = attributes.get(
                "content"
            )

            if name and content:

                self.result.metadata[
                    name.lower()
                ] = content

    def handle_endtag(
        self,
        tag: str,
    ) -> None:

        tag = tag.lower()

        if tag == "title":

            self._inside_title = False

            self.result.title = clean_text(
                "".join(
                    self._text_parts
                )
            )

            self._text_parts.clear()

        elif tag in {
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
        }:

            heading = clean_text(
                "".join(
                    self._current_heading
                )
            )

            if heading:

                self.result.headings.append(
                    heading
                )

            self._current_heading = []

            self._inside_heading = False

    def handle_data(
        self,
        data: str,
    ) -> None:

        data = clean_text(
            data
        )

        if not data:
            return

        if self._inside_title:

            self._text_parts.append(
                data
            )

        elif self._inside_heading:

            self._current_heading.append(
                data
            )

        else:

            self._text_parts.append(
                data
            )

    def parse(
        self,
        html: str,
    ) -> ParsedHTML:

        self.reset()

        self.result = ParsedHTML()

        self._inside_title = False

        self._inside_heading = False

        self._current_heading = []

        self._text_parts = []

        self.feed(
            html
        )

        self.result.text = clean_text(
            " ".join(
                self._text_parts
            )
        )

        return self.result

    def reset(
        self,
    ) -> None:

        super().reset()

        self._text_parts.clear()

        self._current_heading.clear()