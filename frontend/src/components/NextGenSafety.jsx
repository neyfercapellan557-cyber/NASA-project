import React from 'react'
import {
  ArrowDown,
  BrainCircuit,
  Cpu,
  Database,
  Radio,
  UserRound
} from 'lucide-react'

const architecture = [
  {
    title: 'Environmental signals',
    detail: 'Define which measurements, sampling rates, and operating conditions a future system would need.',
    icon: Radio
  },
  {
    title: 'Research evidence',
    detail: 'Keep source documents, pages, and experimental context attached to each retrieved finding.',
    icon: Database
  },
  {
    title: 'Predictive models',
    detail: 'Any predictive model would require independent validation against relevant data; IGNIS does not run or validate one.',
    icon: Cpu
  },
  {
    title: 'Decision support',
    detail: 'Present evidence and uncertainty for human review; do not make autonomous safety decisions.',
    icon: BrainCircuit
  },
  {
    title: 'Crew authority',
    detail: 'Any operational procedure must be established and validated by the responsible mission teams.',
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
        <div className="eyebrow"><span className="status-dot" /> FUTURE SAFETY SYSTEMS</div>
        <h2>Next-Gen Safety</h2>
        <p>A proposed, evidence-first architecture for connecting sensing, research context, and human decisions.</p>
      </div>

      <section className="architecture-panel">
        <div className="architecture-heading">
          <div>
            <span className="panel-kicker">IGNIS DESIGN CONCEPT</span>
            <h3>From environmental context to crew-reviewed evidence</h3>
          </div>
          <span className="concept-badge">PROPOSED · NOT VALIDATED</span>
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
            <span className="panel-kicker">CONCEPT COMPONENT {String(selected + 1).padStart(2, '0')}</span>
            <h4>{activeItem.title}</h4>
            <p>{activeItem.detail}</p>
          </div>
        </div>
      </section>

      <div className="maturity-key">
        <span className="maturity-key-item evidence"><i /> Demonstrated: only when a source documents it</span>
        <span className="maturity-key-item"><i /> In development: verify status by source</span>
        <span className="maturity-key-item concept"><i /> Concept: IGNIS proposal shown above</span>
        <p>This module proposes an architecture; sensor fusion, predictive models, and automated recommendations are not represented as implemented or flight-qualified technology.</p>
      </div>
    </section>
  )
}
