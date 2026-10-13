from dataclasses import dataclass, field
from typing import Any


@dataclass
class DocumentInput:
    file_path: str
    collection_id: str = "default"
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class DocumentRecord:
    document_id: str
    filename: str
    collection_id: str
    chunk_count: int
    status: str = "indexed"
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class KnowledgeChunk:
    chunk_id: str
    document_id: str
    collection_id: str
    text: str
    chunk_index: int
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class SearchResult:
    text: str
    document_id: str
    filename: str
    chunk_id: str
    score: float
    metadata: dict[str, Any] = field(default_factory=dict)
