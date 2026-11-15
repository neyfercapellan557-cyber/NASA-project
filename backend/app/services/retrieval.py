
import re

from app.services.vector_store import get_collection


STOPWORDS = {
    "a", "about", "according", "an", "and", "are", "as", "at", "be", "by",
    "can", "does", "for", "from", "how", "in", "is", "it", "its", "me",
    "guide", "nasa", "of", "on", "or", "report", "show", "that", "the",
    "their",
    "this", "to", "what", "when", "where", "which", "who", "why", "with",
    "you", "your", "del", "el", "en", "es", "la", "las", "lo", "los",
    "para", "por", "que", "segun", "sobre", "un", "una", "y",
    "documents", "documentos", "data", "datos", "papers", "sources",
    "fuentes", "collection", "indexed", "indexados", "indexadas",
    "do", "did", "have", "has", "had", "say", "says", "psi",
    "final", "any", "all", "nnx17af08a", "however", "additionally",
    "therefore",
    "states", "suggests", "also", "observed", "indicates", "indicating",
    "possible", "based", "under", "while", "than", "more", "less",
    "both", "each", "contain", "according",
}


def content_terms(text: str) -> set[str]:
    terms = set()
    for token in re.findall(r"[a-z0-9]+", text.lower()):
        if len(token) <= 2 or token in STOPWORDS or token.isdigit():
            continue
        if token.endswith("ies") and len(token) > 4:
            token = f"{token[:-3]}y"
        elif token.endswith("s") and len(token) > 4 and not token.endswith("ss"):
            token = token[:-1]
        terms.add(token)
    if "microgravity" in terms or "microgravities" in terms:
        terms.add("gravity")
    return terms


def _clean_excerpt(text: str, source: str | None = None) -> str:
    if source != "NNX17AF08A_FinalReport.pdf":
        return text.strip()

    running_header = re.compile(
        r"^\s*(?:UTILIZATION OF THE SAME DATA FOR ADVANCED MODELING AND "
        r"SIMULATION OF SMOKE GENERATION IN|MICROGRAVITY|"
        r"\d+\s+SEAN C\. GARRICK)\s*$",
        re.IGNORECASE,
    )
    return "\n".join(
        line for line in text.splitlines()
        if not running_header.match(line)
    ).strip()


def is_low_quality_fragment(
    text: str,
    page: int | None = None,
    source: str | None = None,
) -> bool:
    """Detecta fragmentos vacíos, índices y bibliografía."""

    normalized = _clean_excerpt(text, source).lower()

    if not normalized or len(normalized) < 80:
        return True

    word_count = len(re.findall(r"\w+", normalized))
    if word_count < 20 and re.search(
        r"national aeronautics and space administration|researcher.{0,2}s guide",
        normalized,
    ):
        return True

    if re.search(
        r"\brecommended citation\b|\btheses and dissertations\b|"
        r"\bsubmitted in partial fulfillment\b|\btable of contents\b",
        normalized,
    ):
        return True

    profile_markers = (
        "contact:",
        "education",
        "research interests",
        "professional affiliation",
        "academic adviser",
        "curriculum vitae",
        "resume",
    )
    if sum(marker in normalized for marker in profile_markers) >= 3:
        return True

    if page == 1 and word_count < 40 and re.search(
        r"\bfinal\s*report\b|\bfinalreport\b|\bgrant\s+[a-z0-9-]+\b",
        normalized,
    ):
        return True

    if word_count < 12:
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

    citation_markers = len(re.findall(
        r"\bet al\.|\bdoi\s*:|https?://|\bvol\.?\s*\d+|\bpp?\.?\s*\d+",
        normalized,
    ))
    publication_years = len(re.findall(r"\b(?:19|20)\d{2}\b", normalized))
    year_lines = sum(
        bool(re.search(r"\b(?:19|20)\d{2}[.;]?\s*$", line))
        for line in lines
    )

    if numbered_lines >= 4:
        return True

    bracketed_references = len(re.findall(r"(?m)^\s*\[\d+\]", normalized))
    if bracketed_references >= 3 or year_lines >= 3:
        return True

    if numbered_lines >= 1 and citation_markers >= 2 and publication_years >= 2:
        return True

    return False


def has_relevant_evidence(question: str, documents: list[dict]) -> bool:
    """Comprueba que la evidencia respalde la mayoría de los términos clave."""

    question_terms = content_terms(question)
    if not question_terms:
        return False

    best_overlap = max(
        (
            len(question_terms & content_terms(document["text"]))
            for document in documents
        ),
        default=0,
    )
    return best_overlap / len(question_terms) >= 0.5


def search_documents(
    question: str,
    n_results: int = 4,
    source_filter: str | None = None,
):
    """Recupera evidencia científica relevante de ChromaDB."""

    if not question.strip():
        raise ValueError("La pregunta no puede estar vacía.")

    collection = get_collection()
    total_documents = collection.count()

    if total_documents == 0:
        return []

    candidate_count = min(30, total_documents)
    question_terms = content_terms(question)

    query_options = {
        "query_texts": [question],
        "n_results": candidate_count,
        "include": ["documents", "metadatas", "distances"],
    }
    if source_filter:
        query_options["where"] = {"source": source_filter}

    results = collection.query(
        **query_options
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    matches = []

    for document, metadata, distance in zip(
        documents, metadatas, distances
    ):
        source = metadata.get("source", "Fuente desconocida")
        page = metadata.get("page", -1)
        excerpt = _clean_excerpt(document, source)
        if is_low_quality_fragment(excerpt, page, source):
            continue

        matches.append({
            "text": excerpt,
            "source": source,
            "page": page,
            "distance": distance,
            "term_overlap": len(question_terms & content_terms(document)),
        })

    matches.sort(
        key=lambda item: (-item["term_overlap"], item["distance"])
    )

    selected = []
    seen_pages = {}
    for match in matches:
        page_key = (match["source"], match["page"])
        if page_key in seen_pages:
            if source_filter:
                selected_match = selected[seen_pages[page_key]]
                if match["text"] not in selected_match["text"]:
                    selected_match["text"] += f'\n{match["text"]}'
            continue
        seen_pages[page_key] = len(selected)
        match.pop("term_overlap")
        selected.append(match)
        if len(selected) >= n_results:
            break

    return selected
