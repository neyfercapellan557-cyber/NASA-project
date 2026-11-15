const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/$/, '')

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  let payload

  try {
    payload = await response.json()
  } catch {
    throw new Error('El backend devolvió una respuesta que no es JSON.')
  }

  if (!response.ok) {
    const detail = typeof payload?.detail === 'string'
      ? payload.detail
      : `Error del backend (${response.status}).`
    throw new Error(detail)
  }

  return payload
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Respuesta inválida del backend: ${label}.`)
  }
  return value
}

export async function getSystemStatus(signal) {
  const payload = requireObject(
    await requestJson('/api/status', { signal }),
    'estado del sistema'
  )
  if (!payload.knowledge_base || !payload.ai) {
    throw new Error('Respuesta inválida del backend: faltan estados de servicios.')
  }
  return payload
}

export async function getIndexedDocuments(signal) {
  const payload = requireObject(
    await requestJson('/api/documents', { signal }),
    'biblioteca local'
  )
  if (!Array.isArray(payload.documents)) {
    throw new Error('Respuesta inválida del backend: lista de documentos.')
  }
  return payload
}

export async function searchIndexedContent(query, signal) {
  const params = new URLSearchParams({ q: query })
  const payload = requireObject(
    await requestJson(`/api/documents/search?${params}`, { signal }),
    'resultados locales'
  )
  if (!Array.isArray(payload.results)) {
    throw new Error('Respuesta inválida del backend: resultados locales.')
  }
  return payload.results
}

export async function searchCrossref(query, signal) {
  const params = new URLSearchParams({ q: query })
  const payload = requireObject(
    await requestJson(`/api/research/crossref?${params}`, { signal }),
    'resultados Crossref'
  )
  if (!Array.isArray(payload.results)) {
    throw new Error('Respuesta inválida del backend: resultados Crossref.')
  }
  return payload.results
}

export async function askIgnis(question, signal) {
  const payload = requireObject(
    await requestJson('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal
    }),
    'respuesta del asistente'
  )
  if (
    typeof payload.answer !== 'string'
    || !Array.isArray(payload.sources)
    || !Array.isArray(payload.evidence)
    || !['general', 'research'].includes(payload.response_mode)
  ) {
    throw new Error('Respuesta inválida del backend: formato del asistente.')
  }
  return payload
}

export function getDocumentUrl(source) {
  return `${API_BASE_URL}/api/documents/${encodeURIComponent(source)}/download`
}
