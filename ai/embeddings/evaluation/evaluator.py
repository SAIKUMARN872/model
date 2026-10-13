"""Evaluate embedding quality on labeled similarity pairs and retrieval tasks."""

from .metrics import (
    cosine_similarity, mean_absolute_error, root_mean_squared_error,
    pearson_correlation, precision_at_k, recall_at_k, reciprocal_rank,
    ndcg_at_k,
)
from .utils import validate_similarity_pairs, validate_vectors, validate_texts


class EmbeddingEvaluator:
    """Evaluate embeddings produced by a callable or provider object.

    A provider may implement embed_texts(texts) or embed(texts).
    """

    def __init__(self, provider):
        if provider is None:
            raise ValueError("provider is required.")
        self.provider = provider

    def _embed(self, texts):
        texts = validate_texts(texts)
        if callable(self.provider):
            vectors = self.provider(texts)
        elif callable(getattr(self.provider, "embed_texts", None)):
            vectors = self.provider.embed_texts(texts)
        elif callable(getattr(self.provider, "embed", None)):
            vectors = self.provider.embed(texts)
        else:
            raise TypeError("Provider must be callable or implement embed_texts/embed.")
        return validate_vectors(vectors, "provider embeddings")

    def evaluate_similarity(self, pairs):
        pairs = validate_similarity_pairs(pairs)
        texts = []
        for pair in pairs:
            texts.extend((pair["left"], pair["right"]))
        vectors = self._embed(texts)
        predicted = [
            cosine_similarity(vectors[i], vectors[i + 1])
            for i in range(0, len(vectors), 2)
        ]
        actual = [pair["score"] for pair in pairs]
        result = {
            "pairs_evaluated": len(pairs),
            "mean_absolute_error": mean_absolute_error(actual, predicted),
            "root_mean_squared_error": root_mean_squared_error(actual, predicted),
            "predicted_cosine_similarities": predicted,
            "reference_scores": actual,
        }
        if len(actual) >= 2:
            try:
                result["pearson_correlation"] = pearson_correlation(actual, predicted)
            except ValueError:
                result["pearson_correlation"] = None
        else:
            result["pearson_correlation"] = None
        return result

    def evaluate_retrieval(self, query_text, documents, relevant_document_ids, ks=(1, 3, 5)):
        if not isinstance(query_text, str) or not query_text.strip():
            raise ValueError("query_text must be non-empty.")
        documents = validate_texts(documents)
        if len(documents) != len(relevant_document_ids):
            raise ValueError("documents and relevant_document_ids must have equal length.")
        if not relevant_document_ids:
            raise ValueError("At least one document is required.")
        if len(set(relevant_document_ids)) != len(relevant_document_ids):
            raise ValueError("Document IDs must be unique.")
        if not relevant_document_ids:
            raise ValueError("At least one document ID is required.")
        if not set(relevant_document_ids).intersection(set(relevant_document_ids)):
            raise ValueError("At least one relevant ID is required.")
        if not ks or any(isinstance(k, bool) or not isinstance(k, int) or k < 1 for k in ks):
            raise ValueError("ks must contain positive integers.")

        vectors = self._embed([query_text] + documents)
        query_vector, doc_vectors = vectors[0], vectors[1:]
        scored = [
            (doc_id, cosine_similarity(query_vector, vector))
            for doc_id, vector in zip(relevant_document_ids, doc_vectors)
        ]
        ranked_ids = [doc_id for doc_id, _ in sorted(scored, key=lambda item: item[1], reverse=True)]
        relevant = set(relevant_document_ids)  # All IDs are relevant by default.
        result = {
            "ranked_document_ids": ranked_ids,
            "ranked_scores": sorted((score for _, score in scored), reverse=True),
            "metrics": {},
        }
        for k in ks:
            result["metrics"][f"precision@{k}"] = precision_at_k(ranked_ids, relevant, k)
            result["metrics"][f"recall@{k}"] = recall_at_k(ranked_ids, relevant, k)
            result["metrics"][f"ndcg@{k}"] = ndcg_at_k(
                [1.0 if doc_id in relevant else 0.0 for doc_id in ranked_ids], k
            )
        result["metrics"]["mrr"] = reciprocal_rank(ranked_ids, relevant)
        return result
