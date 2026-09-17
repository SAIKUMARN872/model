"""
Cookie persistence storage.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class CookieStorageError(Exception):
    """Cookie storage error."""


class CookieStorage:
    """
    JSON-based cookie storage.

    Cookie files should be protected with appropriate
    filesystem permissions because they may contain
    authentication information.
    """

    def __init__(
        self,
        directory: str | Path = ".browser_data/cookies",
    ) -> None:

        self.directory = Path(
            directory
        )

        self.directory.mkdir(
            parents=True,
            exist_ok=True,
        )

    def _path(
        self,
        name: str,
    ) -> Path:

        safe_name = (
            name.strip()
            .replace("/", "_")
            .replace("\\", "_")
        )

        if not safe_name:

            raise ValueError(
                "Cookie storage name cannot be empty."
            )

        return (
            self.directory
            / f"{safe_name}.json"
        )

    def save(
        self,
        name: str,
        cookies: list[dict[str, Any]],
    ) -> Path:

        path = self._path(
            name
        )

        try:

            with path.open(
                "w",
                encoding="utf-8",
            ) as file:

                json.dump(
                    cookies,
                    file,
                    indent=2,
                    ensure_ascii=False,
                )

        except OSError as exc:

            raise CookieStorageError(
                f"Failed to save cookies: {exc}"
            ) from exc

        return path

    def load(
        self,
        name: str,
    ) -> list[dict[str, Any]]:

        path = self._path(
            name
        )

        if not path.exists():

            return []

        try:

            with path.open(
                "r",
                encoding="utf-8",
            ) as file:

                data = json.load(
                    file
                )

        except (
            OSError,
            json.JSONDecodeError,
        ) as exc:

            raise CookieStorageError(
                f"Failed to load cookies: {exc}"
            ) from exc

        if not isinstance(
            data,
            list,
        ):

            raise CookieStorageError(
                "Cookie storage must contain a list."
            )

        return data

    def delete(
        self,
        name: str,
    ) -> bool:

        path = self._path(
            name
        )

        if not path.exists():
            return False

        try:

            path.unlink()

        except OSError as exc:

            raise CookieStorageError(
                f"Failed to delete cookie file: "
                f"{exc}"
            ) from exc

        return True

    def exists(
        self,
        name: str,
    ) -> bool:

        return self._path(
            name
        ).exists()

    def list_profiles(
        self,
    ) -> list[str]:

        return sorted(
            path.stem
            for path in self.directory.glob(
                "*.json"
            )
        )

    def clear(self) -> None:

        for path in self.directory.glob(
            "*.json"
        ):

            try:
                path.unlink()
            except OSError:
                pass