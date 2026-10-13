import hashlib
from pathlib import Path

from ..constants import DEFAULT_TOP_K
from ..management.manager import DocumentManager as DocumentRepository
from ..documents.processor import DocumentProcessor
from ..indexing.indexer import KnowledgeIndexer
from ..collections.manager import CollectionManager
from ..exceptions import CollectionNotFoundError
from ..utils import new_id
from ..schemas import validate_collection_id, validate_question


class KnowledgeService:
    def __init__(self, data_dir=None, indexer=None):
        from ..documents.manager import DocumentManager
        self.repository = DocumentRepository(DocumentProcessor())
        self.documents = DocumentManager(data_dir)
        self.collections = CollectionManager(data_dir)
        self.processor = DocumentProcessor()
        self.indexer = indexer or KnowledgeIndexer(data_dir)

    def list_collections(self):
        return self.collections.list()

    def list_documents(self, collection_id=None):
        return self.documents.list(collection_id)

    def ingest_file(self, file_path: str, collection_id="default") -> dict:
        collection_id = validate_collection_id(collection_id)
        if not self.collections.get(collection_id):
            raise CollectionNotFoundError(
                f"Unknown collection: {collection_id}"
            )

        path = Path(file_path).resolve()
        content_hash = hashlib.sha256(path.read_bytes()).hexdigest()
        existing = next(
            (item for item in self.documents.list(collection_id)
             if item.get("metadata", {}).get("sha256") == content_hash),
            None,
        )
        if existing:
            return existing

        document_id = new_id()
        record, chunks = self.repository.prepare(
            str(path), document_id, collection_id
        )
        record["metadata"]["sha256"] = content_hash

        self.indexer.add_chunks(chunks)
        from ..models import DocumentRecord
        self.documents.save(DocumentRecord(**record))
        return record

    def ask(self, question: str, collection_id="default", top_k=DEFAULT_TOP_K):
        question = validate_question(question)
        collection_id = validate_collection_id(collection_id)
        if not self.collections.get(collection_id):
            raise CollectionNotFoundError(
                f"Unknown collection: {collection_id}"
            )

        matches = self.indexer.search(question, collection_id, top_k)
        if not matches:
            return {
                "answer": "I couldn't find relevant information in this knowledge collection.",
                "sources": [],
                "collection_id": collection_id,
            }

        excerpts = []
        for index, match in enumerate(matches, 1):
            excerpts.append(
                f"[{index}] Source: {match['filename']}\\n{match['text']}"
            )

        answer = (
            "Relevant information found in your documents:\\n\\n"
            + "\\n\\n".join(excerpts)
        )
        return {
            "answer": answer,
            "sources": [{
                "document_id": item["document_id"],
                "filename": item["filename"],
                "chunk_id": item["chunk_id"],
                "score": item["score"],
                "text": item["text"],
            } for item in matches],
            "collection_id": collection_id,
        }

    def delete_document(self, document_id: str) -> bool:
        record = self.documents.get(document_id)
        if not record:
            return False
        self.indexer.delete_document(
            record["collection_id"], document_id
        )
        return self.documents.delete(document_id)



