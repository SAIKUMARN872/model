"""Bounded local-file loader for MCP resources."""
import mimetypes
from pathlib import Path
from urllib.parse import unquote, urlsplit
from ai.mcp.resources.resource import MCPResource
from ai.mcp.resources.utils import validate_resource_uri

DEFAULT_MAX_BYTES = 2_000_000


class MCPResourceLoader:
    def __init__(
        self,
        allowed_root: str | Path | None = None,
        *,
        max_bytes: int = DEFAULT_MAX_BYTES,
        encoding: str = "utf-8",
    ) -> None:
        if not isinstance(max_bytes, int) or isinstance(max_bytes, bool) or max_bytes < 1:
            raise ValueError("max_bytes must be a positive integer.")
        self.allowed_root = Path(allowed_root).resolve() if allowed_root is not None else None
        self.max_bytes = max_bytes
        self.encoding = encoding

    def load_file(self, path: str | Path, *, uri: str | None = None) -> MCPResource:
        candidate = Path(path).resolve(strict=True)
        if not candidate.is_file():
            raise ValueError("Resource path must identify a regular file.")
        if self.allowed_root is not None:
            try:
                candidate.relative_to(self.allowed_root)
            except ValueError as exc:
                raise PermissionError("Resource path is outside the allowed root.") from exc

        with candidate.open("rb") as stream:
            raw = stream.read(self.max_bytes + 1)
        if len(raw) > self.max_bytes:
            raise ValueError("Resource exceeds configured size limit.")

        mime_type = mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
        resource_uri = uri or candidate.as_uri()
        validate_resource_uri(resource_uri)
        common = {
            "uri": resource_uri,
            "name": candidate.name,
            "mime_type": mime_type,
        }
        if mime_type.startswith("text/") or mime_type in {
            "application/json", "application/xml", "application/javascript"
        }:
            try:
                text = raw.decode(self.encoding)
            except UnicodeDecodeError:
                return MCPResource(**common, blob=raw)
            return MCPResource(**common, text=text)
        return MCPResource(**common, blob=raw)

    def load_uri(self, uri: str) -> MCPResource:
        validate_resource_uri(uri)
        parsed = urlsplit(uri)
        if parsed.scheme.lower() != "file":
            raise ValueError("Only file:// URIs are supported by this loader.")
        if parsed.netloc not in ("", "localhost"):
            raise PermissionError("Remote file URI hosts are not allowed.")
        path = unquote(parsed.path)
        if len(path) >= 3 and path[0] == "/" and path[2] == ":":
            path = path[1:]
        return self.load_file(path, uri=uri)
