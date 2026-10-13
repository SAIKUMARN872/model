class IndexingManager:
    def __init__(self, indexer):
        self.indexer = indexer

    def index(self, chunks: list[dict]) -> None:
        self.indexer.add_chunks(chunks)

    def search(self, question: str, collection_id="default", top_k=5):
        return self.indexer.search(question, collection_id, top_k)

    def delete_document(self, collection_id: str, document_id: str) -> None:
        self.indexer.delete_document(collection_id, document_id)
