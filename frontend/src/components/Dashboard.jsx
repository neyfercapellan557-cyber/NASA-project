import React, { Suspense } from 'react'
import {
  Activity,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Atom,
  BrainCircuit,
  Box,
  ChartNoAxesCombined,
  Database,
  FileText,
  FlaskConical,
  Flame,
  Globe,
  RefreshCw
} from 'lucide-react'

import { getSystemStatus } from '../api'

const DashboardHeroVisual = React.lazy(() => import('./DashboardHeroVisual'))

const moduleLinks = [
  {
    href: '#research',
    title: 'Inteligencia de investigación',
    description: 'Estudios indexados y búsqueda bibliográfica externa.',
    icon: FileText
  },
  {
    href: '#digital-twin',
    title: 'Gemelo digital del hábitat',
    description: 'Explora un hábitat conceptual y sus condiciones monitorizadas.',
    icon: Box
  },
  {
    href: '#experiments-lab',
    title: 'Laboratorio de experimentos',
    description: 'Explora modelos 3D de combustión y experimentos documentados.',
    icon: FlaskConical
  },
  {
    href: '#microgravity-lab',
    title: 'Laboratorio de gravedad',
    description: 'Compara condiciones con un modelo simplificado de gota.',
    icon: ArrowLeftRight
  },
  {
    href: '#combustion',
    title: 'Explorador de combustión',
    description: 'Compara cualitativamente la llama y los mecanismos de transporte.',
    icon: Flame
  },
  {
    href: '#habitat-safety',
    title: 'Seguridad del hábitat',
    description: 'Relaciona la evidencia con la revisión de seguridad de hábitats tripulados.',
    icon: Activity
  },
  {
    href: '#next-gen-safety',
    title: 'Seguridad de nueva generación',
    description: 'Explora conceptos propuestos y distínguelos de las prácticas establecidas.',
    icon: Atom
  },
  {
    href: '#earth-applications',
    title: 'Aplicaciones terrestres',
    description: 'Revisa posibles aplicaciones terrestres y sus limitaciones.',
    icon: Globe
  },
  {
    href: '#assistant',
    title: 'Asistente de IA IGNIS',
    description: 'Consulta la colección científica local y revisa la evidencia.',
    icon: BrainCircuit
  }
]

function HeroModelPreview() {
  return (
    <div className="hero-model-preview" role="img" aria-label="Vista esquemática de una llama esférica en microgravedad">
      <div className="hero-orbit hero-orbit-a" />
      <div className="hero-orbit hero-orbit-b" />
      <div className="hero-core"><Flame size={62} strokeWidth={1.2} /></div>
      <span className="hero-preview-status">INICIANDO VISTA 3D INTERACTIVA</span>
    </div>
  )
}

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
  const [heroModelReady, setHeroModelReady] = React.useState(false)

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

  React.useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const idleHandle = window.requestIdleCallback(() => setHeroModelReady(true), { timeout: 1400 })
      return () => window.cancelIdleCallback?.(idleHandle)
    }

    const timeoutHandle = window.setTimeout(() => setHeroModelReady(true), 650)
    return () => window.clearTimeout(timeoutHandle)
  }, [])

  const knowledgeBase = status?.knowledge_base
  const ai = status?.ai
  const systemOnline = status?.status === 'operational'

  return (
    <section className="dashboard">
      <div className="welcome">
        <div className="welcome-copy">
          <div className="eyebrow">
            <span className={`status-dot ${loading ? '' : systemOnline ? '' : 'status-dot-warning'}`} />
            {loading ? 'CONTROL DE MISIÓN · CONECTANDO' : systemOnline ? 'CONTROL DE MISIÓN · OPERATIVO' : 'CONTROL DE MISIÓN · SIN CONEXIÓN'}
          </div>
          <h2>Inteligencia para la investigación y la seguridad</h2>
          <p>
            Relaciona la investigación sobre combustión en gravedad reducida con preguntas
            sobre seguridad en hábitats espaciales, basadas en evidencia.
          </p>
          <div className="welcome-actions">
            <a className="welcome-primary-action" href="#experiments-lab">
              Explorar experimentos 3D <ArrowRight size={15} />
            </a>
            <a className="welcome-secondary-action" href="#research">
              Consultar evidencia científica <ArrowRight size={14} />
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-grid" />
          {heroModelReady ? (
            <Suspense fallback={<HeroModelPreview />}>
              <DashboardHeroVisual />
            </Suspense>
          ) : <HeroModelPreview />}
          <span className="hero-coordinate coordinate-one">MICROGRAVEDAD // INVESTIGACIÓN</span>
          <span className="hero-coordinate coordinate-two">ESQUEMA · NO VALIDADO</span>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h3>Estado del sistema</h3>
          <p>Estado actual informado por el backend de IGNIS</p>
        </div>
        <div className="dashboard-status-actions">
          <span className={`live-label ${systemOnline ? '' : 'live-label-warning'}`}>
            <span className={`status-dot ${systemOnline ? '' : 'status-dot-warning'}`} />
            {loading ? 'CONSULTANDO' : systemOnline ? 'OPERATIVO' : 'DEGRADADO'}
          </span>
          <button
            className="icon-button"
            type="button"
            aria-label="Actualizar el estado del sistema"
            onClick={() => refresh()}
            disabled={loading}
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>

      {error && (
        <div className="inline-error" role="alert">
          <strong>Servicio local de IGNIS no disponible</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="metrics-grid">
        <MetricCard
          icon={FileText}
          label="DOCUMENTOS INDEXADOS"
          value={knowledgeBase?.documents ?? '—'}
          detail="Fuentes distintas en ChromaDB"
          loading={loading}
        />
        <MetricCard
          icon={ChartNoAxesCombined}
          label="FRAGMENTOS CIENTÍFICOS"
          value={knowledgeBase?.chunks?.toLocaleString() ?? '—'}
          detail="Almacenados en la colección activa"
          loading={loading}
        />
        <MetricCard
          icon={Database}
          label="COLECCIÓN VECTORIAL"
          value={knowledgeBase?.collection ?? '—'}
          detail={knowledgeBase?.status === 'online' ? 'Conectada' : 'Sin conexión'}
          loading={loading}
        />
        <MetricCard
          icon={BrainCircuit}
          label="MODELO DE IA LOCAL"
          value={ai?.available ? 'EN LÍNEA' : ({
            offline: 'SIN CONEXIÓN',
            model_missing: 'MODELO NO DISPONIBLE',
            configuration_missing: 'FALTA CONFIGURACIÓN',
            configuration_error: 'ERROR DE CONFIGURACIÓN',
            error: 'ERROR'
          }[ai?.status] ?? '—')}
          detail={ai?.model ?? 'Estado del modelo no disponible'}
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
              <h3>Módulos de misión</h3>
              <p>De la evidencia a sus aplicaciones en seguridad</p>
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
              <h3>Ruta de investigación a seguridad</h3>
              <p>Flujo de trabajo de IGNIS</p>
            </div>
            <Activity size={20} />
          </div>
          <div className="mission-flow" aria-label="De la literatura científica a la evidencia y el contexto de seguridad">
            <span>Literatura</span><i aria-hidden="true" />
            <span>Evidencia</span><i aria-hidden="true" />
            <span>Contexto de seguridad</span>
          </div>
          <p className="mission-flow-note">
            Esta ruta facilita la exploración; no calcula probabilidades de incendio
            ni certifica sistemas de hábitat.
          </p>
        </section>
      </div>

      <footer className="dashboard-footer">
        <span>IGNIS · INTELIGENCIA CIENTÍFICA</span>
        <span>LLAMA EN CAÍDA LIBRE · DESAFÍO NASA SPACE APPS 2026</span>
      </footer>
    </section>
  )
}
