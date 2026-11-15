
from app.services.retrieval import search_documents
from app.services.llm_service import generate_response


def answer_question(question: str) -> dict:
    """Responde preguntas utilizando documentos científicos."""

    if not question.strip():
        raise ValueError("La pregunta no puede estar vacía.")

    # 1. Buscar información científica
    documents = search_documents(question, n_results=4)

    if not documents:
        return {
            "answer": "No encontré información suficiente en los documentos científicos.",
            "sources": []
        }

    # 2. Construir el contexto con las fuentes
    context_parts = []

    for index, document in enumerate(documents, start=1):
        context_parts.append(
            f"[Fuente {index}: {document['source']}, "
            f"página {document['page']}]\n"
            f"{document['text']}"
        )

    context = "\n\n".join(context_parts)

    # 3. Preparar instrucciones para la IA
    prompt = f"""
You are a scientific assistant specialized in
combustion in microgravity.

Answer the user's question using the scientific
context provided below.

Rules:
- Use the scientific context as the primary evidence.
- Never invent experimental results or numerical values.
- Preserve the exact units and meaning of measurements.
- Never interpret a temperature, pressure, or other
  measurement without its surrounding context.
- Do not confuse temperature differences with
  absolute temperatures.
- Do not invent numbered references such as [1] or [2].
- Cite sources using their document name and page number.
- If evidence is insufficient, explicitly say so.
- Distinguish experimental observations/  from hypotheses[ÑP=]
- Treat every experimental measurement separately.
- Distinguish absolute temperatures from temperature differences.
- Never generalize a measurement method to all experiments.
- Never use words such as "likely" to speculate about
  experimental methods.
- Only describe an instrument when the document
  explicitly identifies it for that measurement.
- Preserve the experimental conditions associated
  with every reported value.
SCIENTIFIC CONTEXT:
{context}

USER QUESTION:
{question}

SCIENTIFIC ANSWER:
"""

    # 4. Generar respuesta con Llama
    answer = generate_response(prompt)

    # 5. Devolver respuesta y fuentes
    sources = [
        {
            "source": document["source"],
            "page": document["page"]
        }
        for document in documents
    ]

    return {
        "answer": answer,
        "sources": sources
    }
