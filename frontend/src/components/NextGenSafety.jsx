import React from 'react'
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Cpu,
  Database,
  FlaskConical,
  Radio,
  ShieldCheck,
  UserRound
} from 'lucide-react'

const architecture = [
  {
    title: 'Señales ambientales',
    detail: 'Define qué mediciones, frecuencias de muestreo y condiciones operativas necesitaría un sistema futuro.',
    icon: Radio
  },
  {
    title: 'Evidencia científica',
    detail: 'Vincula los documentos fuente, las páginas y el contexto experimental con cada hallazgo recuperado.',
    icon: Database
  },
  {
    title: 'Modelos predictivos',
    detail: 'Todo modelo predictivo requeriría una validación independiente con datos pertinentes; IGNIS no ejecuta ni valida ninguno.',
    icon: Cpu
  },
  {
    title: 'Apoyo a decisiones',
    detail: 'Presenta evidencia e incertidumbre para que las revise una persona; no tomes decisiones de seguridad de forma autónoma.',
    icon: BrainCircuit
  },
  {
    title: 'Autoridad de la tripulación',
    detail: 'Los equipos responsables de la misión deben establecer y validar cualquier procedimiento operativo.',
    icon: UserRound
  }
]

export default function NextGenSafety() {
  const [selected, setSelected] = React.useState(0)
  const activeItem = architecture[selected]
  const ActiveIcon = activeItem.icon

  return (
    <section className="module-page">
      <div className="module-page-header nextgen-header">
        <div className="eyebrow"><span className="status-dot" /> SISTEMAS DE SEGURIDAD FUTUROS</div>
        <h2>Seguridad de nueva generación</h2>
        <p>Una arquitectura propuesta, basada en evidencia, que relaciona la detección, el contexto científico y las decisiones humanas.</p>
      </div>

      <nav className="experience-links nextgen-experience-links" aria-label="Módulos de IGNIS relacionados">
        <a href="#research"><BookOpen size={14} /> Consultar la base científica <ArrowRight size={13} /></a>
        <a href="#experiments-lab"><FlaskConical size={14} /> Revisar experimentos documentados <ArrowRight size={13} /></a>
        <a href="#habitat-safety"><ShieldCheck size={14} /> Abrir la revisión de seguridad del hábitat <ArrowRight size={13} /></a>
      </nav>

      <section className="architecture-panel">
        <div className="architecture-heading">
          <div>
            <span className="panel-kicker">CONCEPTO DE DISEÑO DE IGNIS</span>
            <h3>Del contexto ambiental a la evidencia revisada por la tripulación</h3>
          </div>
          <span className="concept-badge">PROPUESTO · NO VALIDADO</span>
        </div>

        <div className="architecture-flow">
          {architecture.map((item, index) => {
            const Icon = item.icon
            return (
              <React.Fragment key={item.title}>
                <button
                  type="button"
                  className={`architecture-node ${selected === index ? 'selected' : ''}`}
                  aria-pressed={selected === index}
                  onClick={() => setSelected(index)}
                >
                  <Icon size={20} />
                  <span>{item.title}</span>
                </button>
                {index < architecture.length - 1 && <ArrowDown className="architecture-arrow" size={17} aria-hidden="true" />}
              </React.Fragment>
            )
          })}
        </div>

        <div className="architecture-detail" aria-live="polite">
          <span className="architecture-detail-icon"><ActiveIcon size={22} /></span>
          <div>
            <span className="panel-kicker">COMPONENTE CONCEPTUAL {String(selected + 1).padStart(2, '0')}</span>
            <h4>{activeItem.title}</h4>
            <p>{activeItem.detail}</p>
          </div>
        </div>
      </section>

      <div className="maturity-key">
        <span className="maturity-key-item evidence"><i /> Demostrado: solo cuando lo documenta una fuente</span>
        <span className="maturity-key-item"><i /> En desarrollo: verificar el estado en la fuente</span>
        <span className="maturity-key-item concept"><i /> Concepto: propuesta de IGNIS mostrada arriba</span>
        <p>Este módulo presenta una arquitectura propuesta; la fusión de sensores, los modelos predictivos y las recomendaciones automatizadas no se presentan como tecnología implementada ni calificada para vuelos.</p>
      </div>
    </section>
  )
}
