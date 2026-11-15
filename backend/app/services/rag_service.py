
import re

from app.services.retrieval import (
    content_terms,
    has_relevant_evidence,
    search_documents,
)
from app.services.llm_service import generate_response

RESEARCH_TERMS = re.compile(
    r"\b(?:combust\w*|flam\w*|fire\w*|fueg\w*|incend\w*|ignit\w*|ignici\w*|"
    r"microgravity|microgravedad|soot|holl[ií]n|buoyancy|flame\s+spread|"
    r"flame\s+retardant|fire\s+safety|spacecraft|space\s+station|"
    r"estaci[oó]n\s+espacial|gravedad\s+reducida|reduced[\s-]+gravity|"
    r"diffusion\s+flame|fuel\s+droplet|droplet\s+combustion|"
    r"iss|acme|saffire|flex|spice)\b",
    re.IGNORECASE,
)
RESEARCH_DOCUMENT_TERMS = re.compile(
    r"\b(?:according\s+to|based\s+on|what\s+does|what\s+do|what\s+did|"
    r"what\s+is\s+in|which|qu[eé]\s+dice|seg[uú]n)\s+"
    r"(?:the|these|those|this|your|indexed|local|el|la|los|las|tus|"
    r"estos|estas)?\s*(?:final\s+)?"
    r"(?:reports?|papers?|articles?|documents?|studies|sources?|"
    r"datasets?|dissertations?|informes|art[ií]culos|documentos|"
    r"estudios|fuentes|tesis)\b",
    re.IGNORECASE,
)
DATA_REFERENCE_TERMS = re.compile(
    r"\b(?:indexed|local|your|these|those|our|tus|mis|estos|estas)\s+"
    r"(?:scientific\s+)?(?:documents?|papers?|data|sources?|collection|"
    r"documentos|art[ií]culos|datos|fuentes|biblioteca)\b|"
    r"\b(?:documents?|papers?|data|sources?|collection|documentos|"
    r"art[ií]culos|datos|fuentes|biblioteca)\s+(?:you\s+have|are\s+"
    r"indexed|available|in\s+the\s+collection|est[aá]n\s+indexad[oa]s|"
    r"do\s+you\s+have|tienes|hay\s+en\s+la\s+biblioteca)\b|"
    r"\b(?:indexed\s+data|local\s+data|datos\s+indexados|"
    r"documentos\s+indexados|biblioteca\s+local)\b",
    re.IGNORECASE,
)
SOURCE_FILTERS = (
    (
        re.compile(r"\bSAFFIRE[-\s]?I\b", re.IGNORECASE),
        "SAFFIRE-I Operations.pdf",
    ),
    (
        re.compile(r"\bNNX17AF08A\b", re.IGNORECASE),
        "NNX17AF08A_FinalReport.pdf",
    ),
    (
        re.compile(r"\bPSI[-\s]?117\b", re.IGNORECASE),
        "PSI-117_Reports_Dissertation_Combustion Behavior Of "
        "Sub-Millimeter Sized Oxygenated And N-Alka.pdf",
    ),
    (
        re.compile(r"\bPSI[-\s]?159\b", re.IGNORECASE),
        "PSI-159_Reports_FinalRpt_ACME.CFI-G.pdf",
    ),
    (
        re.compile(r"\bS1540748922000414\b", re.IGNORECASE),
        "1-s2.0-S1540748922000414-am.pdf",
    ),
)
SPANISH_TERMS = re.compile(
    r"[¿¡áéíóúñ]|\b(?:hola|gracias|cómo|qué|cuál|dónde|"
    r"puedes|tienes|estás|dime|explica|busco|necesito)\b",
    re.IGNORECASE,
)


def is_research_question(question: str) -> bool:
    """Identifica consultas sobre el tema y la biblioteca de IGNIS."""

    return bool(
        RESEARCH_TERMS.search(question)
        or RESEARCH_DOCUMENT_TERMS.search(question)
        or DATA_REFERENCE_TERMS.search(question)
        or any(pattern.search(question) for pattern, _ in SOURCE_FILTERS)
    )


def _source_filter(question: str) -> str | None:
    for pattern, source in SOURCE_FILTERS:
        if pattern.search(question):
            return source
    return None


def _insufficient_evidence_message(question: str) -> str:
    if SPANISH_TERMS.search(question):
        return (
            "No encontré evidencia suficiente en los documentos indexados "
            "para responder con confianza."
        )
    return (
        "I couldn't find enough evidence in the indexed documents to answer "
        "confidently."
    )


def _extractive_research_answer(
    question: str,
    documents: list[dict],
) -> str | None:
    question_terms = content_terms(question)
    if "microgravity" in question_terms:
        question_terms.discard("gravity")
    if not question_terms:
        return None

    candidates = []
    seen_sentences = set()
    for source_index, document in enumerate(documents, start=1):
        normalized_text = re.sub(r"\s+", " ", document["text"]).strip()
        sentences = re.split(
            r"(?<!approx\.)(?<=[.!?])\s+",
            normalized_text,
            flags=re.IGNORECASE,
        )
        for sentence_index, raw_sentence in enumerate(sentences):
            sentence = re.sub(r"\s+", " ", raw_sentence).strip()
            if (
                len(sentence.split()) < 8
                or len(sentence) > 400
                or not re.search(r"[.!?][\"')\]]?$", sentence)
            ):
                continue

            first_letter = re.search(r"[A-Za-z]", sentence)
            if not first_letter or not first_letter.group(0).isupper():
                continue

            if sentence in seen_sentences:
                continue
            seen_sentences.add(sentence)

            sentence_terms = content_terms(sentence)
            if "microgravity" in sentence_terms:
                sentence_terms.discard("gravity")
            overlap = question_terms & sentence_terms
            if overlap:
                candidates.append({
                    "sentence": sentence,
                    "source_index": source_index,
                    "sentence_index": sentence_index,
                    "terms": overlap,
                })

    selected = []
    covered_terms = set()
    while candidates and len(selected) < 3:
        best = max(
            candidates,
            key=lambda item: (
                len(item["terms"] - covered_terms),
                len(item["terms"]),
                -item["source_index"],
                -item["sentence_index"],
            ),
        )
        new_terms = best["terms"] - covered_terms
        if not new_terms and selected:
            break
        selected.append(best)
        covered_terms.update(best["terms"])
        candidates.remove(best)

    if len(covered_terms) / len(question_terms) < 0.75:
        return None

    if SPANISH_TERMS.search(question):
        introduction = "Fragmentos textuales relevantes de los documentos:"
    else:
        introduction = "Relevant verbatim excerpts from the indexed documents:"

    quotes = [
        f'- "{item["sentence"]}" [[{item["source_index"]}]]'
        for item in selected
    ]
    return "\n".join([introduction, *quotes])


def _general_response(question: str) -> dict:
    prompt = f"""
You are IGNIS, a friendly conversational assistant.
Answer casual conversation and general questions directly in the same
language as the user, using general knowledge rather than claiming that
the answer comes from IGNIS's research collection.
Be concise, distinguish uncertainty from fact, and say when you do not know.
Do not invent personal experiences or claim to have feelings.

USER:
{question}

ANSWER:
"""
    return {
        "answer": generate_response(prompt),
        "sources": [],
        "evidence": [],
        "insufficient_evidence": False,
        "response_mode": "general",
    }


def answer_question(question: str) -> dict:
    """Responde con charla general o evidencia de la biblioteca científica."""

    if not question.strip():
        raise ValueError("La pregunta no puede estar vacía.")

    if not is_research_question(question):
        return _general_response(question)

    # 1. Buscar información científica
    documents = search_documents(
        question,
        n_results=4,
        source_filter=_source_filter(question),
    )

    if not documents or not has_relevant_evidence(question, documents):
        return {
            "answer": _insufficient_evidence_message(question),
            "sources": [],
            "evidence": [],
            "insufficient_evidence": True,
            "response_mode": "research",
        }

    sources = [
        {
            "source": document["source"],
            "page": document["page"]
        }
        for document in documents
    ]
    evidence = [
        {
            "source": document["source"],
            "page": document["page"],
            "excerpt": document["text"],
        }
        for document in documents
    ]

    answer = _extractive_research_answer(question, documents)
    if answer is None:
        return {
            "answer": _insufficient_evidence_message(question),
            "sources": sources,
            "evidence": evidence,
            "insufficient_evidence": True,
            "response_mode": "research",
        }

    return {
        "answer": answer,
        "sources": sources,
        "evidence": evidence,
        "insufficient_evidence": False,
        "response_mode": "research",
    }
