import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


CROSSREF_URL = "https://api.crossref.org/works"
REQUEST_TIMEOUT_SECONDS = 12


class CrossrefUnavailableError(Exception):
    """Raised when Crossref cannot return a usable response."""


def _first(value):
    return value[0] if isinstance(value, list) and value else None


def _publication_year(item: dict) -> int | None:
    for key in ("published", "published-print", "published-online", "issued"):
        date_parts = item.get(key, {}).get("date-parts")
        if date_parts and date_parts[0]:
            year = date_parts[0][0]
            return year if isinstance(year, int) else None
    return None


def _authors(item: dict) -> list[str]:
    authors = []
    for author in item.get("author", []):
        name = " ".join(
            part for part in (author.get("given"), author.get("family")) if part
        ).strip()
        if name:
            authors.append(name)
    return authors


def normalize_work(item: dict) -> dict:
    doi = item.get("DOI")
    return {
        "title": _first(item.get("title")),
        "authors": _authors(item),
        "year": _publication_year(item),
        "journal": _first(item.get("container-title")),
        "doi": doi,
        "url": item.get("URL") or (f"https://doi.org/{doi}" if doi else None),
        "publisher": item.get("publisher"),
        "source": "Crossref",
    }


def search_crossref(query: str, rows: int = 10) -> list[dict]:
    params = urlencode({
        "query.bibliographic": query,
        "rows": rows,
        "select": (
            "DOI,title,author,published,published-print,published-online,"
            "issued,container-title,URL,publisher"
        ),
    })
    request = Request(
        f"{CROSSREF_URL}?{params}",
        headers={
            "Accept": "application/json",
            "User-Agent": "IGNIS-Scientific-Research/1.0",
        },
    )

    try:
        with urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        raise CrossrefUnavailableError(
            f"Crossref devolvió el código HTTP {error.code}."
        ) from error
    except (URLError, TimeoutError, OSError) as error:
        raise CrossrefUnavailableError(
            "No se pudo conectar con Crossref. La biblioteca local sigue disponible."
        ) from error
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise CrossrefUnavailableError(
            "Crossref devolvió una respuesta que no se pudo leer."
        ) from error

    message = payload.get("message")
    items = message.get("items") if isinstance(message, dict) else None
    if not isinstance(items, list):
        raise CrossrefUnavailableError("Crossref devolvió una lista de publicaciones no válida.")
    return [normalize_work(item) for item in items if isinstance(item, dict)]
