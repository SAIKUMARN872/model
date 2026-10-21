"""FAISS index creation, search, and persistence."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import faiss
import numpy as np

from ai.vector_store.faiss.utils import to_float32_matrix, validate_dimension


class FaissIndex:
    """Manage a normalized inner-product index for cosine similarity."""

    def __init__(self, dimension: int, index_path: str | Path | None = None) -> None:
        self.dimension = validate_dimension(dimension)
        self.index_path = Path(index_path) if index_path is not None else None
        self._index = faiss.IndexIDMap2(faiss.IndexFlatIP(self.dimension))

    @property
    def index(self):
        return self._index

    @property
    def count(self) -> int:
        return int(self._index.ntotal)

    def existing_ids(self) -> set[int]:
        if self.count == 0:
            return set()
        return {int(value) for value in faiss.vector_to_array(self._index.id_map)}

    def add(self, ids: list[int], vectors) -> int:
        if not ids:
            raise ValueError("At least one ID is required")
        if any(isinstance(value, bool) or not isinstance(value, int) for value in ids):
            raise TypeError("IDs must be integers")
        if len(set(ids)) != len(ids):
            raise ValueError("IDs must be unique")
        matrix = to_float32_matrix(vectors, self.dimension)
        if len(ids) != matrix.shape[0]:
            raise ValueError("ID count must equal vector count")
        if set(ids) & self.existing_ids():
            raise ValueError("An ID already exists in the index")
        self._index.add_with_ids(matrix, np.asarray(ids, dtype=np.int64))
        return len(ids)

    def search(self, vector, top_k: int = 5) -> list[tuple[int, float]]:
        if isinstance(top_k, bool) or not isinstance(top_k, int) or top_k < 1:
            raise ValueError("top_k must be a positive integer")
        query = to_float32_matrix([vector] if np.asarray(vector).ndim == 1 else vector, self.dimension)
        if self.count == 0:
            return []
        similarities, ids = self._index.search(query, min(top_k, self.count))
        return [
            (int(found_id), float(score))
            for found_id, score in zip(ids[0], similarities[0])
            if found_id != -1
        ]

    def remove(self, ids: list[int]) -> int:
        if not ids:
            return 0
        if any(isinstance(value, bool) or not isinstance(value, int) for value in ids):
            raise TypeError("IDs must be integers")
        found = sorted(set(ids) & self.existing_ids())
        if found:
            selector = faiss.IDSelectorBatch(
                len(found), faiss.swig_ptr(np.asarray(found, dtype=np.int64))
            )
            self._index.remove_ids(selector)
        return len(found)

    def save(self, path: str | Path | None = None) -> Path:
        destination = Path(path) if path is not None else self.index_path
        if destination is None:
            raise ValueError("An index path is required")
        destination = destination.expanduser().resolve()
        destination.parent.mkdir(parents=True, exist_ok=True)
        fd, temp_name = tempfile.mkstemp(dir=str(destination.parent), suffix=".tmp")
        os.close(fd)
        try:
            faiss.write_index(self._index, temp_name)
            os.replace(temp_name, destination)
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)
        self.index_path = destination
        return destination

    def load(self, path: str | Path | None = None) -> None:
        source = Path(path) if path is not None else self.index_path
        if source is None:
            raise ValueError("An index path is required")
        source = source.expanduser().resolve()
        if not source.is_file():
            raise FileNotFoundError(source)
        loaded = faiss.read_index(str(source))
        if loaded.d != self.dimension:
            raise ValueError("Loaded index dimension does not match")
        if not isinstance(loaded, faiss.IndexIDMap2):
            raise ValueError("Expected an IndexIDMap2 index")
        self._index = loaded
        self.index_path = source
