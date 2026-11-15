import React from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ExternalLink,
  FileText,
  Flame,
  Search,
  SlidersHorizontal,
  Wind
} from 'lucide-react'

import { getDocumentUrl } from '../api'

const nasaImageBase = 'https://images-assets.nasa.gov/image'
const nasaVideoBase = 'https://images-assets.nasa.gov/video'

const experiments = [
  {
    id: 'flex',
    name: 'Flame Extinguishment Experiment (FLEX)',
    type: 'Droplet combustion study',
    organization: 'NASA Glenn Research Center',
    domain: 'Droplet combustion',
    year: '2015',
    dateContext: 'Test series: March 2009–December 2011 · report published 2015',
    location: 'Combustion Integrated Rack, Destiny laboratory, International Space Station',
    background: 'FLEX is a NASA program of droplet-combustion experiments in the ISS Combustion Integrated Rack, using the Multi-User Droplet Combustion Apparatus.',
    objective: 'Document droplet combustion behavior in microgravity and make experimental procedures and results available for further scientific interpretation.',
    methodology: 'NASA describes experiments using the Multi-User Droplet Combustion Apparatus (MDCA) inside the Combustion Integrated Rack. The cited technical publication documents the hardware, diagnostics, procedures, and analysis methods.',
    equipment: 'MDCA and Combustion Integrated Rack (CIR).',
    materials: 'Liquid-fuel droplets; the cited abstract does not identify fuel species.',
    findings: 'The NASA report presents data from the first 284 tests. Its abstract explicitly says the report makes the results available without interpreting them; this archive therefore does not add quantitative conclusions.',
    limitations: 'The cited report covers a defined test series and hardware configuration. Its abstract does not establish that the results apply to every fuel, droplet size, or spacecraft environment.',
    references: [
      {
        label: 'NASA NTRS · Detailed Results from the FLEX Experiment',
        url: 'https://ntrs.nasa.gov/citations/20150023456',
        kind: 'Technical publication · NASA/TP-2015-216046'
      }
    ],
    related: ['flex-2'],
    media: []
  },
  {
    id: 'flex-2',
    name: 'Flame Extinguishment Experiment-2 (FLEX-2)',
    type: 'Droplet combustion operations record',
    organization: 'NASA Glenn Research Center',
    domain: 'Droplet combustion',
    year: '2013',
    dateContext: 'NASA image record dated 10 April 2013; the caption says the test was scheduled, not that this photograph shows a test result.',
    location: 'Multi-User Droplet Combustion Apparatus in the Destiny laboratory, ISS',
    background: 'NASA’s image record identifies the MDCA fuel reservoirs as containing liquid fuel for droplet-combustion experiments.',
    objective: 'Investigate droplet combustion in microgravity using the MDCA; this entry is limited to the facts documented in the NASA operations photograph.',
    methodology: 'NASA documents an MDCA fuel-reservoir replacement with the chamber insert partially withdrawn, in support of FLEX-2. The image caption says execution was scheduled to be controlled from the ground.',
    equipment: 'MDCA fuel reservoirs and Chamber Insert Assembly.',
    materials: 'Liquid fuel is identified generically; its chemical composition is not specified in the cited image record.',
    findings: 'The cited source documents equipment servicing and planned operations only. It does not report experimental outcomes, so none are inferred here.',
    limitations: 'A preparation photograph is not evidence of a combustion observation. No FLEX-2 results are claimed in this record.',
    references: [
      {
        label: 'NASA Image and Video Library · MDCA reservoir service for FLEX-2',
        url: 'https://images.nasa.gov/details/iss035e017702',
        kind: 'NASA image record · 10 April 2013'
      }
    ],
    related: ['flex'],
    media: [
      {
        type: 'image',
        src: `${nasaImageBase}/iss035e017702/iss035e017702~medium.jpg`,
        alt: 'ISS crew member servicing the Multi-User Droplet Combustion Apparatus.',
        caption: 'MDCA fuel-reservoir service supporting FLEX-2; this is an operations image, not a flame-result image.',
        credit: 'NASA / NASA Image and Video Library · ISS035-E-017702',
        source: 'https://images.nasa.gov/details/iss035e017702'
      }
    ]
  },
  {
    id: 'saffire-i',
    name: 'Spacecraft Fire Experiment (Saffire-I)',
    type: 'Large-scale solid-material flammability test',
    organization: 'NASA Glenn Research Center',
    domain: 'Spacecraft fire safety',
    year: '2016',
    dateContext: 'NASA conference papers published in 2016 describe the program; the attached operations document is undated.',
    location: 'Cygnus cargo vehicle after it unberthed from the International Space Station',
    background: 'NASA developed Saffire to address knowledge gaps in spacecraft fire safety using material-flammability tests at spacecraft-relevant scales in low gravity.',
    objective: 'Study large-scale fire growth and low-gravity flammability in a spacecraft-relevant setting, as described in NASA’s Saffire program paper.',
    methodology: 'The operations document says Saffire-I started after Cygnus unberthing. Its large sample was approximately 0.4 m wide by 0.94 m tall; the experiment ran automatically, with recorded data compressed and downlinked before vehicle re-entry.',
    equipment: 'Saffire flight unit aboard Cygnus, experiment avionics, imaging/data recording, and spacecraft communications for downlink.',
    materials: 'A single combustible sample approximately 0.4 m wide by 0.94 m tall; the operations document does not identify its composition.',
    findings: 'The indexed operations document describes mission sequencing and data handling, not the measured fire outcomes. The linked NASA paper states the research objectives; no outcome is asserted here.',
    limitations: 'The operations document is a single-page protocol, not a results paper. The NASA photograph below documents ground processing, not an in-flight flame.',
    references: [
      {
        label: 'NASA NTRS · Operation and Development Status of the Saffire Experiments',
        url: 'https://ntrs.nasa.gov/citations/20170000230',
        kind: 'NASA conference paper · published 2016'
      },
      {
        label: 'SAFFIRE-I Operations · locally indexed source',
        url: getDocumentUrl('SAFFIRE-I Operations.pdf'),
        kind: 'Operational requirements and protocols · 1 page'
      }
    ],
    related: ['bass-ii'],
    media: [
      {
        type: 'image',
        src: `${nasaImageBase}/jsc2016e017570/jsc2016e017570~medium.jpg`,
        alt: 'Saffire-I hardware documented during the OA-6 Crew Equipment Interface Test.',
        caption: 'Preflight ground processing at Kennedy Space Center; not an image of the in-flight experiment.',
        credit: 'NASA Johnson Space Center · NASA ID jsc2016e017570',
        source: 'https://images.nasa.gov/details/jsc2016e017570'
      },
      {
        type: 'video',
        src: `${nasaVideoBase}/GRC-2021-CN-00008/GRC-2021-CN-00008~preview.mp4`,
        poster: `${nasaVideoBase}/GRC-2021-CN-00008/GRC-2021-CN-00008~large.jpg`,
        caption: 'Related program footage: a Saffire-V sample burn, not Saffire-I.',
        credit: 'NASA Glenn Research Center · NASA ID GRC-2021-CN-00008',
        source: 'https://images.nasa.gov/details/GRC-2021-CN-00008'
      }
    ]
  },
  {
    id: 'bass-ii',
    name: 'Burning and Suppression of Solids-II (BASS-II)',
    type: 'Solid-fuel burning and extinction experiment',
    organization: 'NASA Glenn Research Center',
    domain: 'Solid-material combustion',
    year: '2021',
    dateContext: 'NASA summary report published 2021; the abstract does not specify the flight-test year.',
    location: 'Microgravity Science Glovebox, International Space Station',
    background: 'BASS-II studied solid-fuel burning in a contained flow duct within the ISS Microgravity Science Glovebox.',
    objective: 'Characterize burning and extinction of solid samples in microgravity and inform spacecraft material-flammability screening.',
    methodology: 'NASA describes a contained flow duct, astronaut-operated ignition and fan controls, and video/still imaging. BASS-II varied ambient oxygen concentration, ventilation velocity, and fuel type, thickness, and geometry; onboard sensors recorded O₂, CO, and CO₂.',
    equipment: 'Microgravity Science Glovebox, BASS flow duct, cameras, CSA-CP gas analyzer, and Carbon Dioxide Monitor.',
    materials: 'Solid fuels with varied type, thickness, and geometry; the NASA abstract does not enumerate specific materials.',
    findings: 'The NASA summary reports that pre-/post-test O₂ and CO₂ changes compared well with stoichiometric ratios for a one-step gas-phase reaction. CO versus CO₂ followed a linear trend in some, but not all, tested fuel/flow datasets.',
    limitations: 'The reported trends were not universal across tested geometries and flows. They are findings from this apparatus and test matrix, not a general spacecraft fire model.',
    references: [
      {
        label: 'NASA NTRS · BASS-II Summary Report',
        url: 'https://ntrs.nasa.gov/citations/20210011385',
        kind: 'Technical memorandum · NASA Glenn Research Center · 2021'
      }
    ],
    related: ['saffire-i'],
    media: [
      {
        type: 'image',
        src: `${nasaImageBase}/iss040e086481/iss040e086481~medium.jpg`,
        alt: 'BASS-II flame test session conducted at reduced oxygen partial pressure aboard the ISS.',
        caption: 'BASS-II flame-test session with reduced oxygen partial pressure; NASA image metadata dates it 2 August 2014.',
        credit: 'NASA / Reid Wiseman · NASA ID iss040e086481',
        source: 'https://images.nasa.gov/details/iss040e086481'
      }
    ]
  }
]

const visualizers = [
  {
    id: 'flame',
    label: 'Microgravity flame',
    description: 'Explore how gravity and imposed ventilation define the transport context around a flame.',
    limitation: 'Arrows encode the selected input values only. Flame geometry is schematic; no flow field or flame response is calculated.',
    controls: ['gravity', 'ventilation']
  },
  {
    id: 'droplet',
    label: 'Droplet combustion',
    description: 'Inspect the relative geometry of a liquid-fuel droplet and its surrounding conceptual flame zone.',
    limitation: 'The droplet is drawn to a labeled screen scale. The surrounding ring is illustrative and does not predict burning rate or lifetime.',
    controls: ['diameter']
  },
  {
    id: 'solid',
    label: 'Solid-material spread',
    description: 'Change the displayed specimen thickness and inspect a conceptual flame-front arrangement.',
    limitation: 'The specimen is a diagram, not a material-specific spread calculation; no spread rate is reported.',
    controls: ['thickness']
  },
  {
    id: 'smoke',
    label: 'Smoke and products',
    description: 'Explore how an imposed ventilation vector can be represented around a contained combustion source.',
    limitation: 'Particle paths are decorative streamlines, not computed smoke trajectories, concentrations, or toxic-gas fields.',
    controls: ['ventilation', 'direction']
  },
  {
    id: 'extinction',
    label: 'Extinction context',
    description: 'Inspect the selected oxidizer fraction and pressure as independent experimental context variables.',
    limitation: 'No flammability or extinction threshold is plotted. A threshold depends on fuel, geometry, flow, pressure, and test method.',
    controls: ['oxygen', 'pressure']
  }
]

function ParameterSlider({ label, value, min, max, step, unit, onChange, help }) {
  return (
    <label className="lab-parameter">
      <span className="lab-parameter-heading">
        <span>{label}</span>
        <output>{value} {unit}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={`${label} (${unit})`}
      />
      {help && <small>{help}</small>}
    </label>
  )
}

function ConceptualVisualization({ visualizer, parameters }) {
  const gravityArrowLength = Math.max(0, parameters.gravity / 9.81 * 100)
  const ventilationArrowLength = 28 + parameters.ventilation / 0.5 * 110
  const dropletRadius = parameters.diameter * 13
  const sampleThickness = 7 + parameters.thickness * 4
  const oxygenPosition = ((parameters.oxygen - 12) / 12) * 100

  return (
    <div className={`lab-visualization lab-visualization-${visualizer.id}`}>
      <svg viewBox="0 0 520 300" role="img" aria-label={`${visualizer.label}: diagrama conceptual interactivo`}>
        <defs>
          <marker id="lab-arrow-cyan" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0 0L8 4L0 8Z" fill="#35cddd" />
          </marker>
          <radialGradient id="lab-flame-gradient">
            <stop offset="0" stopColor="#ffe4a0" />
            <stop offset=".58" stopColor="#ff8959" stopOpacity=".84" />
            <stop offset="1" stopColor="#ff8959" stopOpacity=".08" />
          </radialGradient>
        </defs>
        <rect className="lab-canvas-bg" x="0" y="0" width="520" height="300" rx="14" />
        <path className="lab-gridline" d="M40 60H480M40 120H480M40 180H480M40 240H480M100 30V270M200 30V270M300 30V270M400 30V270" />

        {visualizer.id === 'flame' && (
          <>
            <path className="lab-flame-halo" d="M258 222C219 191 235 151 252 126C268 102 258 80 255 67C296 98 313 139 296 177C288 197 273 213 258 222Z" fill="url(#lab-flame-gradient)" />
            <path className="lab-fuel-source" d="M224 227H292L280 244H236Z" />
            <path className="lab-input-arrow" d={`M360 225V${225 - gravityArrowLength}`} markerEnd="url(#lab-arrow-cyan)" />
            <path className="lab-input-arrow" d={`M${93 + ventilationArrowLength} 92H90`} markerEnd="url(#lab-arrow-cyan)" />
            <text className="lab-svg-label" x="369" y="80">g input</text>
            <text className="lab-svg-label" x="92" y="70">ventilation input</text>
            <text className="lab-svg-subtle" x="258" y="273" textAnchor="middle">flame silhouette fixed · not a predicted response</text>
          </>
        )}

        {visualizer.id === 'droplet' && (
          <>
            <circle className="lab-droplet-zone" cx="260" cy="150" r={dropletRadius + 37} />
            <circle className="lab-droplet" cx="260" cy="150" r={dropletRadius} />
            <path className="lab-dimension-line" d={`M${260 - dropletRadius} ${150 + dropletRadius + 23}H${260 + dropletRadius}`} />
            <text className="lab-svg-label" x="260" y="265" textAnchor="middle">droplet diameter · visual scale 13 px/mm</text>
          </>
        )}

        {visualizer.id === 'solid' && (
          <>
            <rect className="lab-specimen" x="88" y={180 - sampleThickness} width="344" height={sampleThickness} rx="3" />
            <path className="lab-flame-halo" d="M257 178C227 153 240 127 252 108C265 88 257 73 255 62C287 88 302 120 291 148C284 164 271 174 257 178Z" fill="url(#lab-flame-gradient)" />
            <path className="lab-dimension-line" d={`M449 ${180 - sampleThickness}V180`} />
            <text className="lab-svg-label" x="260" y="235" textAnchor="middle">schematic solid sample</text>
            <text className="lab-svg-subtle" x="260" y="257" textAnchor="middle">front location is illustrative, not a spread result</text>
          </>
        )}

        {visualizer.id === 'smoke' && (
          <>
            <rect className="lab-fuel-source" x="230" y="168" width="60" height="44" rx="5" />
            <circle className="lab-smoke-particle" cx="260" cy="145" r="7" />
            <circle className="lab-smoke-particle" cx="230" cy="115" r="5" />
            <circle className="lab-smoke-particle" cx="286" cy="101" r="6" />
            <circle className="lab-smoke-particle" cx="253" cy="75" r="4" />
            <path className="lab-streamline" d={parameters.direction === 'axial' ? 'M180 98H340M190 125H330M200 152H320' : 'M260 210V75M230 205V92M290 205V92'} />
            <path
              className="lab-input-arrow"
              d={parameters.direction === 'axial'
                ? `M${420 - ventilationArrowLength} 55H420`
                : `M420 180V${180 - ventilationArrowLength}`}
              markerEnd="url(#lab-arrow-cyan)"
            />
            <text className="lab-svg-label" x="416" y="45" textAnchor="end">imposed ventilation</text>
            <text className="lab-svg-subtle" x="260" y="265" textAnchor="middle">illustrative paths · no concentration field</text>
          </>
        )}

        {visualizer.id === 'extinction' && (
          <>
            <rect className="lab-chamber" x="68" y="56" width="384" height="157" rx="12" />
            <path className="lab-flame-halo" d="M260 184C235 164 245 137 257 121C268 105 260 91 258 81C286 103 298 130 289 154C283 168 272 179 260 184Z" fill="url(#lab-flame-gradient)" />
            <text className="lab-svg-label" x="260" y="238" textAnchor="middle">flame symbol remains unchanged</text>
            <text className="lab-svg-subtle" x="260" y="260" textAnchor="middle">no threshold or extinction prediction is loaded</text>
            <path className="lab-gauge-track" d="M115 91H405" />
            <path className="lab-gauge-marker" d={`M${115 + oxygenPosition * 2.9} 81V101`} />
            <text className="lab-svg-subtle" x="115" y="75">oxidizer input range: 12–24 % vol</text>
          </>
        )}
      </svg>
    </div>
  )
}

function SimulationControls({ visualizer, parameters, onChange }) {
  const controls = {
    gravity: (
      <ParameterSlider
        key="gravity"
        label="Gravitational acceleration"
        value={parameters.gravity}
        min={0}
        max={9.81}
        step={0.1}
        unit="m/s²"
        onChange={(value) => onChange('gravity', value)}
        help="Reference range: 0 to standard Earth gravity."
      />
    ),
    ventilation: (
      <ParameterSlider
        key="ventilation"
        label="Imposed ventilation speed"
        value={parameters.ventilation}
        min={0}
        max={0.5}
        step={0.01}
        unit="m/s"
        onChange={(value) => onChange('ventilation', value)}
        help="The diagram scales an arrow to this input; it does not calculate flow."
      />
    ),
    diameter: (
      <ParameterSlider
        key="diameter"
        label="Droplet diameter"
        value={parameters.diameter}
        min={0.5}
        max={5}
        step={0.1}
        unit="mm"
        onChange={(value) => onChange('diameter', value)}
        help="Screen circle uses a fixed visual scale, not apparatus dimensions."
      />
    ),
    thickness: (
      <ParameterSlider
        key="thickness"
        label="Displayed specimen thickness"
        value={parameters.thickness}
        min={1}
        max={10}
        step={0.5}
        unit="mm"
        onChange={(value) => onChange('thickness', value)}
        help="Only the specimen outline changes; no material response is computed."
      />
    ),
    direction: (
      <label className="lab-parameter">
        <span className="lab-parameter-heading"><span>Ventilation orientation</span></span>
        <select
          value={parameters.direction}
          onChange={(event) => onChange('direction', event.target.value)}
          aria-label="Ventilation orientation"
        >
          <option value="axial">Axial · horizontal diagram</option>
          <option value="transverse">Transverse · vertical diagram</option>
        </select>
      </label>
    ),
    oxygen: (
      <ParameterSlider
        key="oxygen"
        label="Oxidizer fraction"
        value={parameters.oxygen}
        min={12}
        max={24}
        step={0.1}
        unit="% vol"
        onChange={(value) => onChange('oxygen', value)}
        help="Shown as an input coordinate only; no flammability limit is assumed."
      />
    ),
    pressure: (
      <ParameterSlider
        key="pressure"
        label="Ambient pressure"
        value={parameters.pressure}
        min={70}
        max={110}
        step={1}
        unit="kPa"
        onChange={(value) => onChange('pressure', value)}
        help="Context variable only; no pressure-dependent threshold is calculated."
      />
    )
  }

  return <div className="lab-parameter-list">{visualizer.controls.map((key) => controls[key])}</div>
}

function SimulationLab() {
  const [activeId, setActiveId] = React.useState(visualizers[0].id)
  const [parameters, setParameters] = React.useState({
    gravity: 0.1,
    ventilation: 0.15,
    diameter: 2,
    thickness: 3,
    direction: 'axial',
    oxygen: 21,
    pressure: 101
  })
  const active = visualizers.find((item) => item.id === activeId)
  const activeIndex = visualizers.findIndex((item) => item.id === activeId)

  function updateParameter(key, value) {
    setParameters((current) => ({ ...current, [key]: value }))
  }

  return (
    <section className="lab-simulations" aria-labelledby="lab-simulations-heading">
      <div className="lab-section-heading">
        <div>
          <span className="panel-kicker">INTERACTIVE CONCEPT MODELS</span>
          <h3 id="lab-simulations-heading">Explore the variables, not invented outcomes</h3>
        </div>
        <span className="lab-status-badge"><SlidersHorizontal size={13} /> CONCEPTUAL · NOT VALIDATED</span>
      </div>
      <p className="lab-section-intro">
        Each control updates a diagram or displays a selected condition. These visualizations are not numerical
        simulations and do not report measured experimental data.
      </p>

      <div className="lab-simulation-tabs" role="tablist" aria-label="Conceptual combustion visualizations">
        {visualizers.map((item) => (
          <button
            type="button"
            role="tab"
            key={item.id}
            id={`lab-tab-${item.id}`}
            aria-selected={activeId === item.id}
            aria-controls={`lab-panel-${item.id}`}
            className={activeId === item.id ? 'selected' : ''}
            onClick={() => setActiveId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        className="lab-simulation-panel"
        id={`lab-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`lab-tab-${active.id}`}
      >
        <div className="lab-simulation-copy">
          <span className="lab-simulation-number">
            {String(activeIndex + 1).padStart(2, '0')} / 05 · CONCEPT VIEW
          </span>
          <h4>{active.label}</h4>
          <p>{active.description}</p>
          <SimulationControls visualizer={active} parameters={parameters} onChange={updateParameter} />
        </div>
        <div className="lab-simulation-output">
          <ConceptualVisualization visualizer={active} parameters={parameters} />
          <div className="lab-output-note">
            <ArrowDown size={15} />
            <span>{active.limitation}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ExperimentCard({ experiment, selected, onOpen, onCompare }) {
  return (
    <article className="lab-experiment-card">
      <div className="lab-card-topline">
        <span>{experiment.domain}</span>
        <span className="lab-year">{experiment.year} · source year</span>
      </div>
      <h3>{experiment.name}</h3>
      <span className="lab-experiment-type">{experiment.type}</span>
      <p>{experiment.objective}</p>
      <div className="lab-card-meta">
        <span>{experiment.organization}</span>
        <span>{experiment.location}</span>
      </div>
      <div className="lab-card-actions">
        <button type="button" className="lab-open-button" onClick={onOpen}>
          Open experiment <ArrowRight size={14} />
        </button>
        <button
          type="button"
          className={`lab-compare-button ${selected ? 'selected' : ''}`}
          onClick={onCompare}
          aria-pressed={selected}
        >
          {selected ? <Check size={14} /> : <SlidersHorizontal size={14} />}
          {selected ? 'In comparison' : 'Compare'}
        </button>
      </div>
    </article>
  )
}

function ExperimentArchive({ onOpen }) {
  const [query, setQuery] = React.useState('')
  const [type, setType] = React.useState('all')
  const [domain, setDomain] = React.useState('all')
  const [organization, setOrganization] = React.useState('all')
  const [year, setYear] = React.useState('all')
  const [comparisonIds, setComparisonIds] = React.useState([])
  const [compareMessage, setCompareMessage] = React.useState('')

  const types = [...new Set(experiments.map((item) => item.type))]
  const domains = [...new Set(experiments.map((item) => item.domain))]
  const organizations = [...new Set(experiments.map((item) => item.organization))]
  const years = [...new Set(experiments.map((item) => item.year))].sort()
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = experiments.filter((item) => {
    const matchesQuery = !normalizedQuery
      || `${item.name} ${item.type} ${item.domain} ${item.organization} ${item.objective} ${item.location}`
        .toLowerCase()
        .includes(normalizedQuery)
    return matchesQuery
      && (type === 'all' || item.type === type)
      && (domain === 'all' || item.domain === domain)
      && (organization === 'all' || item.organization === organization)
      && (year === 'all' || item.year === year)
  })
  const compared = comparisonIds
    .map((id) => experiments.find((item) => item.id === id))
    .filter(Boolean)

  function toggleComparison(id) {
    setComparisonIds((current) => {
      if (current.includes(id)) {
        setCompareMessage('')
        return current.filter((item) => item !== id)
      }
      if (current.length >= 2) {
        setCompareMessage('Compare up to two experiments. Remove one selection before adding another.')
        return current
      }
      setCompareMessage('')
      return [...current, id]
    })
  }

  return (
    <section className="lab-archive" aria-labelledby="lab-archive-heading">
      <div className="lab-section-heading">
        <div>
          <span className="panel-kicker">SOURCE-VERIFIED RECORDS</span>
          <h3 id="lab-archive-heading">Real experiments and operational evidence</h3>
        </div>
        <span className="lab-record-count">{filtered.length} / {experiments.length} RECORDS</span>
      </div>
      <p className="lab-section-intro">
        Dates and findings below are limited to what the linked NASA records document. A source publication year
        is not presented as an experiment date.
      </p>

      <div className="lab-discovery-toolbar">
        <label className="lab-search">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, topic, objective..."
            aria-label="Search the experiment archive"
          />
        </label>
        <label className="lab-filter">
          <span>EXPERIMENT TYPE</span>
          <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter by experiment type">
            <option value="all">All experiment types</option>
            {types.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="lab-filter">
          <span>RESEARCH DOMAIN</span>
          <select value={domain} onChange={(event) => setDomain(event.target.value)} aria-label="Filter by research domain">
            <option value="all">All research domains</option>
            {domains.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="lab-filter">
          <span>ORGANIZATION</span>
          <select value={organization} onChange={(event) => setOrganization(event.target.value)} aria-label="Filter by organization">
            <option value="all">All organizations</option>
            {organizations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="lab-filter">
          <span>SOURCE YEAR</span>
          <select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filter by source year">
            <option value="all">All source years</option>
            {years.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      {compareMessage && <p className="lab-inline-message" role="status">{compareMessage}</p>}

      {filtered.length ? (
        <div className="lab-experiment-grid">
          {filtered.map((experiment) => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              selected={comparisonIds.includes(experiment.id)}
              onOpen={() => onOpen(experiment.id)}
              onCompare={() => toggleComparison(experiment.id)}
            />
          ))}
        </div>
      ) : (
        <div className="lab-empty-state">
          <Search size={22} />
          <h4>No experiments match these filters</h4>
          <p>Try a broader term or clear one of the filters.</p>
        </div>
      )}

      {compared.length > 0 && (
        <section className="lab-comparison" aria-labelledby="lab-comparison-heading">
          <div className="lab-comparison-heading">
            <div>
              <span className="panel-kicker">SIDE-BY-SIDE</span>
              <h4 id="lab-comparison-heading">Experiment comparison</h4>
            </div>
            <button type="button" onClick={() => setComparisonIds([])}>Clear comparison</button>
          </div>
          <div
            className="lab-comparison-table"
            role="table"
            aria-label="Selected experiments compared by metadata"
            style={{ '--comparison-columns': compared.length }}
          >
            <div className="lab-comparison-row lab-comparison-labels" role="row">
              <span role="columnheader">Property</span>
              {compared.map((item) => <strong key={item.id} role="columnheader">{item.name}</strong>)}
            </div>
            {[
              ['Experiment type', 'type'],
              ['Research domain', 'domain'],
              ['Organization', 'organization'],
              ['Source year context', 'dateContext'],
              ['Location', 'location'],
              ['Method', 'methodology'],
              ['Evidence in this record', 'findings']
            ].map(([label, key]) => (
              <div className="lab-comparison-row" role="row" key={key}>
                <span role="rowheader">{label}</span>
                {compared.map((item) => <p key={item.id} role="cell">{item[key]}</p>)}
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}

function ExperimentDetail({ experiment, onBack, onOpenRelated }) {
  const relatedExperiments = experiment.related
    .map((id) => experiments.find((item) => item.id === id))
    .filter(Boolean)

  return (
    <section className="lab-detail" aria-labelledby="lab-detail-title">
      <button type="button" className="lab-back-button" onClick={onBack}>
        <ArrowLeft size={15} /> Back to archive
      </button>
      <header className="lab-detail-header">
        <div className="lab-card-topline">
          <span>{experiment.domain}</span>
          <span className="lab-year">{experiment.year} · source year</span>
        </div>
        <h3 id="lab-detail-title">{experiment.name}</h3>
        <p>{experiment.objective}</p>
        <div className="lab-detail-meta">
          <span><strong>Organization</strong>{experiment.organization}</span>
          <span><strong>Experiment type</strong>{experiment.type}</span>
          <span><strong>Date context</strong>{experiment.dateContext}</span>
          <span><strong>Location</strong>{experiment.location}</span>
        </div>
      </header>

      <section className="lab-detail-section">
        <div className="lab-section-heading">
          <div>
            <span className="panel-kicker">ORIGINAL SOURCE MATERIAL</span>
            <h4>Images and video</h4>
          </div>
        </div>
        {experiment.media.length ? (
          <div className="lab-media-grid">
            {experiment.media.map((item) => (
              <figure className="lab-media-item" key={item.src}>
                {item.type === 'video' ? (
                  <video controls preload="metadata" poster={item.poster}>
                    <source src={item.src} type="video/mp4" />
                    Your browser does not support embedded video. Open the NASA source record instead.
                  </video>
                ) : (
                  <a href={item.source} target="_blank" rel="noreferrer" className="lab-media-image-link">
                    <img src={item.src} alt={item.alt} loading="lazy" />
                  </a>
                )}
                <figcaption>
                  <span>{item.caption}</span>
                  <small>{item.credit}</small>
                  <small>Usage rights: consult the original NASA record; this interface does not infer a separate license.</small>
                  <a href={item.source} target="_blank" rel="noreferrer">
                    Open original NASA media <ExternalLink size={12} />
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="lab-no-media">
            <FileText size={18} />
            <p>No original media was verified for this record. The linked NASA publication is the primary source.</p>
          </div>
        )}
      </section>

      <div className="lab-detail-grid">
        <article className="lab-detail-section">
          <span className="panel-kicker">SCIENTIFIC BACKGROUND</span>
          <h4>Research context</h4>
          <p>{experiment.background}</p>
        </article>
        <article className="lab-detail-section">
          <span className="panel-kicker">METHOD</span>
          <h4>Methodology, equipment, and materials</h4>
          <p>{experiment.methodology}</p>
          <p className="lab-equipment"><strong>Equipment:</strong> {experiment.equipment}</p>
          <p className="lab-equipment"><strong>Materials:</strong> {experiment.materials}</p>
        </article>
        <article className="lab-detail-section">
          <span className="panel-kicker">EVIDENCE</span>
          <h4>Observations and findings</h4>
          <p>{experiment.findings}</p>
        </article>
        <article className="lab-detail-section lab-limitation-section">
          <span className="panel-kicker">SCOPE AND LIMITATIONS</span>
          <h4>What this record does not establish</h4>
          <p>{experiment.limitations}</p>
        </article>
      </div>

      <section className="lab-detail-section lab-references">
        <div className="lab-section-heading">
          <div>
            <span className="panel-kicker">TRACEABLE REFERENCES</span>
            <h4>Publications and original sources</h4>
          </div>
          <BookOpen size={19} />
        </div>
        {experiment.references.map((reference) => (
          <a className="lab-reference-link" href={reference.url} target="_blank" rel="noreferrer" key={reference.url}>
            <span><strong>{reference.label}</strong><small>{reference.kind}</small></span>
            <ExternalLink size={15} />
          </a>
        ))}
      </section>

      {relatedExperiments.length > 0 && (
        <section className="lab-detail-section lab-related-experiments">
          <span className="panel-kicker">RELATED RECORDS</span>
          <h4>Related experiments</h4>
          <div className="lab-related-experiment-list">
            {relatedExperiments.map((item) => (
              <button type="button" key={item.id} onClick={() => onOpenRelated(item.id)}>
                <span><strong>{item.name}</strong><small>{item.type} · {item.year} source year</small></span>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </section>
      )}

      <nav className="lab-related-links" aria-label="Related IGNIS modules">
        <a href="#experiments-lab"><Flame size={15} /> Explore conceptual models</a>
        <a href="#research"><BookOpen size={15} /> Research Intelligence</a>
        <a href="#combustion"><Wind size={15} /> Combustion Explorer</a>
        <a href="#assistant"><Search size={15} /> Ask IGNIS AI</a>
      </nav>
    </section>
  )
}

export default function ExperimentsLab() {
  const [tab, setTab] = React.useState('simulations')
  const [activeExperimentId, setActiveExperimentId] = React.useState(null)
  const activeExperiment = experiments.find((item) => item.id === activeExperimentId)

  return (
    <section className="module-page experiments-lab">
      <header className="module-page-header lab-page-header">
        <div className="eyebrow"><span className="status-dot" /> EXPERIMENTS LAB · EVIDENCE AND MODELS</div>
        <h2>Explore the experiment behind the evidence</h2>
        <p>
          Interactive conceptual views alongside documented NASA combustion and spacecraft fire-safety
          experiments. Source records, mission context, and model limitations stay visible throughout.
        </p>
      </header>

      {activeExperiment ? (
        <ExperimentDetail
          experiment={activeExperiment}
          onBack={() => setActiveExperimentId(null)}
          onOpenRelated={setActiveExperimentId}
        />
      ) : (
        <>
          <div className="lab-workspace-tabs" role="tablist" aria-label="Experiments Lab workspace">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'simulations'}
              className={tab === 'simulations' ? 'selected' : ''}
              onClick={() => setTab('simulations')}
            >
              <SlidersHorizontal size={15} /> Interactive visualizations
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'archive'}
              className={tab === 'archive' ? 'selected' : ''}
              onClick={() => setTab('archive')}
            >
              <FileText size={15} /> Real experiment archive
            </button>
          </div>
          {tab === 'simulations' ? (
            <SimulationLab />
          ) : (
            <ExperimentArchive onOpen={setActiveExperimentId} />
          )}
          <div className="lab-integrity-note">
            <Flame size={16} />
            <p>
              <strong>Scientific integrity:</strong> archive statements link to their source records.
              Concept diagrams are not validated simulations, and no experimental measurements are generated.
            </p>
          </div>
        </>
      )}
    </section>
  )
}
