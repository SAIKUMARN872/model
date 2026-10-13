from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from typing import Any

from .security import validate_cookie_data


class CookieStorage:
    """Store browser cookies in a local JSON file with restrictive permissions."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path).expanduser().resolve()

    def save(self, cookies: list[dict[str, Any]]) -> None:
        if not isinstance(cookies, list):
            raise ValueError("Cookies must be provided as a list.")

        validated = [validate_cookie_data(cookie) for cookie in cookies]
        self.path.parent.mkdir(parents=True, exist_ok=True)

        file_descriptor, temporary_name = tempfile.mkstemp(
            prefix=".cookies-",
            suffix=".tmp",
            dir=str(self.path.parent),
        )
        temporary_path = Path(temporary_name)

        try:
            if os.name != "nt":
                os.chmod(temporary_path, 0o600)

            with os.fdopen(file_descriptor, "w", encoding="utf-8") as handle:
                json.dump(validated, handle, ensure_ascii=False, indent=2)
                handle.flush()
                os.fsync(handle.fileno())

            os.replace(temporary_path, self.path)

            if os.name != "nt":
                os.chmod(self.path, 0o600)
        finally:
            if temporary_path.exists():
                temporary_path.unlink()

    def load(self) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []

        try:
            with self.path.open("r", encoding="utf-8") as handle:
                data = json.load(handle)
        except (OSError, json.JSONDecodeError) as exc:
            raise ValueError("Cookie storage could not be read.") from exc

        if not isinstance(data, list):
            raise ValueError("Cookie storage must contain a JSON list.")

        return [validate_cookie_data(cookie) for cookie in data]

    def delete(self) -> bool:
        try:
            self.path.unlink()
            return True
        except FileNotFoundError:
            return False
