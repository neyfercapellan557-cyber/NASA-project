import React from 'react'
import { ArrowRight, ExternalLink, Globe2 } from 'lucide-react'

import { getDocumentUrl } from '../api'

const guideFile = 'np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf'

const pathways = [
  {
    title: 'Combustion models',
    evidence: 'The NASA guide describes ISS experiments as benchmark data that researchers can use to develop, improve, and validate combustion models.',
    page: '13',
    opportunity: 'Compare model behavior against documented experimental conditions before applying it to an Earth system.'
  },
  {
    title: 'Flame spread and soot',
    evidence: 'The guide reports improvements in the ability to model flame spread and predict soot production from prior microgravity combustion research.',
    page: '11',
    opportunity: 'Use these research themes to frame further studies; this interface does not quantify a benefit or predict an outcome.'
  },
  {
    title: 'Energy and environment',
    evidence: 'The guide situates combustion research in terrestrial energy uses and describes associated environmental hazards.',
    page: '8',
    opportunity: 'Treat cross-sector relevance as a research question, not proof that a space result transfers unchanged to Earth.'
  }
]

export default function EarthApplications() {
  const [selected, setSelected] = React.useState(0)
  const item = pathways[selected]

  return (
    <section className="module-page">
      <div className="module-page-header earth-header">
        <div className="eyebrow"><span className="status-dot" /> SPACE-TO-EARTH RESEARCH</div>
        <h2>Earth Applications</h2>
        <p>Trace cautious pathways from fundamental combustion research to questions relevant to terrestrial systems.</p>
      </div>

      <section className="earth-pathway-panel">
        <div className="earth-pathway-heading">
          <div>
            <span className="panel-kicker">POTENTIAL KNOWLEDGE TRANSFER</span>
            <h3>Research insight is not an automatic application</h3>
          </div>
          <Globe2 size={26} />
        </div>

        <div className="earth-pathway-steps" aria-label="Research transfer pathway">
          <span>Microgravity evidence</span><ArrowRight size={17} />
          <span>Model or mechanism</span><ArrowRight size={17} />
          <span>Earth research question</span>
        </div>

        <div className="earth-topic-tabs" role="tablist" aria-label="Potential application area">
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
          <span className="panel-kicker">SOURCE EVIDENCE · NASA GUIDE P. {item.page}</span>
          <p className="earth-evidence">{item.evidence}</p>
          <div className="earth-opportunity">
            <span>POTENTIAL RESEARCH CONNECTION</span>
            <p>{item.opportunity}</p>
          </div>
        </article>
      </section>

      <p className="science-disclaimer">
        Transferability depends on fuel, geometry, pressure, ventilation, and other boundary conditions.
        No environmental or industrial performance claims are made here.
      </p>

      <a
        className="citation-link"
        href={getDocumentUrl(guideFile)}
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLink size={15} />
        NASA ISS Researcher’s Guide · indexed source, pp. 8, 11, 13
      </a>
    </section>
  )
}
