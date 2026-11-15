import React from 'react'
import { AlertCircle, ArrowUpRight, BrainCircuit, LoaderCircle, Send } from 'lucide-react'

import { askIgnis, getDocumentUrl } from '../api'

const suggestedQuestions = [
  'Hola, ¿en qué puedes ayudarme?',
  '¿Qué es la fotosíntesis?',
  '¿Qué dicen las investigaciones indexadas sobre la combustión en gravedad reducida?',
  '¿Qué fuentes estudian las llamas de difusión esféricas?',
  '¿Qué evidencia existe sobre la propagación de llamas en naves espaciales?'
]

export default function AssistantPage({ onAIActiveChange }) {
  const [question, setQuestion] = React.useState('')
  const [result, setResult] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  async function submitQuestion(event) {
    event.preventDefault()
    const normalizedQuestion = question.trim()
    if (!normalizedQuestion) {
      setError('Escribe una pregunta antes de consultar el asistente.')
      return
    }

    setLoading(true)
    onAIActiveChange?.(true)
    setError('')
    setResult(null)
    try {
      setResult(await askIgnis(normalizedQuestion))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
      onAIActiveChange?.(false)
    }
  }

  return (
    <section className="module-page assistant-page">
      <div className="module-page-header assistant-header">
        <div className="eyebrow"><span className="status-dot" /> IA LOCAL · RAG CIENTÍFICO</div>
        <h2>Asistente de IA IGNIS</h2>
        <p>Conversa sobre temas generales o pregunta sobre combustión y seguridad espacial. Las respuestas científicas se basan en documentos indexados y muestran sus fuentes.</p>
      </div>

      <section className="assistant-console">
        <div className="assistant-console-heading">
          <span className="assistant-icon"><BrainCircuit size={22} /></span>
          <div>
            <span className="panel-kicker">MOTOR DE INVESTIGACIÓN Y SEGURIDAD</span>
            <h3>Pregunta a IGNIS</h3>
          </div>
          <span className="local-model-badge">MODELO LOCAL</span>
        </div>

        <form className="assistant-form" onSubmit={submitQuestion}>
          <label htmlFor="ignis-question">Tu pregunta</label>
          <textarea
            id="ignis-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Escribe una pregunta general o sobre combustión y seguridad espacial..."
            rows={3}
            maxLength={1200}
          />
          <div className="assistant-form-footer">
            <span>{question.length}/1200 · Las preguntas científicas consultan fuentes indexadas localmente</span>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? <LoaderCircle className="loading-icon" size={16} /> : <Send size={15} />}
              {loading ? 'ANALIZANDO' : 'PREGUNTAR'}
            </button>
          </div>
        </form>

        {!result && !loading && (
          <div className="suggested-questions">
            <span className="panel-kicker">PREGUNTAS SUGERIDAS</span>
            {suggestedQuestions.map((item) => (
              <button type="button" key={item} onClick={() => setQuestion(item)}>
                {item}<ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="assistant-loading" role="status">
            <LoaderCircle className="loading-icon" size={20} />
            Esperando la respuesta del modelo local…
          </div>
        )}

        {error && (
          <div className="inline-error assistant-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="assistant-result" aria-live="polite">
            {result.insufficient_evidence ? (
              <div className="insufficient-evidence">
                <AlertCircle size={18} />
                <p>{result.answer}</p>
              </div>
            ) : (
              <section className="answer-panel">
                <span className="panel-kicker">
                  {result.response_mode === 'general'
                    ? 'CONVERSACIÓN GENERAL · CONOCIMIENTO DEL MODELO LOCAL'
                    : 'RESPUESTA CIENTÍFICA · BASADA EN EVIDENCIA INDEXADA'}
                </span>
                <h3>Respuesta de IGNIS</h3>
                <p>{result.answer}</p>
              </section>
            )}

            {result.evidence?.length > 0 && (
              <section className="assistant-evidence">
                <div className="research-library-heading">
                  <div>
                    <h3>Evidencia recuperada</h3>
                    <p>Fragmentos originales devueltos por el sistema local de búsqueda; se conserva el idioma de cada fuente.</p>
                  </div>
                  <span>{result.evidence.length} FRAGMENTOS</span>
                </div>
                {result.evidence.map((source, index) => (
                  <article className="evidence-card" key={`${source.source}-${source.page}-${index}`}>
                    <div className="evidence-card-heading">
                      <strong>{source.source}</strong>
                      <span>FUENTE {index + 1} · PÁGINA {source.page ?? '—'}</span>
                    </div>
                    <p>{source.excerpt}</p>
                    <a
                      href={source.page
                        ? `${getDocumentUrl(source.source)}#page=${source.page}`
                        : getDocumentUrl(source.source)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir fuente · página {source.page ?? '—'} <ArrowUpRight size={14} />
                    </a>
                  </article>
                ))}
              </section>
            )}
          </div>
        )}
      </section>

      <p className="science-disclaimer">
        Las respuestas generales usan el conocimiento del modelo local. Las respuestas científicas se limitan a
        los fragmentos recuperados; si los documentos indexados no bastan para responder, IGNIS lo indicará.
      </p>
    </section>
  )
}
