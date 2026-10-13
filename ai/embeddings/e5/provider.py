import threading

from .models import (
    DEFAULT_BATCH_SIZE,
    DEFAULT_MAX_SEQUENCE_LENGTH,
    DEFAULT_MODEL,
    DEFAULT_NORMALIZE,
    E5ModelConfig,
    E5ModelInfo,
    MODEL_DIMENSIONS,
)
from .utils import prepare_passages, prepare_queries, validate_embeddings


class E5EmbeddingProvider:
    """Lazy-loaded E5 sentence-transformer provider."""

    def __init__(
        self,
        model_name=DEFAULT_MODEL,
        *,
        batch_size=DEFAULT_BATCH_SIZE,
        normalize_embeddings=DEFAULT_NORMALIZE,
        device=None,
        max_sequence_length=DEFAULT_MAX_SEQUENCE_LENGTH,
        trust_remote_code=False,
        model=None,
    ):
        self.config = E5ModelConfig(
            model_name=model_name,
            batch_size=batch_size,
            normalize_embeddings=normalize_embeddings,
            device=device,
            max_sequence_length=max_sequence_length,
            trust_remote_code=trust_remote_code,
        )
        self._model = model
        self._lock = threading.RLock()
        self._closed = False
        self._dimension = MODEL_DIMENSIONS.get(model_name)

        if model is not None:
            self._configure_model()

    def _configure_model(self):
        dimension = self._model.get_sentence_embedding_dimension()
        if dimension is not None:
            self._dimension = int(dimension)
        if hasattr(self._model, "max_seq_length"):
            self._model.max_seq_length = self.config.max_sequence_length

    def _ensure_model(self):
        with self._lock:
            if self._closed:
                raise RuntimeError("E5 provider is closed.")
            if self._model is None:
                try:
                    from sentence_transformers import SentenceTransformer
                except ImportError as exc:
                    raise ImportError(
                        "Install sentence-transformers: "
                        "python -m pip install sentence-transformers"
                    ) from exc

                kwargs = {"trust_remote_code": self.config.trust_remote_code}
                if self.config.device is not None:
                    kwargs["device"] = self.config.device

                self._model = SentenceTransformer(self.config.model_name, **kwargs)
                self._configure_model()
            return self._model

    @property
    def model_name(self):
        return self.config.model_name

    @property
    def dimension(self):
        return self._dimension

    def embed_passages(self, texts):
        return self._encode(prepare_passages(texts))

    def embed_queries(self, texts):
        return self._encode(prepare_queries(texts))

    def embed_query(self, text):
        return self.embed_queries([text])[0]

    def embed(self, texts):
        return self.embed_passages(texts)

    def embed_texts(self, texts):
        return self.embed_passages(texts)

    def _encode(self, texts):
        if not texts:
            return []

        model = self._ensure_model()
        with self._lock:
            try:
                output = model.encode(
                    texts,
                    batch_size=self.config.batch_size,
                    show_progress_bar=False,
                    convert_to_numpy=True,
                    normalize_embeddings=self.config.normalize_embeddings,
                )
            except Exception as exc:
                raise RuntimeError(
                    f"E5 inference failed for {self.config.model_name}."
                ) from exc

        vectors = validate_embeddings(
            output, len(texts), expected_dimension=self.dimension
        )

        if self.config.normalize_embeddings:
            for vector in vectors:
                norm = sum(value * value for value in vector) ** 0.5
                if norm == 0:
                    raise ValueError("Cannot normalize a zero embedding.")
                vector[:] = [value / norm for value in vector]

        return vectors

    def get_model_info(self):
        return E5ModelInfo(
            model_name=self.config.model_name,
            dimension=self.dimension,
            batch_size=self.config.batch_size,
            max_sequence_length=self.config.max_sequence_length,
            normalized=self.config.normalize_embeddings,
            device=self.config.device,
            loaded=self._model is not None,
        )

    def close(self):
        with self._lock:
            self._model = None
            self._closed = True

    def __enter__(self):
        if self._closed:
            raise RuntimeError("E5 provider is closed.")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.close()
        return False
