from __future__ import annotations

from html.parser import HTMLParser

from .utils import normalize_text

_IGNORED_TAGS = {
    "script", "style", "noscript", "svg", "template"
}

_BLOCK_TAGS = {
    "address", "article", "aside", "blockquote", "br", "dd", "div",
    "dl", "dt", "figcaption", "figure", "footer", "h1", "h2", "h3",
    "h4", "h5", "h6", "header", "hr", "li", "main", "nav", "ol",
    "p", "pre", "section", "table", "td", "th", "tr", "ul"
}


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.ignored_stack: list[str] = []

    def handle_starttag(self, tag, attrs) -> None:
        if tag in _IGNORED_TAGS:
            self.ignored_stack.append(tag)
            return

        if not self.ignored_stack and tag in _BLOCK_TAGS:
            self.parts.append("\n")

    def handle_startendtag(self, tag, attrs) -> None:
        if not self.ignored_stack and tag in _BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag) -> None:
        if tag in _IGNORED_TAGS:
            if tag in self.ignored_stack:
                index = len(self.ignored_stack) - 1 - self.ignored_stack[::-1].index(tag)
                self.ignored_stack.pop(index)
            return

        if not self.ignored_stack and tag in _BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if not self.ignored_stack:
            self.parts.append(data)


def parse_html(html: str) -> str:
    if not isinstance(html, str):
        raise TypeError("html must be a string")

    extractor = _TextExtractor()
    extractor.feed(html)
    extractor.close()
    return normalize_text("".join(extractor.parts))


__all__ = ["parse_html"]
