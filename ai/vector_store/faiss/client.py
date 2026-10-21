"""Client for managing persistent ModelNow FAISS collections."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from ai.vector_store.faiss.index import FaissIndex
from ai.vector_store.faiss.utils import validate_collection_name, validate_dimension


class FaissClient:
    """Manage one FAISS index and metadata file per collection."""

    def __init__(self, persist_directory: str | Path = ".modelnow/faiss") -> None:
        self.persist_directory = Path(persist_directory).expanduser()
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        self._states: dict[str, dict[str, Any]] = {}

    def _directory(self, name: str) -> Path:
        key = hashlib.sha256(name.encode("utf-8")).hexdigest()
        return self.persist_directory / key

    def create_collection(self, name: str, dimension: int) -> dict[str, Any]:
        name = validate_collection_name(name)
        dimension = validate_dimension(dimension)
        directory = self._directory(name)
        if name in self._states or (directory / "collection.json").exists():
            raise ValueError(f"Collection already exists: {name}")

        directory.mkdir(parents=True, exist_ok=True)
        state = {
            "name": name,
            "dimension": dimension,
            "index": FaissIndex(dimension, directory / "index.faiss"),
            "documents": {},
            "directory": directory,
        }
        self._states[name] = state
        self._save_state(state)
        return state

    def get_collection(self, name: str) -> dict[str, Any]:
        name = validate_collection_name(name)
        if name in self._states:
            return self._states[name]

        directory = self._directory(name)
        metadata_path = directory / "collection.json"
        if not metadata_path.is_file():
            raise KeyError(f"Collection not found: {name}")

        payload = json.loads(metadata_path.read_text(encoding="utf-8"))
        if payload.get("name") != name:
            raise ValueError("Collection metadata name mismatch")
        dimension = validate_dimension(payload["dimension"])
        index = FaissIndex(dimension, directory / "index.faiss")
        index.load()
        state = {
            "name": name,
            "dimension": dimension,
            "index": index,
            "documents": payload.get("documents", {}),
            "directory": directory,
        }
        self._states[name] = state
        return state

    def _save_state(self, state: dict[str, Any]) -> None:
        state["index"].save()
        path = state["directory"] / "collection.json"
        temporary = state["directory"] / "collection.json.tmp"
        payload = {
            "name": state["name"],
            "dimension": state["dimension"],
            "documents": state["documents"],
        }
        temporary.write_text(
            json.dumps(payload, ensure_ascii=False, allow_nan=False),
            encoding="utf-8",
        )
        temporary.replace(path)

    def list_collections(self) -> list[dict[str, Any]]:
        names: set[str] = set(self._states)
        for path in self.persist_directory.glob("*/collection.json"):
            try:
                names.add(json.loads(path.read_text(encoding="utf-8"))["name"])
            except (OSError, ValueError, KeyError):
                continue
        return [
            {
                "name": name,
                "count": len(self.get_collection(name)["documents"]),
                "dimension": self.get_collection(name)["dimension"],
            }
            for name in sorted(names)
        ]

    def delete_collection(self, name: str) -> bool:
        import shutil

        name = validate_collection_name(name)
        directory = self._directory(name)
        if name not in self._states and not (directory / "collection.json").is_file():
            return False
        self._states.pop(name, None)
        if directory.exists():
            shutil.rmtree(directory)
        return True
