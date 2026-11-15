import React from 'react'
import { AlertCircle, ArrowUpRight, BrainCircuit, LoaderCircle, Send } from 'lucide-react'

import { askIgnis, getDocumentUrl } from '../api'

const suggestedQuestions = [
  'Hi, what can you help me with?',
  'What is photosynthesis?',
  'What does the indexed research say about combustion in reduced gravity?',
  'Which sources discuss spherical diffusion flames?',
  'What evidence is available about flame spread in spacecraft research?'
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
        <div className="eyebrow"><span className="status-dot" /> LOCAL AI · RAG FOR RESEARCH</div>
        <h2>IGNIS AI Assistant</h2>
        <p>Chat about general topics, or ask about combustion and space safety. Research answers use the indexed documents and show their evidence.</p>
      </div>

      <section className="assistant-console">
        <div className="assistant-console-heading">
          <span className="assistant-icon"><BrainCircuit size={22} /></span>
          <div>
            <span className="panel-kicker">RESEARCH-TO-SAFETY ENGINE</span>
            <h3>Ask IGNIS</h3>
          </div>
          <span className="local-model-badge">LOCAL MODEL</span>
        </div>

        <form className="assistant-form" onSubmit={submitQuestion}>
          <label htmlFor="ignis-question">Your question</label>
          <textarea
            id="ignis-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a general question or ask about combustion and space safety..."
            rows={3}
            maxLength={1200}
          />
          <div className="assistant-form-footer">
            <span>{question.length}/1200 · Research questions use local indexed sources</span>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? <LoaderCircle className="loading-icon" size={16} /> : <Send size={15} />}
              {loading ? 'THINKING' : 'ASK IGNIS'}
            </button>
          </div>
        </form>

        {!result && !loading && (
          <div className="suggested-questions">
            <span className="panel-kicker">SUGGESTED QUESTIONS</span>
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
            Waiting for the local model…
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
                    ? 'GENERAL CHAT · LOCAL MODEL KNOWLEDGE'
                    : 'RESEARCH RESPONSE · GROUNDED IN INDEXED EVIDENCE'}
                </span>
                <h3>IGNIS response</h3>
                <p>{result.answer}</p>
              </section>
            )}

            {result.evidence?.length > 0 && (
              <section className="assistant-evidence">
                <div className="research-library-heading">
                  <div>
                    <h3>Retrieved evidence</h3>
                    <p>Source excerpts returned by the local retrieval system.</p>
                  </div>
                  <span>{result.evidence.length} EXCERPTS</span>
                </div>
                {result.evidence.map((source, index) => (
                  <article className="evidence-card" key={`${source.source}-${source.page}-${index}`}>
                    <div className="evidence-card-heading">
                      <strong>{source.source}</strong>
                      <span>SOURCE {index + 1} · PAGE {source.page ?? '—'}</span>
                    </div>
                    <p>{source.excerpt}</p>
                    <a
                      href={source.page
                        ? `${getDocumentUrl(source.source)}#page=${source.page}`
                        : getDocumentUrl(source.source)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open source · page {source.page ?? '—'} <ArrowUpRight size={14} />
                    </a>
                  </article>
                ))}
              </section>
            )}
          </div>
        )}
      </section>

      <p className="science-disclaimer">
        General responses use the local model's general knowledge. Research answers are limited to retrieved
        excerpts; if the indexed data cannot support an answer, IGNIS will say so.
      </p>
    </section>
  )
}
