
import logging
from pathlib import Path
from collections.abc import Iterable

from app.services.document_processor import process_pdf
from app.services.vector_store import get_collection

logger = logging.getLogger(__name__)
BACKEND_DIR = Path(__file__).resolve().parents[2]
DOCUMENTS_DIR = BACKEND_DIR / "data" / "documents"


def ingest_documents(pdf_paths: Iterable[Path] | None = None) -> dict:
    """Indexa documentos locales nuevos sin reescribir fuentes existentes."""

    collection = get_collection()
    paths = (
        sorted(DOCUMENTS_DIR.glob("*.pdf"))
        if pdf_paths is None
        else [Path(path) for path in pdf_paths]
    )
    processed = []
    skipped = []
    total_chunks = 0

    for candidate in paths:
        pdf_path = candidate.resolve()
        if pdf_path.parent != DOCUMENTS_DIR.resolve():
            raise ValueError(f"El documento debe estar en {DOCUMENTS_DIR}.")
        if not pdf_path.is_file():
            raise FileNotFoundError(f"No existe un PDF válido: {pdf_path}")
        if pdf_path.suffix.lower() != ".pdf":
            raise ValueError(f"El archivo no es un PDF: {pdf_path.name}")

        existing = collection.get(
            where={"source": pdf_path.name},
            include=["metadatas"],
        )["metadatas"] or []
        if existing:
            skipped.append(pdf_path.name)
            logger.info("Skipping already indexed source %s", pdf_path.name)
            continue

        chunks = process_pdf(pdf_path)
        if not chunks:
            raise ValueError(f"No se pudo extraer texto de {pdf_path.name}.")

        documents = [item["text"] for item in chunks]
        metadatas = [
            {
                "source": pdf_path.name,
                "page": item["page"],
                "chunk": item["chunk"],
            }
            for item in chunks
        ]
        ids = [
            f"{pdf_path.stem}_p{item['page']}_c{item['chunk']}"
            for item in chunks
        ]

        collection.upsert(documents=documents, metadatas=metadatas, ids=ids)
        total_chunks += len(documents)
        processed.append(pdf_path.name)
        logger.info("Indexed %s chunks from %s", len(documents), pdf_path.name)

    return {
        "processed": processed,
        "skipped": skipped,
        "chunks_added": total_chunks,
        "total_chunks": collection.count(),
    }


if __name__ == "__main__":
    summary = ingest_documents()
    print(summary)
