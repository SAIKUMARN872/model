from .models import DEFAULT_MODEL
from .provider import E5EmbeddingProvider


class E5EmbeddingClient:
    """Convenience client for E5 query and document embeddings."""

    def __init__(self, model_name=DEFAULT_MODEL, **provider_options):
        self.provider = E5EmbeddingProvider(
            model_name=model_name, **provider_options
        )

    def embed_query(self, text):
        return self.provider.embed_query(text)

    def embed_queries(self, texts):
        return self.provider.embed_queries(texts)

    def embed_documents(self, documents):
        return self.provider.embed_passages(documents)

    def get_model_info(self):
        return self.provider.get_model_info()

    def close(self):
        self.provider.close()

    def __enter__(self):
        self.provider.__enter__()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return self.provider.__exit__(exc_type, exc_value, traceback)
