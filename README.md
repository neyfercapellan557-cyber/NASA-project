# IGNIS — Flame in Freefall

IGNIS connects indexed combustion research with evidence-led questions about
spacecraft and habitat fire safety. It is a research exploration tool, not a
fire-risk predictor or certified operational system.

## Current architecture

- React + Vite frontend.
- FastAPI backend.
- Persistent ChromaDB collection: `flame_in_freefall`.
- Local RAG generation through Ollama (`llama3.2:3b`).
- Local PDF sources in `backend/data/documents`.
- External bibliographic metadata search through the free Crossref API.

The dashboard reads document, fragment, collection, and model status from
`GET /api/status`. The research library reads indexed sources from
`GET /api/documents`; semantic excerpt search uses
`GET /api/documents/search?q=...`. Crossref search is independent of the local
library, so an external-service failure does not disable local research.

## Run locally on Windows

From the repository root, start the backend:

```powershell
.\.venv312\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5175
```

Open `http://127.0.0.1:5175`. Set `VITE_API_BASE_URL` if the backend is hosted
elsewhere. Set `FRONTEND_ORIGINS` to a comma-separated allowlist when using
different frontend origins.

For generated answers, Ollama must be running and have `llama3.2:3b` available.
Casual and general questions use local-model general knowledge. Questions about
combustion, microgravity, and spacecraft fire research use only relevant indexed
excerpts as direct quotations with source markers; when the collection cannot
support a relevant quote, IGNIS abstains instead of generating a paraphrase.
The RAG endpoint returns evidence and source pages separately from the answer.
Do not treat responses as operational guidance.

## Interactive exploration

The floating IGNIS flame remains available across modules, can be repositioned
with mouse or touch, and opens the assistant. It is a keyboard-accessible button
and respects reduced-motion preferences. Research citations link to their PDF
page when page metadata is available.

Combustion Explorer highlights buoyancy, diffusion, and imposed ventilation as
qualitative concepts. Its diagrams are explicitly schematic; the application
does not currently expose a standardized measured dataset for quantitative
charts, so it does not fabricate plotted values. Habitat Safety presents an
interactive review pathway, while Next-Gen Safety remains labeled as a proposed
and unvalidated concept.

Experiments Lab adds input-driven conceptual diagrams for flame transport,
droplet geometry, solid samples, ventilation, and extinction context. These are
not numerical or validated simulations. Its searchable, filterable archive
contains source-linked records for FLEX, FLEX-2, Saffire-I, and BASS-II, with
experiment details, comparisons, and related-module links. Publication and
media dates are identified as source dates when the original records do not
establish a flight-test date; image/video credits link back to NASA, and reuse
rights must be checked in the original media record.

`SAFFIRE-I Operations.pdf` is included in the persistent local RAG collection.
It documents mission operations and sample dimensions, not measured fire
outcomes; Saffire-I questions are scoped to that source and answered with
verbatim evidence.

## Validation

From the repository root:

```powershell
Set-Location backend
..\.venv312\Scripts\python.exe -m unittest discover -s tests
Set-Location ..
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
```

The indexed ChromaDB is read by the application and is not recreated by the
frontend or these tests. To index new PDFs, add them to
`backend/data/documents` and run:

```powershell
Set-Location backend
..\.venv312\Scripts\python.exe -m app.services.ingestion
```

Ingestion skips source files that are already indexed, so rerunning it does not
re-embed the existing library.