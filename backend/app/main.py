
from collections import defaultdict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.rag_service import answer_question
from app.services.vector_store import get_collection


app = FastAPI(
    title="IGNIS Scientific Intelligence",
    description="Scientific exploration of combustion in microgravity",
    version="1.0.0"
)

# Permitir la comunicación con React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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


@app.get("/api/documents")
async def get_documents():
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


@app.post("/api/chat")
async def chat(request: ChatRequest):
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
