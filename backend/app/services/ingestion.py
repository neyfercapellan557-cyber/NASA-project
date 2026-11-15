
from pathlib import Path

from app.services.document_processor import process_pdf
from app.services.vector_store import get_collection

BACKEND_DIR = Path(__file__).resolve().parents[2]
DOCUMENTS_DIR = BACKEND_DIR / "data" / "documents"


def ingest_documents():
    collection = get_collection()

    pdf_files = list(DOCUMENTS_DIR.glob("*.pdf"))

    if not pdf_files:
        print("No se encontraron documentos PDF.")
        return

    total_chunks = 0

    for pdf_path in pdf_files:
        print(f"\nProcesando: {pdf_path.name}")

        try:
            chunks = process_pdf(pdf_path)

            if not chunks:
                print("No se pudo extraer texto de este PDF.")
                continue

            documents = []
            metadatas = []
            ids = []

            for item in chunks:
                documents.append(item["text"])

                metadatas.append({
                    "source": pdf_path.name,
                    "page": item["page"],
                    "chunk": item["chunk"]
                })

                ids.append(
                    f"{pdf_path.stem}_p{item['page']}_c{item['chunk']}"
                )

            collection.upsert(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )

            total_chunks += len(documents)

            print(f"Fragmentos almacenados: {len(documents)}")

        except Exception as error:
            print(f"Error procesando {pdf_path.name}: {error}")

    print("\nINGESTA FINALIZADA")
    print(f"Total de fragmentos procesados: {total_chunks}")
    print(f"Total en ChromaDB: {collection.count()}")


if __name__ == "__main__":
    ingest_documents()
