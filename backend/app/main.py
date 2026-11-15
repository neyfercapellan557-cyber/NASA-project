
from fastapi import FastAPI

app = FastAPI(
    title="Flame in Freefall",
    description="Scientific exploration of combustion in microgravity",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "project": "Flame in Freefall",
        "status": "operational",
        "message": "Welcome to Flame in Freefall!"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "backend": "online"
    }
