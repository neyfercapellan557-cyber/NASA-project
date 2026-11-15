
import re

from app.services.vector_store import get_collection


def is_low_quality_fragment(text: str) -> bool:
    """Detecta fragmentos vacíos, índices y bibliografía."""

    normalized = text.lower().strip()

    if not normalized or len(normalized) < 80:
        return True

    lines = [
        line.strip()
        for line in normalized.splitlines()
        if line.strip()
    ]

    if not lines:
        return True

    # Encabezados típicos de bibliografía.
    bibliography_headers = [
        "references",
        "bibliography",
        "references cited",
        "literature cited",
        "works cited",
        "referencias bibliográficas",
        "lista de referencias",
    ]

    if any(
        re.match(rf"^{re.escape(header)}\s*:?\s*$", line)
        for header in bibliography_headers
        for line in lines
    ):
        return True

    # Identificar líneas que parecen referencias bibliográficas.
    reference_patterns = [
        r"^\s*\[\d+\]",
        r"\bet al\.",
        r"\bdoi\s*:",
        r"https?://",
        r"\bvol\.\s*\d+",
        r"\bpp?\.\s*\d+",
    ]

    reference_lines = sum(
        1
        for line in lines
        if any(re.search(pattern, line) for pattern in reference_patterns)
    )

    # Descartar fragmentos dominados por referencias.
    if len(lines) >= 3:
        if reference_lines / len(lines) > 0.5:
            return True

    # Detectar listas largas de referencias numeradas.
    numbered_lines = sum(
        1
        for line in lines
        if re.match(r"^\s*\d+[\.\)]\s+\S", line)
    )

    if len(lines) >= 4 and numbered_lines / len(lines) > 0.5:
        return True

    return False


def search_documents(question: str, n_results: int = 4):
    """Recupera evidencia científica relevante de ChromaDB."""

    if not question.strip():
        raise ValueError("La pregunta no puede estar vacía.")

    collection = get_collection()
    total_documents = collection.count()

    if total_documents == 0:
        return []

    candidate_count = min(30, total_documents)

    results = collection.query(
        query_texts=[question],
        n_results=candidate_count,
        include=["documents", "metadatas", "distances"]
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    matches = []
    seen_pages = set()

    for document, metadata, distance in zip(
        documents, metadatas, distances
    ):
        if is_low_quality_fragment(document):
            continue

        source = metadata.get("source", "Fuente desconocida")
        page = metadata.get("page", -1)

        page_key = (source, page)

        if page_key in seen_pages:
            continue

        seen_pages.add(page_key)

        matches.append({
            "text": document,
            "source": source,
            "page": page,
            "distance": distance
        })

        if len(matches) >= n_results:
            break

    return matches
