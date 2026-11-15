import React from 'react'
import { AlertTriangle, ArrowRight, Check, ExternalLink, ShieldCheck } from 'lucide-react'

import { getDocumentUrl } from '../api'

const guideFile = 'np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf'

const scenarios = {
  station: {
    label: 'Crewed station',
    description: 'Review the specific vehicle configuration, ventilation state, materials, and crew procedures. No station-specific risk score is calculated here.'
  },
  surface: {
    label: 'Lunar / Martian habitat',
    description: 'Define habitat pressure, gravity, ventilation, materials, and mission assumptions before comparing evidence. This interface does not predict surface-habitat fire behavior.'
  },
  vehicle: {
    label: 'Pressurized vehicle',
    description: 'Scope the vehicle volume, operating mode, airflow, and crew response assumptions. Results must come from vehicle-specific analysis.'
  }
}

const reviewStages = [
  {
    id: 'prevention',
    label: 'Prevention',
    questions: [
      'Which ignition sources and material properties are documented for this scenario?',
      'What environmental conditions are recorded with the relevant experiment?',
      'Which assumptions still need vehicle-specific evidence?'
    ]
  },
  {
    id: 'detection',
    label: 'Detection',
    questions: [
      'How could the documented airflow configuration affect smoke transport?',
      'Which sensor location and response assumptions are supported by evidence?',
      'Are the measured signals specific to the tested fire and environment?'
    ]
  },
  {
    id: 'response',
    label: 'Response',
    questions: [
      'Which suppression method was actually tested in the cited source?',
      'What crew procedure and ventilation response are defined for this vehicle?',
      'What evidence is missing before operational decisions can be made?'
    ]
  }
]

export default function HabitatSafety() {
  const [scenario, setScenario] = React.useState('station')
  const [stage, setStage] = React.useState('prevention')
  const activeStage = reviewStages.find((item) => item.id === stage)

  return (
    <section className="module-page">
      <div className="module-page-header safety-header">
        <div className="eyebrow"><span className="status-dot" /> CREWED-SPACE SAFETY</div>
        <h2>Habitat Safety</h2>
        <p>Use a traceable review framework to connect combustion evidence with prevention, detection, and crew response questions.</p>
      </div>

      <section className="scenario-panel">
        <div className="scenario-panel-copy">
          <span className="panel-kicker">SCENARIO SCOPE</span>
          <h3>{scenarios[scenario].label}</h3>
          <p>{scenarios[scenario].description}</p>
        </div>
        <label className="scenario-select">
          <span>SELECT CONTEXT</span>
          <select value={scenario} onChange={(event) => setScenario(event.target.value)}>
            {Object.entries(scenarios).map(([id, item]) => (
              <option value={id} key={id}>{item.label}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="safety-review-panel">
        <div className="safety-review-heading">
          <div>
            <span className="panel-kicker">EVIDENCE REVIEW</span>
            <h3>Move through the safety questions</h3>
          </div>
          <ShieldCheck size={23} />
        </div>
        <div className="safety-pathway" role="group" aria-label="Conceptual safety review pathway">
          {reviewStages.map((item, index) => (
            <React.Fragment key={item.id}>
              <button
                type="button"
                aria-pressed={stage === item.id}
                className={stage === item.id ? 'selected' : ''}
                onClick={() => setStage(item.id)}
              >
                <span>0{index + 1}</span>
                <strong>
                  {item.id === 'prevention'
                    ? 'Hazard context'
                    : item.id === 'detection'
                      ? 'Detection & monitoring'
                      : 'Response review'}
                </strong>
              </button>
              {index < reviewStages.length - 1 && <ArrowRight className="safety-pathway-arrow" size={16} aria-hidden="true" />}
            </React.Fragment>
          ))}
        </div>
        <div className="review-questions" role="region" aria-live="polite" aria-label={`${activeStage.label} review questions`}>
          {activeStage.questions.map((question) => (
            <div className="review-question" key={question}>
              <Check size={17} />
              <p>{question}</p>
            </div>
          ))}
        </div>
        <div className="safety-disclaimer">
          <AlertTriangle size={17} />
          <p>These are analysis prompts, not emergency instructions or a validated risk assessment.</p>
        </div>
      </section>

      <a
        className="citation-link"
        href={getDocumentUrl(guideFile)}
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLink size={15} />
        NASA ISS Researcher’s Guide · indexed source, pp. 9–10
      </a>
    </section>
  )
}
