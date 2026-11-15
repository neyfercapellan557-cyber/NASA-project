import React from 'react'
import { ArrowDown, ExternalLink, Flame, Wind } from 'lucide-react'

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
    title: 'Heat, oxygen, and diffusion',
    text: 'NASA frames combustion as coupled heat- and mass-transport phenomena with chemistry. Oxygen and species transport must be interpreted within the specific experimental setup.'
  },
  {
    title: 'Ventilation and flame form',
    text: 'Forced flow and boundary conditions can change the observed flame. A spherical diffusion flame is one research configuration, not a universal microgravity shape.'
  },
  {
    title: 'Soot formation',
    text: 'The NASA guide identifies soot production as a microgravity research topic. This interface reports no soot yield or direction of change.'
  }
]

const transportMechanisms = [
  {
    id: 'buoyancy',
    label: 'Buoyancy',
    description: 'At 1 g, density differences can contribute to natural convection. The schematic arrows indicate direction only; they do not represent measured velocity.'
  },
  {
    id: 'diffusion',
    label: 'Diffusion',
    description: 'With buoyancy-driven flow reduced, molecular transport is an important consideration. The ring is a conceptual cue, not a measured concentration field.'
  },
  {
    id: 'ventilation',
    label: 'Imposed ventilation',
    description: 'Forced flow and boundary conditions can shape transport in either gravity environment. The arrows are illustrative and are not a validated flow solution.'
  }
]

export default function CombustionExplorer() {
  const [view, setView] = React.useState('transport')
  const [mechanism, setMechanism] = React.useState('buoyancy')
  const activeMechanism = transportMechanisms.find((item) => item.id === mechanism)

  return (
    <section className="module-page">
      <div className="module-page-header combustion-header">
        <div className="eyebrow"><span className="status-dot" /> COMBUSTION PHYSICS</div>
        <h2>Combustion Explorer</h2>
        <p>Compare the roles of gravity, transport, and flame configuration without implying a universal flame shape.</p>
      </div>

      <section className="science-panel" aria-labelledby="combustion-comparison-title">
        <div className="science-panel-heading">
          <div>
            <span className="panel-kicker">QUALITATIVE COMPARISON</span>
            <h3 id="combustion-comparison-title">Gravity changes the transport context</h3>
          </div>
          <div className="diagram-controls" role="group" aria-label="Select diagram">
            <button type="button" className={view === 'morphology' ? 'selected' : ''} onClick={() => setView('morphology')}>
              <Flame size={15} /> Flame form
            </button>
            <button type="button" className={view === 'transport' ? 'selected' : ''} onClick={() => setView('transport')}>
              <Wind size={15} /> Transport
            </button>
          </div>
        </div>
        <FlameComparison view={view} mechanism={mechanism} />
        <div className="transport-explorer">
          <div className="transport-explorer-heading">
            <div>
              <span className="panel-kicker">INTERACTIVE CONCEPT LENS</span>
              <h4>Explore a transport mechanism</h4>
            </div>
            <span className="concept-badge">QUALITATIVE · NOT A SIMULATION</span>
          </div>
          <div className="transport-mechanism-controls" role="group" aria-label="Highlight a transport mechanism">
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
          <span>Schematic only — not to scale and not an experimental data plot. IGNIS has no standardized measured series to chart here. Real behavior depends on fuel, boundary conditions, radiation, and ventilation.</span>
        </div>
      </section>

      <div className="phenomenon-grid">
        {phenomenonNotes.map((item, index) => (
          <article className="phenomenon-card" key={item.title}>
            <span className="panel-kicker">0{index + 1} / RESEARCH LENS</span>
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
        NASA ISS Researcher’s Guide · indexed source, pp. 3, 9–11
      </a>
    </section>
  )
}
