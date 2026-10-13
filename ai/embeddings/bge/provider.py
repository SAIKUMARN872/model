import math
import threading
from collections.abc import Sequence

from ai.embeddings.exceptions import (
    EmbeddingProviderError,
    EmbeddingValidationError,
)
from ai.embeddings.schemas import validate_texts
from .models import (
    DEFAULT_BGE_MODEL,
    DEFAULT_BGE_BATCH_SIZE,
    DEFAULT_BGE_MAX_SEQUENCE_LENGTH,
    BGE_QUERY_INSTRUCTION,
)



def _get_embedding_dimension(model):
    """Read the embedding dimension across Sentence Transformers versions."""
    getter = getattr(model, "get_embedding_dimension", None)
    if getter is None:
        getter = getattr(model, "get_sentence_embedding_dimension", None)
    if getter is None:
        raise EmbeddingProviderError(
            "Sentence Transformers model does not expose its embedding dimension"
        )
    return getter()


class BGEProvider:
    """Thread-safe local BGE inference provider.

    Model loading is lazy. Calling embed() produces document embeddings.
    Calling embed_query() applies the BGE retrieval-query instruction.
    Normalization is deliberately left to EmbeddingEngine by default.
    """

    def __init__(
        self,
        model_name=DEFAULT_BGE_MODEL,
        device=None,
        batch_size=DEFAULT_BGE_BATCH_SIZE,
        max_sequence_length=DEFAULT_BGE_MAX_SEQUENCE_LENGTH,
        trust_remote_code=False,
    ):
        if not isinstance(model_name, str) or not model_name.strip():
            raise ValueError("model_name must be a non-empty string")

        if (
            not isinstance(batch_size, int)
            or isinstance(batch_size, bool)
            or batch_size < 1
        ):
            raise ValueError("batch_size must be a positive integer")

        if (
            not isinstance(max_sequence_length, int)
            or isinstance(max_sequence_length, bool)
            or max_sequence_length < 1
        ):
            raise ValueError("max_sequence_length must be a positive integer")

        if device is not None and (
            not isinstance(device, str) or not device.strip()
        ):
            raise ValueError("device must be None or a non-empty string")

        if not isinstance(trust_remote_code, bool):
            raise ValueError("trust_remote_code must be a boolean")

        self._model_name = model_name.strip()
        self.device = device.strip() if device else None
        self.batch_size = batch_size
        self.max_sequence_length = max_sequence_length
        self.trust_remote_code = trust_remote_code

        self._model = None
        self._model_lock = threading.RLock()

    @property
    def model_name(self):
        return self._model_name

    @property
    def is_loaded(self):
        with self._model_lock:
            return self._model is not None

    def _load_model(self):
        if self._model is not None:
            return self._model

        with self._model_lock:
            if self._model is not None:
                return self._model

            try:
                from sentence_transformers import SentenceTransformer

                kwargs = {
                    "trust_remote_code": self.trust_remote_code,
                }
                if self.device is not None:
                    kwargs["device"] = self.device

                model = SentenceTransformer(self.model_name, **kwargs)
                model.max_seq_length = self.max_sequence_length

                dimension = _get_embedding_dimension(model)
                if (
                    not isinstance(dimension, int)
                    or isinstance(dimension, bool)
                    or dimension <= 0
                ):
                    raise EmbeddingProviderError(
                        "BGE model reported an invalid embedding dimension"
                    )

                self._model = model
                return self._model

            except EmbeddingProviderError:
                raise
            except Exception as exc:
                raise EmbeddingProviderError(
                    f"Unable to initialize BGE model "
                    f"'{self.model_name}': {type(exc).__name__}: {exc}"
                ) from exc

    def _encode(self, texts, prompt=None):
        valid_texts = validate_texts(texts)
        model = self._load_model()

        try:
            kwargs = {
                "batch_size": self.batch_size,
                "show_progress_bar": False,
                "convert_to_numpy": True,
                "normalize_embeddings": False,
            }
            if prompt is not None:
                kwargs["prompt"] = prompt

            encoded = model.encode(valid_texts, **kwargs)

            # Convert NumPy arrays to plain Python lists without requiring
            # NumPy as a direct dependency of this provider.
            if hasattr(encoded, "tolist"):
                encoded = encoded.tolist()

            if not isinstance(encoded, (list, tuple)):
                raise EmbeddingProviderError(
                    "BGE returned an unsupported embedding container"
                )

            if len(encoded) != len(valid_texts):
                raise EmbeddingProviderError(
                    "BGE returned a different number of vectors than inputs"
                )

            vectors = []
            expected_dimension = None

            for index, vector in enumerate(encoded):
                if hasattr(vector, "tolist"):
                    vector = vector.tolist()

                if not isinstance(vector, (list, tuple)) or not vector:
                    raise EmbeddingProviderError(
                        f"BGE returned an invalid vector at index {index}"
                    )

                values = []
                for value in vector:
                    if isinstance(value, bool):
                        raise EmbeddingProviderError(
                            f"BGE returned a boolean value at index {index}"
                        )
                    try:
                        number = float(value)
                    except (TypeError, ValueError, OverflowError) as exc:
                        raise EmbeddingProviderError(
                            f"BGE returned a non-numeric value at index {index}"
                        ) from exc

                    if not math.isfinite(number):
                        raise EmbeddingProviderError(
                            f"BGE returned a non-finite value at index {index}"
                        )
                    values.append(number)

                if expected_dimension is None:
                    expected_dimension = len(values)
                elif len(values) != expected_dimension:
                    raise EmbeddingProviderError(
                        "BGE returned inconsistent vector dimensions"
                    )

                vectors.append(values)

            actual_dimension = _get_embedding_dimension(model)
            if expected_dimension != actual_dimension:
                raise EmbeddingProviderError(
                    f"BGE dimension mismatch: expected {actual_dimension}, "
                    f"received {expected_dimension}"
                )

            return vectors

        except (EmbeddingProviderError, EmbeddingValidationError):
            raise
        except Exception as exc:
            raise EmbeddingProviderError(
                f"BGE inference failed: {type(exc).__name__}: {exc}"
            ) from exc

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        """Encode passages/documents for retrieval indexing."""
        return self._encode(texts)

    def embed_query(self, text: str) -> list[float]:
        """Encode one retrieval query using the BGE v1.5 instruction."""
        valid_texts = validate_texts([text])
        query = BGE_QUERY_INSTRUCTION + valid_texts[0]
        return self._encode([query])[0]

    def embed_queries(self, texts: Sequence[str]) -> list[list[float]]:
        """Encode multiple retrieval queries using the BGE instruction."""
        valid_texts = validate_texts(texts)
        queries = [BGE_QUERY_INSTRUCTION + text for text in valid_texts]
        return self._encode(queries)

    def close(self):
        """Release the provider's model reference.

        Existing callers should stop using this provider before closing it.
        Python and the ML runtime determine when the underlying memory is freed.
        """
        with self._model_lock:
            self._model = None

