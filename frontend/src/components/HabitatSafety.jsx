import React from 'react'
import { Activity, AlertTriangle, ArrowRight, Check, ExternalLink, Flame, ShieldCheck } from 'lucide-react'

import { getDocumentUrl } from '../api'

const guideFile = 'np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf'

const scenarios = {
  station: {
    label: 'Estación tripulada',
    description: 'Revisa la configuración específica del vehículo, la ventilación, los materiales y los procedimientos de la tripulación. Aquí no se calcula un nivel de riesgo para una estación concreta.'
  },
  surface: {
    label: 'Hábitat lunar o marciano',
    description: 'Define la presión, la gravedad, la ventilación, los materiales y los supuestos de la misión antes de comparar evidencia. Esta interfaz no predice el comportamiento del fuego en hábitats de superficie.'
  },
  vehicle: {
    label: 'Vehículo presurizado',
    description: 'Delimita el volumen del vehículo, el modo de operación, el flujo de aire y los supuestos de respuesta de la tripulación. Los resultados deben proceder de un análisis específico del vehículo.'
  }
}

const reviewStages = [
  {
    id: 'prevention',
    label: 'Prevención',
    questions: [
      '¿Qué fuentes de ignición y propiedades de materiales están documentadas para este escenario?',
      '¿Qué condiciones ambientales se registraron en el experimento pertinente?',
      '¿Qué supuestos aún necesitan evidencia específica del vehículo?'
    ]
  },
  {
    id: 'detection',
    label: 'Detección',
    questions: [
      '¿Cómo podría afectar al transporte del humo la configuración de flujo de aire documentada?',
      '¿Qué evidencia respalda los supuestos sobre la ubicación y respuesta de los sensores?',
      '¿Las señales medidas corresponden específicamente al fuego y al entorno ensayados?'
    ]
  },
  {
    id: 'response',
    label: 'Respuesta',
    questions: [
      '¿Qué método de supresión se ensayó realmente en la fuente citada?',
      '¿Qué procedimiento de la tripulación y respuesta de ventilación se definen para este vehículo?',
      '¿Qué evidencia falta antes de tomar decisiones operativas?'
    ]
  }
]

const stageRelationships = {
  prevention: {
    nodes: ['Fuente de ignición', 'Material / combustible', 'Entorno'],
    note: 'Define el contexto documentado del peligro antes de sacar conclusiones sobre las medidas de prevención.'
  },
  detection: {
    nodes: ['Señal del peligro', 'Ubicación del sensor', 'Condiciones registradas'],
    note: 'Interpreta la evidencia de detección junto con la configuración ensayada; esta ruta no modela la respuesta de los sensores.'
  },
  response: {
    nodes: ['Suceso observado', 'Método ensayado', 'Procedimiento de la tripulación'],
    note: 'Separa las observaciones experimentales de los procedimientos propuestos y de las decisiones operativas específicas del vehículo.'
  }
}

export default function HabitatSafety() {
  const [scenario, setScenario] = React.useState('station')
  const [stage, setStage] = React.useState('prevention')
  const activeStage = reviewStages.find((item) => item.id === stage)
  const activeRelationship = stageRelationships[stage]

  return (
    <section className="module-page">
      <div className="module-page-header safety-header">
        <div className="eyebrow"><span className="status-dot" /> SEGURIDAD EN VUELOS TRIPULADOS</div>
        <h2>Seguridad del hábitat</h2>
        <p>Usa un marco de revisión trazable para relacionar la evidencia sobre combustión con preguntas de prevención, detección y respuesta de la tripulación.</p>
      </div>

      <section className="scenario-panel">
        <div className="scenario-panel-copy">
          <span className="panel-kicker">ALCANCE DEL ESCENARIO</span>
          <h3>{scenarios[scenario].label}</h3>
          <p>{scenarios[scenario].description}</p>
        </div>
        <label className="scenario-select">
          <span>SELECCIONAR CONTEXTO</span>
          <select value={scenario} onChange={(event) => setScenario(event.target.value)}>
            {Object.entries(scenarios).map(([id, item]) => (
              <option value={id} key={id}>{item.label}</option>
            ))}
          </select>
        </label>
      </section>

      <nav className="experience-links safety-module-links" aria-label="Módulos de IGNIS relacionados">
        <a href="#digital-twin"><Activity size={14} /> Explorar zonas del hábitat <ArrowRight size={13} /></a>
        <a href="#experiments-lab"><Flame size={14} /> Consultar experimentos sobre fuego <ArrowRight size={13} /></a>
        <a href="#research"><ExternalLink size={14} /> Buscar investigación de apoyo <ArrowRight size={13} /></a>
      </nav>

      <section className="safety-review-panel">
        <div className="safety-review-heading">
          <div>
            <span className="panel-kicker">REVISIÓN DE EVIDENCIA</span>
            <h3>Recorre las preguntas de seguridad</h3>
          </div>
          <ShieldCheck size={23} />
        </div>
        <div className="safety-pathway" role="group" aria-label="Ruta conceptual de revisión de seguridad">
          {reviewStages.map((item, index) => (
            <React.Fragment key={item.id}>
              <button
                type="button"
                aria-pressed={stage === item.id}
                className={stage === item.id ? 'selected' : ''}
                onClick={() => setStage(item.id)}
              >
                <span className="safety-pathway-number">0{index + 1}</span>
                <strong>{item.label}</strong>
                <small>{stageRelationships[item.id].nodes.join(' → ')}</small>
              </button>
              {index < reviewStages.length - 1 && <ArrowRight className="safety-pathway-arrow" size={16} aria-hidden="true" />}
            </React.Fragment>
          ))}
        </div>
        <div className="safety-map-detail" aria-live="polite">
          <span className="panel-kicker">RELACIÓN DE EVIDENCIA ACTIVA · {activeStage.label.toUpperCase()}</span>
          <div className="safety-map-nodes">
            {activeRelationship.nodes.map((node, index) => (
              <React.Fragment key={node}>
                <span>{node}</span>
                {index < activeRelationship.nodes.length - 1 && <ArrowRight size={13} aria-hidden="true" />}
              </React.Fragment>
            ))}
          </div>
          <p>{activeRelationship.note}</p>
        </div>
        <div className="review-questions" role="region" aria-live="polite" aria-label={`Preguntas de revisión: ${activeStage.label}`}>
          {activeStage.questions.map((question) => (
            <div className="review-question" key={question}>
              <Check size={17} />
              <p>{question}</p>
            </div>
          ))}
        </div>
        <div className="safety-disclaimer">
          <AlertTriangle size={17} />
          <p>Estas preguntas orientan el análisis; no son instrucciones de emergencia ni una evaluación de riesgos validada.</p>
        </div>
      </section>

      <a
        className="citation-link"
        href={getDocumentUrl(guideFile)}
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLink size={15} />
        Guía de investigación de la EEI de NASA · fuente indexada, págs. 9–10
      </a>
    </section>
  )
}
