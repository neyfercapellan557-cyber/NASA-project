
import os
import json
from urllib.request import Request, urlopen

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama").strip().lower()
MODEL = os.getenv("LLM_MODEL", "llama3.2:3b").strip()
OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL",
    "http://localhost:11434",
).rstrip("/")
OLLAMA_URL = f"{OLLAMA_BASE_URL}/api/generate"
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "").rstrip("/")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")


def generate_response(prompt: str) -> str:
    """Genera texto con Ollama o una API compatible con OpenAI."""

    if not prompt.strip():
        raise ValueError("El prompt no puede estar vacío.")

    if LLM_PROVIDER == "ollama":
        payload = {
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
        }
        request = Request(
            OLLAMA_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
    elif LLM_PROVIDER == "openai-compatible":
        if not LLM_BASE_URL:
            raise RuntimeError("Debes configurar LLM_BASE_URL.")
        if not LLM_API_KEY:
            raise RuntimeError("Debes configurar LLM_API_KEY.")

        payload = {
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
        }
        request = Request(
            f"{LLM_BASE_URL}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {LLM_API_KEY}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
    else:
        raise RuntimeError(f"Proveedor LLM_PROVIDER no compatible: {LLM_PROVIDER}")

    with urlopen(request, timeout=120) as response:
        result = json.loads(response.read().decode("utf-8"))

    if LLM_PROVIDER == "ollama":
        return result["response"].strip()

    choices = result.get("choices")
    if not choices or not isinstance(choices[0], dict):
        raise ValueError("La API de inferencia no devolvió opciones de respuesta.")
    message = choices[0].get("message")
    content = message.get("content") if isinstance(message, dict) else None
    if not isinstance(content, str) or not content.strip():
        raise ValueError("La API de inferencia devolvió una respuesta vacía.")
    return content.strip()
