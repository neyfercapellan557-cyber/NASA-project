
from pathlib import Path
from pypdf import PdfReader


def extract_pdf_text(pdf_path):
    """Extrae el texto de un documento PDF."""
    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"No existe el archivo: {pdf_path}")

    reader = PdfReader(str(pdf_path))
    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""

        if text.strip():
            pages.append({
                "page": page_number,
                "text": text.strip()
            })

    return pages


def chunk_text(text, chunk_size=1000, overlap=150):
    """Divide el texto en fragmentos con superposición."""

    if chunk_size <= 0 or overlap < 0 or overlap >= chunk_size:
        raise ValueError("Configuración de fragmentos inválida.")

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


def process_pdf(pdf_path):
    """Extrae y divide el contenido de un PDF."""

    pages = extract_pdf_text(pdf_path)
    documents = []

    for page in pages:
        chunks = chunk_text(page["text"])

        for index, chunk in enumerate(chunks):
            documents.append({
                "text": chunk,
                "page": page["page"],
                "chunk": index
            })

    return documents
