
from services.vector_store import get_collection


def search_documents(question: str, n_results: int = 4):
    """Busca fragmentos científicos relevantes en ChromaDB."""

    if not question.strip():
        raise ValueError("La pregunta no puede estar vacía.")

    collection = get_collection()

    total_documents = collection.count()

    if total_documents == 0:
        return []

    results = collection.query(
        query_texts=[question],
        n_results=min(n_results, total_documents)
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]

    matches = []

    for document, metadata in zip(documents, metadatas):
        matches.append({
            "text": document,
            "source": metadata["source"],
            "page": metadata["page"]
        })

    return matches 