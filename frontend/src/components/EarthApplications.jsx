import React from 'react'
import { ArrowRight, BookOpen, ExternalLink, FlaskConical, Globe2 } from 'lucide-react'

import { getDocumentUrl } from '../api'

const guideFile = 'np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf'

const pathways = [
  {
    title: 'Modelos de combustión',
    evidence: 'La guía de NASA describe los experimentos en la EEI como datos de referencia que pueden utilizarse para desarrollar, mejorar y validar modelos de combustión.',
    page: '13',
    opportunity: 'Compara el comportamiento del modelo con condiciones experimentales documentadas antes de aplicarlo a un sistema terrestre.'
  },
  {
    title: 'Propagación de llamas y hollín',
    evidence: 'La guía informa mejoras en la capacidad de modelar la propagación de llamas y predecir la producción de hollín a partir de investigaciones previas sobre combustión en microgravedad.',
    page: '11',
    opportunity: 'Usa estos temas como punto de partida para nuevas investigaciones; esta interfaz no cuantifica beneficios ni predice resultados.'
  },
  {
    title: 'Energía y medioambiente',
    evidence: 'La guía sitúa la investigación sobre combustión en el contexto del uso de energía en la Tierra y describe sus riesgos ambientales asociados.',
    page: '8',
    opportunity: 'Considera la relevancia entre sectores como una pregunta de investigación, no como prueba de que un resultado espacial se traslada sin cambios a la Tierra.'
  }
]

export default function EarthApplications() {
  const [selected, setSelected] = React.useState(0)
  const item = pathways[selected]

  return (
    <section className="module-page">
      <div className="module-page-header earth-header">
        <div className="eyebrow"><span className="status-dot" /> INVESTIGACIÓN ESPACIAL Y TERRESTRE</div>
        <h2>Aplicaciones terrestres</h2>
        <p>Explora con cautela cómo la investigación fundamental sobre combustión puede plantear preguntas relevantes para los sistemas terrestres.</p>
      </div>

      <nav className="experience-links earth-experience-links" aria-label="Módulos de IGNIS conectados">
        <a href="#research"><BookOpen size={14} /> Consultar fuentes primarias <ArrowRight size={13} /></a>
        <a href="#experiments-lab"><FlaskConical size={14} /> Comparar registros experimentales <ArrowRight size={13} /></a>
      </nav>

      <section className="earth-pathway-panel">
        <div className="earth-pathway-heading">
          <div>
            <span className="panel-kicker">POSIBLE TRANSFERENCIA DE CONOCIMIENTO</span>
            <h3>Un hallazgo de investigación no implica una aplicación automática</h3>
          </div>
          <Globe2 size={26} />
        </div>

        <div className="earth-pathway-steps" aria-label="Ruta de transferencia de la investigación">
          <span>Evidencia en microgravedad</span><ArrowRight size={17} />
          <span>Modelo o mecanismo</span><ArrowRight size={17} />
          <span>Pregunta de investigación terrestre</span>
        </div>

        <div className="earth-topic-tabs" role="tablist" aria-label="Área de aplicación potencial">
          {pathways.map((pathway, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={selected === index}
              className={selected === index ? 'selected' : ''}
              key={pathway.title}
              onClick={() => setSelected(index)}
            >
              {pathway.title}
            </button>
          ))}
        </div>

        <article className="earth-topic-detail" role="tabpanel" aria-live="polite">
          <span className="panel-kicker">EVIDENCIA DE LA FUENTE · GUÍA NASA, PÁG. {item.page}</span>
          <p className="earth-evidence">{item.evidence}</p>
          <div className="earth-opportunity">
            <span>POSIBLE VÍNCULO DE INVESTIGACIÓN</span>
            <p>{item.opportunity}</p>
          </div>
        </article>
      </section>

      <p className="science-disclaimer">
        La transferibilidad depende del combustible, la geometría, la presión, la ventilación y otras condiciones de contorno.
        Aquí no se afirma ningún beneficio ambiental ni rendimiento industrial.
      </p>

      <a
        className="citation-link"
        href={getDocumentUrl(guideFile)}
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLink size={15} />
        Guía de investigación de la EEI de NASA · fuente indexada, págs. 8, 11 y 13
      </a>
    </section>
  )
}
