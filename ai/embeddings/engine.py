from ai.embeddings.constants import DEFAULT_NORMALIZE
from ai.embeddings.exceptions import EmbeddingProviderError
from ai.embeddings.models import EmbeddingRequest, EmbeddingResult
from ai.embeddings.schemas import validate_texts
from ai.embeddings.utils import normalize_vector, validate_embedding_batch

class EmbeddingEngine:
    def __init__(self, provider, normalize=DEFAULT_NORMALIZE):
        self.provider = provider
        self.normalize = normalize

    def embed_texts(self, texts, normalize=None):
        valid_texts = validate_texts(texts)
        should_normalize = self.normalize if normalize is None else normalize
        try:
            raw = self.provider.embed(valid_texts)
        except Exception as exc:
            raise EmbeddingProviderError(f"Embedding provider failed: {exc}") from exc
        vectors = validate_embedding_batch(raw, expected_count=len(valid_texts))
        if should_normalize:
            vectors = [normalize_vector(v) for v in vectors]
        return EmbeddingResult(
            embeddings=vectors,
            model=getattr(self.provider, "model_name", "unknown"),
            dimension=len(vectors[0]),
            count=len(vectors),
        )

    def embed_query(self, text, normalize=None):
        return self.embed_texts([text], normalize=normalize).embeddings[0]

    def embed_request(self, request: EmbeddingRequest):
        return self.embed_texts(request.texts, normalize=request.normalize)
