from __future__ import annotations

import asyncio
import json
import re
import time
from urllib.request import Request, urlopen

from ai.rag.engine import RAGEngine
from ai.rag.generator.generator import RAGGenerator
from ai.rag.models import RAGDocument
from ai.rag.retriever.sentence_transformer_store import (
    SentenceTransformerVectorStore,
)
from ai.rag.retriever.vector_retriever import VectorRetriever


OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "qwen3:1.7b"
EXPECTED_CODE = "MODELNOW-742"


def call_ollama(query: str, context: str) -> str:
    """Generate a real answer using the locally running Ollama model."""

    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "think": False,
        "options": {
            "temperature": 0,
            "num_predict": 160,
        },
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are ModelNow's RAG assistant. "
                    "Answer using only the supplied context. "
                    "Do not invent facts. If the answer is absent, "
                    "say that the provided context does not contain it. "
                    "Give a concise answer and include exact identifiers "
                    "when the context provides them."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Context:\n{context}\n\n"
                    f"Question:\n{query}\n\n"
                    "Answer using the context above."
                ),
            },
        ],
    }

    request = Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urlopen(request, timeout=180) as response:
        result = json.loads(response.read().decode("utf-8"))

    answer = result.get("message", {}).get("content", "").strip()

    # Remove a thinking block if a model/API configuration emits one.
    answer = re.sub(
        r"<think>.*?</think>",
        "",
        answer,
        flags=re.DOTALL,
    ).strip()

    if not answer:
        raise RuntimeError("Ollama returned an empty answer.")

    return answer


async def generate_answer(query, context, sources) -> str:
    """Adapt Ollama inference to ModelNow's RAGGenerator interface."""
    return await asyncio.to_thread(call_ollama, query, context)


async def main() -> None:
    print("=" * 72)
    print("MODELNOW REAL OPEN-SOURCE RAG END-TO-END TEST")
    print("=" * 72)

    store = SentenceTransformerVectorStore(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    retriever = VectorRetriever(store)

    documents = [
        RAGDocument(
            document_id="launch-facts",
            text=(
                "ModelNow's test deployment launch code is MODELNOW-742. "
                "The project focuses on optimizing AI inference cost, "
                "latency, and answer quality."
            ),
            metadata={"category": "project", "source": "test-document-1"},
        ),
        RAGDocument(
            document_id="rag-facts",
            text=(
                "Retrieval-augmented generation retrieves relevant "
                "documents and supplies their text as context to a "
                "language model before it generates an answer."
            ),
            metadata={"category": "technology", "source": "test-document-2"},
        ),
        RAGDocument(
            document_id="cooking-facts",
            text=(
                "Chocolate cake is commonly prepared using cocoa, "
                "flour, sugar, butter, and eggs."
            ),
            metadata={"category": "cooking", "source": "test-document-3"},
        ),
    ]

    print("\n[1] ADDING REAL TEST DOCUMENTS")
    retriever.add_documents(documents)
    print("Documents indexed:", len(documents))

    print("\n[2] INITIALIZING RAG GENERATOR")
    generator = RAGGenerator(generate_fn=generate_answer)
    engine = RAGEngine(
        retriever=retriever,
        generator=generator,
    )
    print("RAG engine initialized.")

    question = "What is ModelNow's test deployment launch code?"

    print("\n[3] REAL SEMANTIC RETRIEVAL")
    print("Question:", question)
    start = time.perf_counter()

    response = await engine.query(
        question,
        top_k=3,
        rerank_top_n=None,
    )

    retrieval_and_generation_seconds = time.perf_counter() - start

    print("\nRetrieved sources:")
    for source in response.sources:
        print(
            f"- ID={source.document.document_id}"
            f" | score={source.score:.4f}"
            f" | text={source.document.text}"
        )

    source_ids = {source.document.document_id for source in response.sources}

    if "launch-facts" not in source_ids:
        raise AssertionError(
            "The expected launch-facts document was not retrieved."
        )

    print("PASS: Relevant source retrieved using real embeddings.")

    print("\n[4] REAL LOCAL SLM ANSWER")
    print("Model:", OLLAMA_MODEL)
    print("Answer:", response.answer)

    if not response.answer:
        raise AssertionError("RAG returned no generated answer.")

    if EXPECTED_CODE.lower() not in response.answer.lower():
        raise AssertionError(
            f"Expected launch code {EXPECTED_CODE!r} in the answer. "
            f"Actual answer: {response.answer!r}"
        )

    print("PASS: Generated answer contains the expected fact.")

    print("\n[5] SOURCE AND PIPELINE DETAILS")
    print("Retrieved source count:", len(response.sources))
    print("Context characters:", len(response.context))
    print(
        "Retrieval + generation elapsed seconds:",
        round(retrieval_and_generation_seconds, 2),
    )
    print("RAG metadata:", response.metadata)

    print("\n" + "=" * 72)
    print("REAL OPEN-SOURCE RAG END-TO-END TEST: PASS")
    print("=" * 72)


if __name__ == "__main__":
    asyncio.run(main())