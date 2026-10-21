from __future__ import annotations


def validate_query(query: str) -> str:
    if not isinstance(query, str):
        raise TypeError("query must be a string")
    query = query.strip()
    if not query:
        raise ValueError("query must not be empty")
    return query


def validate_context(context: str) -> str:
    if not isinstance(context, str):
        raise TypeError("context must be a string")
    return context.strip()


def normalize_answer(answer: str) -> str:
    if not isinstance(answer, str):
        raise TypeError("Generated answer must be a string")
    return answer.strip()


def build_prompt(query: str, context: str) -> str:
    query = validate_query(query)
    context = validate_context(context)

    return (
        "Answer the question using the supplied context. "
        "If the context does not contain enough information, say so. "
        "Do not invent facts.\n\n"
        f"Context:\n{context}\n\n"
        f"Question:\n{query}\n\n"
        "Answer:"
    )
