from __future__ import annotations

import asyncio
import json
import re
import time
from urllib.request import Request, urlopen

from ai.rag.engine import RAGEngine
from ai.rag.generator.generator import RAGGenerator
from ai.rag.models import RAGDocument
from ai.rag.retriever.sentence_transformer_store import SentenceTransformerVectorStore
from ai.rag.retriever.vector_retriever import VectorRetriever

OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "qwen3:1.7b"


def call_ollama(query: str, context: str) -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "think": False,
        "options": {"temperature": 0, "num_predict": 160},
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are ModelNow's RAG assistant. Answer only from the "
                    "supplied context. Never invent facts. If the context "
                    "does not contain the answer, explicitly say that the "
                    "provided context does not contain that information."
                ),
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion:\n{query}",
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
    answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL).strip()

    if not answer:
        raise RuntimeError("Ollama returned an empty answer.")

    return answer


async def generate_answer(query, context, sources) -> str:
    return await asyncio.to_thread(call_ollama, query, context)


async def main() -> None:
    print("=" * 65)
    print("MODELNOW RAG RELIABILITY TEST")
    print("=" * 65)

    store = SentenceTransformerVectorStore(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    retriever = VectorRetriever(store)

    documents = [
        RAGDocument(
            document_id="launch-facts",
            text=(
                "ModelNow's test deployment launch code is MODELNOW-742. "
                "ModelNow focuses on optimizing AI inference cost, latency, "
                "and answer quality."
            ),
            metadata={"category": "project"},
        ),
        RAGDocument(
            document_id="rag-facts",
            text=(
                "Retrieval-augmented generation retrieves relevant documents "
                "and supplies their text as context to a language model "
                "before it generates an answer."
            ),
            metadata={"category": "technology"},
        ),
        RAGDocument(
            document_id="cooking-facts",
            text=(
                "Chocolate cake is commonly prepared using cocoa, flour, "
                "sugar, butter, and eggs."
            ),
            metadata={"category": "cooking"},
        ),
    ]

    retriever.add_documents(documents)
    engine = RAGEngine(
        retriever=retriever,
        generator=RAGGenerator(generate_fn=generate_answer),
    )

    print("\n[TEST 1] Exact fact")
    question = "What is ModelNow's test deployment launch code?"
    start = time.perf_counter()
    response = await engine.query(question, top_k=3, rerank_top_n=None)
    print("Answer:", response.answer)
    print("Elapsed seconds:", round(time.perf_counter() - start, 2))

    if "MODELNOW-742" not in (response.answer or "").upper():
        raise AssertionError("TEST 1 FAILED: launch code missing.")

    if not any(
        source.document.document_id == "launch-facts"
        for source in response.sources
    ):
        raise AssertionError("TEST 1 FAILED: supporting source not retrieved.")

    print("TEST 1 PASS")

    print("\n[TEST 2] Multiple facts")
    question = "What three things does ModelNow aim to optimize?"
    response = await engine.query(question, top_k=3, rerank_top_n=None)
    answer = (response.answer or "").lower()
    print("Answer:", response.answer)

    missing = [
        term for term in ("cost", "latency", "quality")
        if term not in answer
    ]
    if missing:
        raise AssertionError(
            "TEST 2 FAILED: missing concepts: " + ", ".join(missing)
        )

    print("TEST 2 PASS")

    print("\n[TEST 3] Unsupported question")
    question = "What is ModelNow's production administrator password?"
    response = await engine.query(
        question,
        top_k=3,
        rerank_top_n=None,
        min_score=0.50,
    )

    print("Sources remaining after threshold:", len(response.sources))
    for source in response.sources:
        print(
            "Source:", source.document.document_id,
            "| score:", round(source.score, 4),
        )

    if response.sources:
        print("Answer:", response.answer)
        raise AssertionError(
            "TEST 3 INCONCLUSIVE: documents passed the threshold. "
            "Inspect relevance scores before evaluating abstention."
        )

    print("TEST 3 PASS: no sources passed the relevance threshold.")
    print("\nMODELNOW RAG RELIABILITY TESTS: PASS")


if __name__ == "__main__":
    asyncio.run(main())

