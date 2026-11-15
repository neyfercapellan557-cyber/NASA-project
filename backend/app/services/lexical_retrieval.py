
from pathlib import Path
from rank_bm25 import BM25Okapi

from services.vector_store import get_collection


def tokenize(text: str) -> list[str]:
    """Divide el texto en términos para la búsqueda léxica."""
    return text.lower().split()


def search_lexical(question: str, n_results: int = 4):
    """Busca fragmentos mediante BM25."""

    if not question.strip():
        raise ValueError("La pregunta no puede estar vacía.")

    collection = get_collection()

    # Recuperar todos los fragmentos almacenados
    data = collection.get(
        include=["documents", "metadatas"]
    )

    documents = data["documents"]
    metadatas = data["metadatas"]

    if not documents:
        return []

    # Preparar los documentos para BM25
    tokenized_documents = [
        tokenize(document) for document in documents
    ]

    bm25 = BM25Okapi(tokenized_documents)

    # Buscar coincidencias léxicas
    tokenized_question = tokenize(question)
    scores = bm25.get_scores(tokenized_question)

    # Ordenar resultados por puntuación
    ranked_indices = sorted(
        range(len(scores)),
        key=lambda i: scores[i],
        reverse=True
    )

    results = []

    for index in ranked_indices[:n_results]:
        if scores[index] <= 0:
            continue

        results.append({
            "text": documents[index],
            "source": metadatas[index]["source"],
            "page": metadatas[index]["page"],
            "score": float(scores[index])
        })

    return results
