from ..constants import DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE
from ..utils import chunk_text


class DocumentManager:
    def __init__(self, processor=None):
        from ..documents.processor import DocumentProcessor
        self.processor = processor or DocumentProcessor()

    def prepare(
        self,
        file_path: str,
        document_id: str,
        collection_id: str = "default",
        chunk_size: int = DEFAULT_CHUNK_SIZE,
        overlap: int = DEFAULT_CHUNK_OVERLAP,
    ) -> tuple[dict, list[dict]]:
        text, metadata = self.processor.process(file_path)
        pieces = chunk_text(text, chunk_size, overlap)
        if not pieces:
            raise ValueError("Document produced no chunks.")

        from pathlib import Path
        filename = Path(file_path).name
        record = {
            "document_id": document_id,
            "filename": filename,
            "collection_id": collection_id,
            "chunk_count": len(pieces),
            "status": "indexed",
            "metadata": metadata,
        }
        chunks = [{
            "chunk_id": f"{document_id}_{index}",
            "document_id": document_id,
            "collection_id": collection_id,
            "filename": filename,
            "chunk_index": index,
            "text": piece,
        } for index, piece in enumerate(pieces)]
        return record, chunks
