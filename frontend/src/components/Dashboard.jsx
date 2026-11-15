import React from 'react'
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  ChartNoAxesCombined,
  Database,
  FileText,
  Flame,
  RefreshCw
} from 'lucide-react'

import { getSystemStatus } from '../api'

const moduleLinks = [
  {
    href: '#research',
    title: 'Research Intelligence',
    description: 'Indexed studies and external bibliographic search.',
    icon: FileText
  },
  {
    href: '#combustion',
    title: 'Combustion Explorer',
    description: 'Compare qualitative flame and transport behavior.',
    icon: Flame
  },
  {
    href: '#habitat-safety',
    title: 'Habitat Safety',
    description: 'Connect evidence to crewed-habitat safety reviews.',
    icon: Activity
  },
  {
    href: '#assistant',
    title: 'IGNIS AI Assistant',
    description: 'Ask the local research collection and inspect evidence.',
    icon: BrainCircuit
  }
]

function MetricCard({ icon: Icon, label, value, detail, loading, tone }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <Icon size={19} />
      </div>
      <strong className={tone ? `metric-value ${tone}` : 'metric-value'}>
        {loading ? '…' : value}
      </strong>
      <small>{loading ? 'Consultando el backend' : detail}</small>
    </article>
  )
}

export default function Dashboard() {
  const [status, setStatus] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const refresh = React.useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      setStatus(await getSystemStatus(signal))
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.message)
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const controller = new AbortController()
    getSystemStatus(controller.signal)
      .then(setStatus)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const knowledgeBase = status?.knowledge_base
  const ai = status?.ai
  const systemOnline = status?.status === 'operational'

  return (
    <section className="dashboard">
      <div className="welcome">
        <div>
          <div className="eyebrow">
            <span className={`status-dot ${systemOnline ? '' : 'status-dot-warning'}`} />
            MISSION CONTROL
          </div>
          <h2>Research-to-Safety Intelligence</h2>
          <p>
            Connect combustion research in reduced gravity with evidence-informed
            questions for space-habitat safety.
          </p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-grid" />
          <div className="hero-orbit hero-orbit-a" />
          <div className="hero-orbit hero-orbit-b" />
          <div className="hero-core"><Flame size={66} strokeWidth={1.2} /></div>
          <span className="hero-coordinate coordinate-one">MICROGRAVITY // RESEARCH</span>
          <span className="hero-coordinate coordinate-two">SCIENCE → SAFETY</span>
          <span className="hero-coordinate coordinate-three">IGNIS</span>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h3>System status</h3>
          <p>Live values reported by the IGNIS backend</p>
        </div>
        <div className="dashboard-status-actions">
          <span className={`live-label ${systemOnline ? '' : 'live-label-warning'}`}>
            <span className={`status-dot ${systemOnline ? '' : 'status-dot-warning'}`} />
            {loading ? 'CHECKING' : systemOnline ? 'OPERATIONAL' : 'DEGRADED'}
          </span>
          <button
            className="icon-button"
            type="button"
            aria-label="Refresh system status"
            onClick={() => refresh()}
            disabled={loading}
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>

      {error && (
        <div className="inline-error" role="alert">
          <strong>Backend unavailable</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="metrics-grid">
        <MetricCard
          icon={FileText}
          label="INDEXED DOCUMENTS"
          value={knowledgeBase?.documents ?? '—'}
          detail="Distinct sources in ChromaDB"
          loading={loading}
        />
        <MetricCard
          icon={ChartNoAxesCombined}
          label="RESEARCH FRAGMENTS"
          value={knowledgeBase?.chunks?.toLocaleString() ?? '—'}
          detail="Stored in the active collection"
          loading={loading}
        />
        <MetricCard
          icon={Database}
          label="VECTOR COLLECTION"
          value={knowledgeBase?.collection ?? '—'}
          detail={knowledgeBase?.status === 'online' ? 'Connected' : 'Not connected'}
          loading={loading}
        />
        <MetricCard
          icon={BrainCircuit}
          label="LOCAL AI MODEL"
          value={ai?.available ? 'ONLINE' : ai?.status?.toUpperCase() ?? '—'}
          detail={ai?.model ?? 'Model status unavailable'}
          loading={loading}
          tone={ai?.available ? 'online-text' : 'warning-text'}
        />
      </div>

      {ai?.error && !ai.available && (
        <div className="inline-notice" role="status">{ai.error}</div>
      )}

      <div className="content-grid">
        <section className="panel module-panel">
          <div className="panel-heading">
            <div>
              <h3>Mission modules</h3>
              <p>Continue from evidence to safety applications</p>
            </div>
          </div>
          <div className="module-link-list">
            {moduleLinks.map((item) => {
              const Icon = item.icon
              return (
                <a className="module-link" href={item.href} key={item.href}>
                  <span className="module-link-icon"><Icon size={19} /></span>
                  <span className="module-link-copy">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <ArrowUpRight size={16} />
                </a>
              )
            })}
          </div>
        </section>

        <section className="panel mission-flow-panel">
          <div className="panel-heading">
            <div>
              <h3>Research-to-safety pathway</h3>
              <p>IGNIS workflow concept</p>
            </div>
            <Activity size={20} />
          </div>
          <div className="mission-flow" aria-label="Literature to evidence to safety context">
            <span>Literature</span><i aria-hidden="true" />
            <span>Evidence</span><i aria-hidden="true" />
            <span>Safety context</span>
          </div>
          <p className="mission-flow-note">
            The pathway supports exploration; it does not calculate fire probabilities
            or certify habitat systems.
          </p>
        </section>
      </div>

      <footer className="dashboard-footer">
        <span>IGNIS SCIENTIFIC INTELLIGENCE</span>
        <span>FLAME IN FREEFALL · NASA SPACE APPS 2026</span>
      </footer>
    </section>
  )
}
