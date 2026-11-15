
from collections import defaultdict
import logging
import os
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen
import json

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.services.crossref import CrossrefUnavailableError, search_crossref
from app.services.llm_service import MODEL, OLLAMA_URL
from app.services.rag_service import answer_question
from app.services.vector_store import get_collection


logger = logging.getLogger(__name__)
BACKEND_DIR = Path(__file__).resolve().parents[1]
DOCUMENTS_DIR = BACKEND_DIR / "data" / "documents"

app = FastAPI(
    title="IGNIS Scientific Intelligence",
    description="Scientific exploration of combustion in microgravity",
    version="1.0.0"
)

default_origins = (
    "http://localhost:5173,http://localhost:5175,"
    "http://127.0.0.1:5173,http://127.0.0.1:5175"
)
allowed_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str


@app.get("/")
async def root():
    return {
        "project": "IGNIS",
        "status": "operational",
        "message": "IGNIS Scientific Intelligence is online"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "backend": "online"
    }


def get_ollama_status() -> dict:
    tags_url = OLLAMA_URL.rsplit("/api/generate", 1)[0] + "/api/tags"
    try:
        with urlopen(tags_url, timeout=2) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (URLError, TimeoutError, OSError) as error:
        return {
            "status": "offline",
            "available": False,
            "provider": "Ollama",
            "model": MODEL,
            "error": str(error),
        }
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        return {
            "status": "error",
            "available": False,
            "provider": "Ollama",
            "model": MODEL,
            "error": f"Invalid Ollama response: {error}",
        }

    installed_models = {
        model.get("name")
        for model in payload.get("models", [])
        if isinstance(model, dict)
    }
    available = MODEL in installed_models
    return {
        "status": "online" if available else "model_missing",
        "available": available,
        "provider": "Ollama",
        "model": MODEL,
        "error": None if available else f"Model {MODEL} is not installed in Ollama.",
    }


@app.get("/api/status")
def get_system_status():
    collection = get_collection()
    metadatas = collection.get(include=["metadatas"])["metadatas"] or []
    sources = {
        metadata.get("source", "Unknown")
        for metadata in metadatas
    }
    ai_status = get_ollama_status()
    return {
        "status": "operational" if ai_status["available"] else "degraded",
        "backend": "online",
        "knowledge_base": {
            "status": "online",
            "collection": collection.name,
            "documents": len(sources),
            "chunks": collection.count(),
        },
        "ai": ai_status,
    }


@app.get("/api/documents")
def get_documents():
    try:
        collection = get_collection()

        data = collection.get(include=["metadatas"])
        metadatas = data["metadatas"] or []

        documents = defaultdict(set)

        for metadata in metadatas:
            source = metadata.get("source", "Unknown")
            page = metadata.get("page")

            documents[source].add(page)

        results = []

        for source, pages in documents.items():
            valid_pages = sorted(
                [page for page in pages if page is not None],
                key=lambda page: str(page)
            )

            results.append({
                "source": source,
                "chunks": sum(
                    1 for metadata in metadatas
                    if metadata.get("source", "Unknown") == source
                ),
                "pages": valid_pages,
                "page_count": len(valid_pages)
            })

        results.sort(key=lambda item: item["source"].lower())

        return {
            "total_documents": len(results),
            "total_chunks": collection.count(),
            "documents": results
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving documents: {str(error)}"
        )


@app.get("/api/documents/search")
def search_local_documents(
    q: str = Query(min_length=2, max_length=200),
    limit: int = Query(default=8, ge=1, le=20),
):
    collection = get_collection()
    document_count = collection.count()
    if document_count == 0:
        return {"query": q, "results": []}

    results = collection.query(
        query_texts=[q],
        n_results=min(limit, document_count),
        include=["documents", "metadatas"],
    )
    documents = results["documents"][0] or []
    metadatas = results["metadatas"][0] or []
    matches = []
    for text, metadata in zip(documents, metadatas):
        matches.append({
            "source": metadata.get("source", "Unknown"),
            "page": metadata.get("page"),
            "excerpt": text.strip(),
        })
    return {"query": q, "results": matches}


@app.get("/api/documents/{document_name}/download")
async def download_document(document_name: str):
    if Path(document_name).name != document_name:
        raise HTTPException(status_code=400, detail="Invalid document name.")

    collection = get_collection()
    metadatas = collection.get(include=["metadatas"])["metadatas"] or []
    indexed_sources = {
        metadata.get("source")
        for metadata in metadatas
    }
    if document_name not in indexed_sources:
        raise HTTPException(status_code=404, detail="Indexed document not found.")

    document_path = (DOCUMENTS_DIR / document_name).resolve()
    if document_path.parent != DOCUMENTS_DIR.resolve() or not document_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="The indexed PDF is not available in the local document folder.",
        )
    return FileResponse(
        document_path,
        media_type="application/pdf",
        filename=document_name,
    )


@app.get("/api/research/crossref")
def search_external_research(
    q: str = Query(min_length=2, max_length=200),
    limit: int = Query(default=10, ge=1, le=20),
):
    try:
        results = search_crossref(q, rows=limit)
    except CrossrefUnavailableError as error:
        logger.warning("Crossref search failed: %s", error)
        raise HTTPException(status_code=502, detail=str(error)) from error
    return {"query": q, "source": "Crossref", "results": results}


@app.post("/api/chat")
def chat(request: ChatRequest):
    try:
        result = answer_question(request.question)
        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing scientific query: {str(error)}"
        )
