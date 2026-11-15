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
different frontend origins. `CHROMA_DB_PATH` and `DOCUMENTS_DIR` can point to
persistent data locations outside the backend source tree.

By default, general conversation uses local Ollama with `llama3.2:3b`. The
backend can instead use an OpenAI-compatible inference API by setting
`LLM_PROVIDER=openai-compatible`, `LLM_BASE_URL`, `LLM_MODEL`, and
`LLM_API_KEY` on the backend only. Never set `LLM_API_KEY` in a `VITE_*`
variable or commit it to the repository. This provider is used for general
conversation; evidence-based research answers remain extractive and use the
local Chroma collection.
Questions about combustion, microgravity, and spacecraft fire research use only
relevant indexed excerpts as direct quotations with source markers; when the
collection cannot support a relevant quote, IGNIS abstains instead of generating
a paraphrase. The RAG endpoint returns evidence and source pages separately
from the answer. Do not treat responses as operational guidance.

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

The IGNIS Digital Twin (`#digital-twin`) is a selectable, schematic habitat with
explicitly hypothetical telemetry scenarios; it is not a spacecraft replica,
fire detector, or operational control. Microgravity vs Earth Lab
(`#microgravity-lab`) compares two interactive 3D transport-context diagrams
with shared inputs, synchronized playback/cameras, and a simplified droplet
diameter curve. That curve uses `D²(t) = max(D₀² − Kt, 0)` with a user-selected,
illustrative coefficient; the equation has no gravity term, so its matching
curves must not be interpreted as measured equivalence between environments.
The flame geometry and transport cues are conceptual, and neither experience
claims experimental validation. Both link to the existing research library,
Experiments Lab, and IGNIS AI assistant.

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