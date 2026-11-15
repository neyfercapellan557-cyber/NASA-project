import React from 'react'
import { ArrowDown, ArrowLeftRight, ArrowRight, BookOpen, ExternalLink, Flame, FlaskConical, Wind } from 'lucide-react'

import { getDocumentUrl } from '../api'

const guideFile = 'np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf'

function FlameComparison({ view, mechanism }) {
  const transportView = view === 'transport'

  return (
    <div className={`combustion-diagram ${transportView ? 'transport-view' : 'morphology-view'}`}>
      <div className="diagram-case">
        <div className="diagram-title"><strong>1 g</strong><span>Gravedad terrestre</span></div>
        <svg viewBox="0 0 280 250" role="img" aria-label="Esquema cualitativo de una llama con flujo ascendente por flotabilidad">
          <defs>
            <marker id="arrow-earth" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0 0L7 3.5L0 7Z" fill="#35cddd" />
            </marker>
            <radialGradient id="earth-flame-gradient">
              <stop offset="0" stopColor="#ffe4a0" />
              <stop offset=".62" stopColor="#ff8959" />
              <stop offset="1" stopColor="#ff8959" stopOpacity=".12" />
            </radialGradient>
          </defs>
          <path className="diagram-streamline" d="M58 208C42 165 73 145 63 108" markerEnd="url(#arrow-earth)" />
          <path className="diagram-streamline" d="M220 208C238 167 207 140 218 101" markerEnd="url(#arrow-earth)" />
          {transportView ? (
            <>
              <path className={`diagram-flow-arrow ${mechanism === 'buoyancy' ? 'mechanism-highlight' : ''}`} d="M140 183V70" markerEnd="url(#arrow-earth)" />
              <path className={`diagram-flow-arrow ${mechanism === 'buoyancy' ? 'mechanism-highlight' : ''}`} d="M108 184V111" markerEnd="url(#arrow-earth)" />
              <path className={`diagram-flow-arrow ${mechanism === 'buoyancy' ? 'mechanism-highlight' : ''}`} d="M173 184V106" markerEnd="url(#arrow-earth)" />
              <text className="diagram-label" x="140" y="53" textAnchor="middle">flujo ascendente</text>
            </>
          ) : (
            <path className="diagram-flame" d="M140 193C111 169 118 139 133 119C148 99 143 80 136 65C175 91 187 126 168 160C162 173 152 184 140 193Z" fill="url(#earth-flame-gradient)" />
          )}
          <rect className="diagram-burner" x="116" y="194" width="48" height="14" rx="3" />
          <text className="diagram-label" x="140" y="232" textAnchor="middle">combustible + oxidante</text>
        </svg>
        <p>La flotabilidad puede impulsar convección natural y deformar el flujo alrededor de la llama.</p>
      </div>

      <div className="diagram-case">
        <div className="diagram-title"><strong>μg</strong><span>Microgravedad</span></div>
        <svg viewBox="0 0 280 250" role="img" aria-label="Esquema cualitativo de una llama aproximadamente esférica y transporte por difusión o flujo forzado">
          <defs>
            <marker id="arrow-micro" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0 0L7 3.5L0 7Z" fill="#ff9a70" />
            </marker>
            <radialGradient id="micro-flame-gradient">
              <stop offset="0" stopColor="#ffbb74" stopOpacity=".18" />
              <stop offset=".68" stopColor="#ff8959" stopOpacity=".64" />
              <stop offset="1" stopColor="#35cddd" stopOpacity=".24" />
            </radialGradient>
          </defs>
          {transportView ? (
            <>
              <circle className={`diagram-diffusion-ring ${mechanism === 'diffusion' ? 'mechanism-highlight' : ''}`} cx="140" cy="122" r="52" />
              <path className={`diagram-flow-arrow ${mechanism === 'ventilation' ? 'mechanism-highlight' : ''}`} d="M140 48V82" markerEnd="url(#arrow-micro)" />
              <path className={`diagram-flow-arrow ${mechanism === 'ventilation' ? 'mechanism-highlight' : ''}`} d="M214 122H180" markerEnd="url(#arrow-micro)" />
              <path className={`diagram-flow-arrow ${mechanism === 'ventilation' ? 'mechanism-highlight' : ''}`} d="M66 122H100" markerEnd="url(#arrow-micro)" />
              <path className={`diagram-flow-arrow ${mechanism === 'ventilation' ? 'mechanism-highlight' : ''}`} d="M140 196V162" markerEnd="url(#arrow-micro)" />
              <text className="diagram-label" x="140" y="220" textAnchor="middle">difusión + ventilación impuesta</text>
            </>
          ) : (
            <>
              <circle className="diagram-flame-halo" cx="140" cy="122" r="65" fill="url(#micro-flame-gradient)" />
              <circle className="diagram-flame-inner" cx="140" cy="122" r="38" />
              <circle className="diagram-fuel-core" cx="140" cy="122" r="10" />
              <text className="diagram-label" x="140" y="211" textAnchor="middle">ejemplo esquemático: llama esférica</text>
            </>
          )}
        </svg>
        <p>Al reducirse la flotabilidad, difusión y ventilación forzada pueden ser importantes; la geometría depende del experimento.</p>
      </div>
    </div>
  )
}

const phenomenonNotes = [
  {
    title: 'Flotabilidad',
    text: 'La guía de NASA describe la eliminación de la interacción compleja entre flujo boyante y realimentación de energía a la llama en experimentos de microgravedad.'
  },
  {
    title: 'Calor, oxígeno y difusión',
    text: 'NASA describe la combustión como un conjunto acoplado de fenómenos de transporte de calor y masa, junto con reacciones químicas. El transporte de oxígeno y otras especies debe interpretarse dentro de cada configuración experimental.'
  },
  {
    title: 'Ventilación y forma de la llama',
    text: 'El flujo forzado y las condiciones de contorno pueden cambiar la llama observada. Una llama esférica de difusión es una configuración de investigación, no una forma universal en microgravedad.'
  },
  {
    title: 'Formación de hollín',
    text: 'La guía de NASA identifica la producción de hollín como un tema de investigación en microgravedad. Esta interfaz no informa rendimientos de hollín ni tendencias de cambio.'
  }
]

const transportMechanisms = [
  {
    id: 'buoyancy',
    label: 'Flotabilidad',
    description: 'A 1 g, las diferencias de densidad pueden contribuir a la convección natural. Las flechas esquemáticas indican solo la dirección; no representan velocidades medidas.'
  },
  {
    id: 'diffusion',
    label: 'Difusión',
    description: 'Cuando se reduce el flujo impulsado por flotabilidad, el transporte molecular es un aspecto importante. El anillo es una señal conceptual, no un campo de concentración medido.'
  },
  {
    id: 'ventilation',
    label: 'Ventilación impuesta',
    description: 'El flujo forzado y las condiciones de contorno pueden influir en el transporte en cualquier entorno gravitatorio. Las flechas son ilustrativas y no constituyen una solución de flujo validada.'
  }
]

export default function CombustionExplorer() {
  const [view, setView] = React.useState('transport')
  const [mechanism, setMechanism] = React.useState('buoyancy')
  const activeMechanism = transportMechanisms.find((item) => item.id === mechanism)

  return (
    <section className="module-page">
      <div className="module-page-header combustion-header">
        <div className="eyebrow"><span className="status-dot" /> FÍSICA DE LA COMBUSTIÓN</div>
        <h2>Explorador de combustión</h2>
        <p>Compara el papel de la gravedad, el transporte y la configuración de la llama sin asumir una forma universal.</p>
      </div>

      <nav className="experience-links combustion-experience-links" aria-label="Experiencias de IGNIS relacionadas">
        <a href="#experiments-lab"><FlaskConical size={14} /> Explorar modelos 3D interactivos <ArrowRight size={13} /></a>
        <a href="#microgravity-lab"><ArrowLeftRight size={14} /> Comparar entornos gravitatorios <ArrowRight size={13} /></a>
        <a href="#research"><BookOpen size={14} /> Revisar evidencia de las fuentes <ArrowRight size={13} /></a>
      </nav>

      <section className="science-panel" aria-labelledby="combustion-comparison-title">
        <div className="science-panel-heading">
          <div>
            <span className="panel-kicker">COMPARACIÓN CUALITATIVA</span>
            <h3 id="combustion-comparison-title">La gravedad cambia el contexto del transporte</h3>
          </div>
          <div className="diagram-controls" role="group" aria-label="Seleccionar diagrama">
            <button type="button" className={view === 'morphology' ? 'selected' : ''} onClick={() => setView('morphology')}>
              <Flame size={15} /> Forma de la llama
            </button>
            <button type="button" className={view === 'transport' ? 'selected' : ''} onClick={() => setView('transport')}>
              <Wind size={15} /> Transporte
            </button>
          </div>
        </div>
        <FlameComparison view={view} mechanism={mechanism} />
        <div className="transport-explorer">
          <div className="transport-explorer-heading">
            <div>
              <span className="panel-kicker">EXPLORACIÓN CONCEPTUAL INTERACTIVA</span>
              <h4>Explora un mecanismo de transporte</h4>
            </div>
            <span className="concept-badge">CUALITATIVO · NO ES UNA SIMULACIÓN</span>
          </div>
          <div className="transport-mechanism-controls" role="group" aria-label="Resaltar un mecanismo de transporte">
            {transportMechanisms.map((item) => (
              <button
                type="button"
                key={item.id}
                className={mechanism === item.id ? 'selected' : ''}
                aria-pressed={mechanism === item.id}
                onClick={() => setMechanism(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="transport-mechanism-detail" aria-live="polite">
            {activeMechanism.description}
          </p>
        </div>
        <div className="diagram-caveat">
          <ArrowDown size={16} />
          <span>Solo esquemático: no está a escala ni es una gráfica de datos experimentales. IGNIS no dispone aquí de una serie de mediciones estandarizada. El comportamiento real depende del combustible, las condiciones de contorno, la radiación y la ventilación.</span>
        </div>
      </section>

      <div className="phenomenon-grid">
        {phenomenonNotes.map((item, index) => (
          <article className="phenomenon-card" key={item.title}>
            <span className="panel-kicker">0{index + 1} / EJE DE INVESTIGACIÓN</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      <a
        className="citation-link"
        href={getDocumentUrl(guideFile)}
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLink size={15} />
        Guía de investigación de la EEI de NASA · fuente indexada, págs. 3 y 9–11
      </a>
    </section>
  )
}
