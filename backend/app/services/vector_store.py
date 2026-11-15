from pathlib import Path
import chromadb

# Directorio principal del backend
BACKEND_DIR = Path(__file__).resolve().parents[2]

# Base de datos persistente
DB_PATH = BACKEND_DIR / "data" / "chroma_db"

# Crear cliente persistente
client = chromadb.PersistentClient(
    path=str(DB_PATH)
)

# Crear u obtener colección científica
collection = client.get_or_create_collection(
    name="flame_in_freefall",
    metadata={"description": "NASA combustion research documents"}
)


def get_collection():
    return collection


def get_client():
    return client