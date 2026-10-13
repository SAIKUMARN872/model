from dataclasses import asdict
from ..models import DocumentRecord


class Document:
    def __init__(self, record: DocumentRecord):
        self.record = record

    def to_dict(self) -> dict:
        return asdict(self.record)
