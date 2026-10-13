from typing import Protocol, Any


class DocumentProcessor(Protocol):
    def process(self, file_path: str) -> tuple[str, dict[str, Any]]:
        ...


class EmbeddingProvider(Protocol):
    def encode(self, texts: list[str]) -> Any:
        ...


class VectorIndex(Protocol):
    def add(self, chunks: list[dict[str, Any]]) -> None:
        ...

    def search(
        self, query: str, collection_id: str, top_k: int = 5
    ) -> list[dict[str, Any]]:
        ...
