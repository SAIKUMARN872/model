from copy import deepcopy
from threading import RLock


class MetadataManager:
    def __init__(self):
        self._records = {}
        self._lock = RLock()

    def put(self, document_id: str, metadata: dict) -> dict:
        if not document_id:
            raise ValueError("document_id is required")
        if not isinstance(metadata, dict):
            raise ValueError("metadata must be a dictionary")
        with self._lock:
            self._records[document_id] = deepcopy(metadata)
            return deepcopy(self._records[document_id])

    def get(self, document_id: str) -> dict | None:
        with self._lock:
            value = self._records.get(document_id)
            return deepcopy(value) if value is not None else None

    def delete(self, document_id: str) -> bool:
        with self._lock:
            return self._records.pop(document_id, None) is not None
