"""RAG answer and retrieval benchmarks for ModelNow."""
from ai.evaluation.benchmarks.benchmark import benchmark_cases
from ai.evaluation.benchmarks.utils import validate_document_list
from ai.evaluation.models import EvaluationCase


def evaluate_retrieval(retrieved_documents, relevant_documents):
    """Calculate precision, recall, and reciprocal rank using document IDs."""
    retrieved = validate_document_list(retrieved_documents, "retrieved_documents")
    relevant = validate_document_list(relevant_documents, "relevant_documents")

    if len(set(retrieved)) != len(retrieved):
        raise ValueError("retrieved_documents must not contain duplicate IDs")
    if len(set(relevant)) != len(relevant):
        raise ValueError("relevant_documents must not contain duplicate IDs")
    if not relevant:
        raise ValueError("relevant_documents must contain at least one document ID")

    relevant_set = set(relevant)
    hits = sum(1 for document in retrieved if document in relevant_set)
    reciprocal_rank = 0.0
    for rank, document in enumerate(retrieved, start=1):
        if document in relevant_set:
            reciprocal_rank = 1.0 / rank
            break

    return {
        "retrieved_count": len(retrieved),
        "relevant_count": len(relevant),
        "relevant_hits": hits,
        "precision_at_k": hits / len(retrieved) if retrieved else 0.0,
        "recall_at_k": hits / len(relevant),
        "reciprocal_rank": reciprocal_rank,
    }


def benchmark_rag(cases, duration_seconds=None):
    """Benchmark RAG answers and optional retrieval IDs stored in case metadata.

    Optional metadata keys:
      retrieved_documents: list of retrieved document IDs
      relevant_documents: list of relevant document IDs

    Answer metrics require reference_answer. Retrieval metrics require both
    metadata fields; these measurements are kept separate.
    """
    if isinstance(cases, (str, bytes)) or not isinstance(cases, (list, tuple)):
        raise ValueError("cases must be a list or tuple of EvaluationCase objects")
    if not cases:
        raise ValueError("at least one RAG benchmark case is required")
    if any(not isinstance(case, EvaluationCase) for case in cases):
        raise ValueError("all cases must be EvaluationCase objects")

    answer_results = benchmark_cases(cases, duration_seconds=duration_seconds)
    retrieval_results = []
    for case in cases:
        metadata = case.metadata
        has_retrieved = "retrieved_documents" in metadata
        has_relevant = "relevant_documents" in metadata
        if has_retrieved != has_relevant:
            raise ValueError(
                f"case {case.case_id!r} must provide both retrieved_documents "
                "and relevant_documents"
            )
        if has_retrieved:
            retrieval_results.append(
                evaluate_retrieval(
                    metadata["retrieved_documents"],
                    metadata["relevant_documents"],
                )
            )

    retrieval_summary = None
    if retrieval_results:
        count = len(retrieval_results)
        retrieval_summary = {
            "retrieval_case_count": count,
            "mean_precision_at_k": sum(x["precision_at_k"] for x in retrieval_results) / count,
            "mean_recall_at_k": sum(x["recall_at_k"] for x in retrieval_results) / count,
            "mean_reciprocal_rank": sum(x["reciprocal_rank"] for x in retrieval_results) / count,
            "per_case": retrieval_results,
        }

    return {
        "benchmark": "rag",
        "case_count": len(cases),
        "answer_metrics": answer_results["metrics"],
        "models": answer_results["models"],
        "retrieval_metrics": retrieval_summary,
    }
