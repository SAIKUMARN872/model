from __future__ import annotations

from collections.abc import Sequence

from ai.rag.models import RetrievedDocument
from ai.rag.hybrid_search.utils import validate_top_k


def reciprocal_rank_fusion(
    result_lists: Sequence[Sequence[RetrievedDocument]],
    *,
    top_k: int | None = None,
    rank_constant: int = 60,
) -> list[RetrievedDocument]:
    """Fuse ranked retrieval lists using Reciprocal Rank Fusion.

    Duplicate document IDs across retrievers are combined into one result.
    The first occurrence supplies the document and stable tie-breaking order.
    """
    if isinstance(rank_constant, bool) or not isinstance(rank_constant, int):
        raise TypeError("rank_constant must be an integer.")
    if rank_constant < 1:
        raise ValueError("rank_constant must be at least 1.")

    if top_k is not None:
        validate_top_k(top_k)

    fused_scores: dict[str, float] = {}
    documents: dict[str, RetrievedDocument] = {}
    first_seen: dict[str, int] = {}
    encounter_order = 0

    for results in result_lists:
        if isinstance(results, (str, bytes)):
            raise TypeError("Each result list must contain RetrievedDocument items.")

        seen_in_list: set[str] = set()

        for rank, result in enumerate(results, start=1):
            if not isinstance(result, RetrievedDocument):
                raise TypeError("Fusion inputs must be RetrievedDocument items.")

            document_id = result.document.document_id

            if document_id in seen_in_list:
                raise ValueError(
                    f"Duplicate document ID within one result list: {document_id}"
                )
            seen_in_list.add(document_id)

            if document_id not in documents:
                documents[document_id] = result
                first_seen[document_id] = encounter_order
                encounter_order += 1
                fused_scores[document_id] = 0.0

            fused_scores[document_id] += 1.0 / (rank_constant + rank)

    ordered_ids = sorted(
        fused_scores,
        key=lambda document_id: (
            -fused_scores[document_id],
            first_seen[document_id],
        ),
    )

    if top_k is not None:
        ordered_ids = ordered_ids[:top_k]

    return [
        RetrievedDocument(
            document=documents[document_id].document,
            score=fused_scores[document_id],
            rank=rank,
        )
        for rank, document_id in enumerate(ordered_ids, start=1)
    ]


__all__ = ["reciprocal_rank_fusion"]
