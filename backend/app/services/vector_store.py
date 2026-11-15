import os
from pathlib import Path
import chromadb

BACKEND_DIR = Path(__file__).resolve().parents[2]
DB_PATH = Path(os.getenv(
    "CHROMA_DB_PATH",
    str(BACKEND_DIR / "data" / "chroma_db"),
)).expanduser()
client = chromadb.PersistentClient(
    path=str(DB_PATH)
)

collection = client.get_or_create_collection(
    name="flame_in_freefall",
    metadata={"description": "NASA combustion research documents"}
)


def get_collection():
    return collection


def get_client():
    return client