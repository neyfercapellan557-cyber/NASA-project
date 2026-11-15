
import json
from urllib.request import Request, urlopen

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:3b"


def generate_response(prompt: str) -> str:
    """Envía una pregunta a Ollama y devuelve la respuesta."""

    if not prompt.strip():
        raise ValueError("El prompt no puede estar vacío.")

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    }

    request = Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urlopen(request, timeout=120) as response:
        result = json.loads(response.read().decode("utf-8"))

    return result["response"].strip()
