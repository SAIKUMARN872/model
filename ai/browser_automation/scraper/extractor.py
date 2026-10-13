"""HTML extraction using the Python standard library."""

from html.parser import HTMLParser
from urllib.parse import urljoin

from .utils import normalize_text


class _DocumentParser(HTMLParser):
    VOID_ELEMENTS = {
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr",
    }
    IGNORED_ELEMENTS = {"script", "style", "noscript", "template", "svg"}

    def __init__(self, base_url=""):
        super().__init__(convert_charrefs=True)
        self.base_url = base_url
        self.title = ""
        self.title_parts = []
        self.title_depth = 0
        self.headings = []
        self.links = []
        self.metadata = {}
        self.text_parts = []
        self._heading_tag = None
        self._heading_parts = []
        self._ignored_stack = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        tag = tag.lower()

        if tag in self.IGNORED_ELEMENTS:
            self._ignored_stack.append(tag)
            self._skip_depth += 1
            return

        if self._skip_depth:
            return

        if tag == "title":
            self.title_depth += 1

        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self._heading_tag = tag
            self._heading_parts = []

        if tag == "meta":
            name = (attrs.get("name") or attrs.get("property") or "").strip().lower()
            content = normalize_text(attrs.get("content", ""))
            if name and content:
                self.metadata[name] = content

        if tag == "a" and attrs.get("href"):
            href = attrs["href"].strip()
            if href and not href.lower().startswith(
                ("javascript:", "data:", "vbscript:")
            ):
                self.links.append({
                    "text": "",
                    "url": urljoin(self.base_url, href) if self.base_url else href,
                    "rel": attrs.get("rel", ""),
                })
                self._active_link = len(self.links) - 1

    def handle_endtag(self, tag):
        tag = tag.lower()

        if tag in self.IGNORED_ELEMENTS:
            if self._ignored_stack:
                self._ignored_stack.pop()
                self._skip_depth = max(0, self._skip_depth - 1)
            return

        if self._skip_depth:
            return

        if tag == "title" and self.title_depth:
            self.title_depth -= 1
            self.title = normalize_text(" ".join(self.title_parts))

        if self._heading_tag == tag:
            heading_text = normalize_text(" ".join(self._heading_parts))
            if heading_text:
                self.headings.append({"level": int(tag[1]), "text": heading_text})
            self._heading_tag = None
            self._heading_parts = []

        if tag == "a":
            self._active_link = None

    def handle_data(self, data):
        if self._skip_depth:
            return

        value = normalize_text(data)
        if not value:
            return

        self.text_parts.append(value)

        if self.title_depth:
            self.title_parts.append(value)

        if self._heading_tag:
            self._heading_parts.append(value)

        active_link = getattr(self, "_active_link", None)
        if active_link is not None and active_link < len(self.links):
            old_text = self.links[active_link]["text"]
            self.links[active_link]["text"] = normalize_text(f"{old_text} {value}")


def extract_html(html, base_url=""):
    """Extract basic readable content and metadata from an HTML document."""
    if not isinstance(html, str):
        raise TypeError("html must be a string.")

    parser = _DocumentParser(base_url=base_url)
    parser.feed(html)
    parser.close()

    return {
        "title": parser.title,
        "metadata": parser.metadata,
        "headings": parser.headings,
        "links": parser.links,
        "text": normalize_text(" ".join(parser.text_parts)),
    }
