import React from 'react'
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  Box,
  ExternalLink,
  FileText,
  FlaskConical,
  Info,
  Search
} from 'lucide-react'

import {
  getDocumentUrl,
  getIndexedDocuments,
  searchCrossref,
  searchIndexedContent
} from '../api'

function LocalLibrary({ library, loading, error }) {
  const [query, setQuery] = React.useState('')
  const [textMatches, setTextMatches] = React.useState([])
  const [textLoading, setTextLoading] = React.useState(false)
  const [textError, setTextError] = React.useState('')
  const [sortBy, setSortBy] = React.useState('source')

  React.useEffect(() => {
    const normalizedQuery = query.trim()
    if (normalizedQuery.length < 2) return undefined

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      searchIndexedContent(normalizedQuery, controller.signal)
        .then(setTextMatches)
        .catch((requestError) => {
          if (requestError.name !== 'AbortError') setTextError(requestError.message)
        })
        .finally(() => {
          if (!controller.signal.aborted) setTextLoading(false)
        })
    }, 350)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const documents = library?.documents ?? []
  const matchingSources = new Set(
    textMatches.map((match) => match.source)
  )
  const filteredDocuments = documents
    .filter((document) => {
      if (!query.trim()) return true
      return document.source.toLowerCase().includes(query.trim().toLowerCase())
        || matchingSources.has(document.source)
    })
    .sort((left, right) => sortBy === 'chunks'
      ? right.chunks - left.chunks
      : left.source.localeCompare(right.source))

  return (
    <>
      <form className="research-toolbar" onSubmit={(event) => event.preventDefault()}>
        <label className="research-search">
          <Search size={18} />
          <input
            type="search"
            aria-label="Buscar documentos indexados y su contenido"
            placeholder="Buscar por nombre de documento o texto indexado..."
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value
              setQuery(nextQuery)
              if (nextQuery.trim().length < 2) {
                setTextMatches([])
                setTextLoading(false)
              } else {
                setTextLoading(true)
                setTextError('')
              }
            }}
          />
        </label>
        <label className="sort-control">
          <span>ORDENAR</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="source">Nombre del archivo</option>
            <option value="chunks">Más fragmentos</option>
          </select>
        </label>
      </form>

      <div className="research-library-heading">
        <div>
          <h3>Documentos indexados localmente</h3>
          <p>Los nombres de las fuentes y el total de fragmentos proceden de ChromaDB.</p>
        </div>
        <span>
          {loading ? 'CARGANDO' : `${library?.total_documents ?? 0} FUENTES`}
        </span>
      </div>

      {error && (
        <div className="inline-error" role="alert">
          <AlertCircle size={18} /><span>{error}</span>
        </div>
      )}

      {textError && (
        <div className="inline-notice" role="status">
          La búsqueda por contenido no está disponible: {textError} Puedes seguir buscando por nombre de archivo.
        </div>
      )}

      {query.trim().length === 1 && (
        <p className="research-hint">Escribe al menos dos caracteres para buscar dentro del texto indexado.</p>
      )}

      <div className="research-library">
        {loading && !library ? (
          <div className="research-empty" role="status">Cargando la colección indexada…</div>
        ) : filteredDocuments.length ? filteredDocuments.map((document) => (
          <article className="library-card" key={document.source}>
            <div className="library-card-icon"><FileText size={22} /></div>
            <div className="library-card-content">
              <span className="library-category">ÍNDICE LOCAL · ARCHIVO PDF</span>
              <h3>{document.source}</h3>
              <p>{document.chunks} fragmentos indexados · {document.page_count} páginas con texto extraído</p>
              <details className="source-metadata">
                <summary><Info size={13} /> Consultar metadatos de la fuente</summary>
                <dl>
                  <div><dt>Archivo</dt><dd>{document.source}</dd></div>
                  <div><dt>Índice</dt><dd>Colección local de ChromaDB</dd></div>
                  <div><dt>Páginas extraídas</dt><dd>{document.page_count}</dd></div>
                  <div><dt>Fragmentos indexados</dt><dd>{document.chunks}</dd></div>
                </dl>
              </details>
            </div>
            <div className="library-card-status">
              <span className="indexed">Indexado</span>
              <a
                className="source-link"
                href={getDocumentUrl(document.source)}
                target="_blank"
                rel="noreferrer"
              >
                Abrir PDF local <ExternalLink size={14} />
              </a>
            </div>
          </article>
        )) : (
          <div className="research-empty">
            <Search size={25} />
            <h3>No hay documentos locales coincidentes</h3>
            <p>Prueba con otro título o una frase del texto indexado.</p>
          </div>
        )}
      </div>

      {query.trim().length >= 2 && (
        <section className="content-search-results" aria-live="polite">
          <div className="research-library-heading">
            <div>
              <h3>Coincidencias en el texto indexado</h3>
              <p>Resultados semánticos de fragmentos científicos almacenados localmente.</p>
            </div>
            <span>{textLoading ? 'BUSCANDO' : `${textMatches.length} COINCIDENCIAS`}</span>
          </div>
          {textLoading && <div className="research-hint">Buscando en los fragmentos indexados…</div>}
          {!textLoading && !textError && textMatches.length === 0 && (
            <div className="research-hint">Ningún fragmento de texto coincide con esta consulta.</div>
          )}
          {textMatches.map((match, index) => (
            <article className="evidence-card" key={`${match.source}-${match.page}-${index}`}>
              <div className="evidence-card-heading">
                <strong>{match.source}</strong>
                <span>PÁGINA {match.page ?? '—'}</span>
              </div>
              <p>{match.excerpt}</p>
              <a
                href={match.page
                  ? `${getDocumentUrl(match.source)}#page=${match.page}`
                  : getDocumentUrl(match.source)}
                target="_blank"
                rel="noreferrer"
              >
                Abrir fuente · página {match.page ?? '—'} <ExternalLink size={13} />
              </a>
            </article>
          ))}
        </section>
      )}
    </>
  )
}

function CrossrefSearch() {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState([])
  const [searched, setSearched] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  async function submitSearch(event) {
    event.preventDefault()
    const normalizedQuery = query.trim()
    if (normalizedQuery.length < 2) {
      setError('Escribe al menos dos caracteres para consultar Crossref.')
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    setError('')
    setSearched(true)
    try {
      setResults(await searchCrossref(normalizedQuery))
    } catch (requestError) {
      setResults([])
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form className="research-toolbar crossref-toolbar" onSubmit={submitSearch}>
        <label className="research-search">
          <Search size={18} />
          <input
            type="search"
            aria-label="Buscar publicaciones científicas en Crossref"
            placeholder="Buscar por título, autor o tema..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button className="primary-button" type="submit" disabled={loading}>
          <Search size={15} /> {loading ? 'BUSCANDO' : 'BUSCAR EN CROSSREF'}
        </button>
      </form>

      <p className="research-hint">
        Los registros bibliográficos de Crossref son metadatos externos; un DOI no garantiza
        acceso al texto completo ni que el trabajo haya pasado por revisión por pares.
      </p>

      {error && (
        <div className="inline-error" role="alert">
          <AlertCircle size={18} />
          <span>{error} La biblioteca local continúa disponible en su pestaña.</span>
        </div>
      )}

      {loading && <div className="research-empty" role="status">Consultando Crossref…</div>}
      {!loading && searched && !error && results.length === 0 && (
        <div className="research-empty">
          <Search size={25} />
          <h3>No se encontraron registros</h3>
          <p>Prueba con un título o tema más amplio.</p>
        </div>
      )}

      {!loading && results.map((item, index) => (
        <article className="library-card crossref-card" key={`${item.doi ?? item.title}-${index}`}>
          <div className="library-card-icon"><FileText size={22} /></div>
          <div className="library-card-content">
            <span className="library-category">REGISTRO CROSSREF · METADATOS ORIGINALES</span>
            <h3><span className="source-original-label">Título original:</span> {item.title || 'Registro de Crossref sin título'}</h3>
            {item.authors?.length > 0 && <p>{item.authors.join(', ')}</p>}
            <div className="bibliographic-details">
              {item.year && <span>{item.year}</span>}
              {item.journal && <span>{item.journal}</span>}
              {item.publisher && <span>{item.publisher}</span>}
            </div>
            {item.doi && <code className="doi-value">DOI: {item.doi}</code>}
          </div>
          <div className="library-card-status">
            {item.url && (
              <a className="source-link" href={item.url} target="_blank" rel="noreferrer">
                Ver registro <ExternalLink size={14} />
              </a>
            )}
          </div>
        </article>
      ))}
    </>
  )
}

export default function ResearchPage() {
  const [tab, setTab] = React.useState('local')
  const [library, setLibrary] = React.useState(null)
  const [libraryLoading, setLibraryLoading] = React.useState(true)
  const [libraryError, setLibraryError] = React.useState('')

  React.useEffect(() => {
    const controller = new AbortController()
    getIndexedDocuments(controller.signal)
      .then(setLibrary)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setLibraryError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLibraryLoading(false)
      })
    return () => controller.abort()
  }, [])

  return (
    <section className="research-page">
      <div className="research-page-header">
        <div>
          <div className="eyebrow"><span className="status-dot" /> INTELIGENCIA DE INVESTIGACIÓN</div>
          <h2>Evidencia científica trazable hasta su fuente</h2>
          <p>
            Busca en la colección local de ChromaDB o consulta Crossref para encontrar
            registros bibliográficos externos.
          </p>
        </div>
        <div className="research-total">
          <FileText size={22} />
          <div>
            <strong>{library?.total_documents ?? '—'}</strong>
            <span>FUENTES LOCALES</span>
            <small>{library?.total_chunks?.toLocaleString() ?? '—'} fragmentos</small>
          </div>
        </div>
      </div>

      <nav className="experience-links research-experience-links" aria-label="Experiencias de IGNIS relacionadas">
        <a href="#experiments-lab"><FlaskConical size={14} /> Explorar experimentos documentados <ArrowRight size={13} /></a>
        <a href="#digital-twin"><Box size={14} /> Consultar escenarios del hábitat <ArrowRight size={13} /></a>
        <a href="#assistant"><BrainCircuit size={14} /> Preguntar a la IA IGNIS sobre las fuentes <ArrowRight size={13} /></a>
      </nav>

      <div className="research-tabs" role="tablist" aria-label="Origen de la investigación">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'local'}
          className={tab === 'local' ? 'selected' : ''}
          onClick={() => setTab('local')}
        >
          Documentos locales indexados
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'crossref'}
          className={tab === 'crossref' ? 'selected' : ''}
          onClick={() => setTab('crossref')}
        >
          Búsqueda externa · Crossref
        </button>
      </div>

      <div role="tabpanel">
        {tab === 'local'
          ? <LocalLibrary library={library} loading={libraryLoading} error={libraryError} />
          : <CrossrefSearch />}
      </div>
    </section>
  )
}
