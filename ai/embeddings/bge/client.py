"""Convenience client for BGE query and document embeddings."""

from .models import DEFAULT_BGE_MODEL, BGEModelInfo
from .provider import BGEProvider
from .utils import prepare_passages


class BGEEmbeddingClient:
    """Client interface for BGE retrieval embeddings."""

    def __init__(self, model_name=DEFAULT_BGE_MODEL, **provider_options):
        self.provider = BGEProvider(
            model_name=model_name,
            **provider_options,
        )

    @property
    def model_name(self):
        return self.provider.model_name

    @property
    def is_loaded(self):
        return self.provider.is_loaded

    def embed_query(self, text):
        return self.provider.embed_query(text)

    def embed_queries(self, texts):
        return self.provider.embed_queries(texts)

    def embed_documents(self, documents):
        passages = prepare_passages(documents)
        return self.provider.embed(passages)

    def get_model_info(self):
        return BGEModelInfo(name=self.model_name)

    def close(self):
        self.provider.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.close()
        return False

