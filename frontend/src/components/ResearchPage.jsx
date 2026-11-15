import React from 'react'
import { AlertCircle, ExternalLink, FileText, Info, Search } from 'lucide-react'

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
            aria-label="Search indexed documents and their contents"
            placeholder="Search document names or indexed text..."
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
          <span>ORDER</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="source">File name</option>
            <option value="chunks">Most fragments</option>
          </select>
        </label>
      </form>

      <div className="research-library-heading">
        <div>
          <h3>Indexed locally</h3>
          <p>Source names and fragment totals are read from ChromaDB.</p>
        </div>
        <span>
          {loading ? 'LOADING' : `${library?.total_documents ?? 0} SOURCES`}
        </span>
      </div>

      {error && (
        <div className="inline-error" role="alert">
          <AlertCircle size={18} /><span>{error}</span>
        </div>
      )}

      {textError && (
        <div className="inline-notice" role="status">
          Content search is unavailable: {textError} File-name search remains available.
        </div>
      )}

      {query.trim().length === 1 && (
        <p className="research-hint">Escribe al menos dos caracteres para buscar dentro del texto indexado.</p>
      )}

      <div className="research-library">
        {loading && !library ? (
          <div className="research-empty" role="status">Loading the indexed collection…</div>
        ) : filteredDocuments.length ? filteredDocuments.map((document) => (
          <article className="library-card" key={document.source}>
            <div className="library-card-icon"><FileText size={22} /></div>
            <div className="library-card-content">
              <span className="library-category">LOCAL INDEX · PDF SOURCE</span>
              <h3>{document.source}</h3>
              <p>{document.chunks} indexed fragments · {document.page_count} pages with extracted text</p>
              <details className="source-metadata">
                <summary><Info size={13} /> Inspect source metadata</summary>
                <dl>
                  <div><dt>File</dt><dd>{document.source}</dd></div>
                  <div><dt>Index</dt><dd>Local ChromaDB collection</dd></div>
                  <div><dt>Extracted pages</dt><dd>{document.page_count}</dd></div>
                  <div><dt>Indexed fragments</dt><dd>{document.chunks}</dd></div>
                </dl>
              </details>
            </div>
            <div className="library-card-status">
              <span className="indexed">Indexed</span>
              <a
                className="source-link"
                href={getDocumentUrl(document.source)}
                target="_blank"
                rel="noreferrer"
              >
                Open local PDF <ExternalLink size={14} />
              </a>
            </div>
          </article>
        )) : (
          <div className="research-empty">
            <Search size={25} />
            <h3>No matching local documents</h3>
            <p>Try a different title or phrase from the indexed text.</p>
          </div>
        )}
      </div>

      {query.trim().length >= 2 && (
        <section className="content-search-results" aria-live="polite">
          <div className="research-library-heading">
            <div>
              <h3>Matches in indexed text</h3>
              <p>Semantic matches from locally stored research fragments.</p>
            </div>
            <span>{textLoading ? 'SEARCHING' : `${textMatches.length} MATCHES`}</span>
          </div>
          {textLoading && <div className="research-hint">Searching indexed fragments…</div>}
          {!textLoading && !textError && textMatches.length === 0 && (
            <div className="research-hint">No text fragments matched this query.</div>
          )}
          {textMatches.map((match, index) => (
            <article className="evidence-card" key={`${match.source}-${match.page}-${index}`}>
              <div className="evidence-card-heading">
                <strong>{match.source}</strong>
                <span>PAGE {match.page ?? '—'}</span>
              </div>
              <p>{match.excerpt}</p>
              <a
                href={match.page
                  ? `${getDocumentUrl(match.source)}#page=${match.page}`
                  : getDocumentUrl(match.source)}
                target="_blank"
                rel="noreferrer"
              >
                Open source · page {match.page ?? '—'} <ExternalLink size={13} />
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
            aria-label="Search scientific publications in Crossref"
            placeholder="Search title, author, or topic..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button className="primary-button" type="submit" disabled={loading}>
          <Search size={15} /> {loading ? 'SEARCHING' : 'SEARCH CROSSREF'}
        </button>
      </form>

      <p className="research-hint">
        Crossref bibliographic records are external metadata; a DOI does not guarantee
        access to full text or peer review.
      </p>

      {error && (
        <div className="inline-error" role="alert">
          <AlertCircle size={18} />
          <span>{error} La biblioteca local continúa disponible en su pestaña.</span>
        </div>
      )}

      {loading && <div className="research-empty" role="status">Querying Crossref…</div>}
      {!loading && searched && !error && results.length === 0 && (
        <div className="research-empty">
          <Search size={25} />
          <h3>No records found</h3>
          <p>Try a broader title or topic.</p>
        </div>
      )}

      {!loading && results.map((item, index) => (
        <article className="library-card crossref-card" key={`${item.doi ?? item.title}-${index}`}>
          <div className="library-card-icon"><FileText size={22} /></div>
          <div className="library-card-content">
            <span className="library-category">CROSSREF RECORD</span>
            <h3>{item.title || 'Untitled Crossref record'}</h3>
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
                View record <ExternalLink size={14} />
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
          <div className="eyebrow"><span className="status-dot" /> RESEARCH INTELLIGENCE</div>
          <h2>Scientific evidence, traceable to its source</h2>
          <p>
            Search the local ChromaDB collection or query Crossref for external
            bibliographic records.
          </p>
        </div>
        <div className="research-total">
          <FileText size={22} />
          <div>
            <strong>{library?.total_documents ?? '—'}</strong>
            <span>LOCAL SOURCES</span>
            <small>{library?.total_chunks?.toLocaleString() ?? '—'} fragments</small>
          </div>
        </div>
      </div>

      <div className="research-tabs" role="tablist" aria-label="Research source">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'local'}
          className={tab === 'local' ? 'selected' : ''}
          onClick={() => setTab('local')}
        >
          Local indexed documents
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'crossref'}
          className={tab === 'crossref' ? 'selected' : ''}
          onClick={() => setTab('crossref')}
        >
          External search · Crossref
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
