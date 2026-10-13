"""JSON serialization for prompt-management data."""

import json
from typing import Any

from .utils import normalize_data


class JsonFormatter:
    """Convert supported Python data into valid, readable JSON."""

    def format(self, data: Any, *, indent: int = 2) -> str:
        if not isinstance(indent, int) or isinstance(indent, bool) or indent < 0:
            raise ValueError("indent must be a non-negative integer.")

        normalized = normalize_data(data)
        return json.dumps(
            normalized,
            ensure_ascii=False,
            indent=indent,
            allow_nan=False,
        )

    def parse(self, content: str) -> Any:
        if not isinstance(content, str):
            raise TypeError("JSON content must be a string.")
        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON content: {exc.msg}.") from exc
