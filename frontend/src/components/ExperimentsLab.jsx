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

const ExperimentSimulator3D = React.lazy(() => import('./ExperimentSimulator3D'))

const nasaImageBase = 'https://images-assets.nasa.gov/image'
const nasaVideoBase = 'https://images-assets.nasa.gov/video'

const experiments = [
  {
    id: 'flex',
    name: 'Experimento de extinción de llama (FLEX)',
    type: 'Estudio de combustión de gotas',
    organization: 'Centro de Investigación Glenn de la NASA',
    domain: 'Combustión de gotas',
    year: '2015',
    dateContext: 'Serie de ensayos: marzo de 2009–diciembre de 2011 · informe publicado en 2015',
    location: 'Combustion Integrated Rack, laboratorio Destiny, Estación Espacial Internacional (EEI)',
    background: 'FLEX es un programa de NASA de experimentos sobre combustión de gotas en la Combustion Integrated Rack de la EEI, que utiliza el Multi-User Droplet Combustion Apparatus.',
    objective: 'Documentar el comportamiento de la combustión de gotas en microgravedad y poner a disposición los procedimientos y resultados experimentales para su análisis posterior.',
    methodology: 'NASA describe experimentos realizados con el Multi-User Droplet Combustion Apparatus (MDCA) dentro de la Combustion Integrated Rack. La publicación técnica citada documenta el equipo, los diagnósticos, los procedimientos y los métodos de análisis.',
    equipment: 'MDCA y Combustion Integrated Rack (CIR).',
    materials: 'Gotas de combustible líquido; el resumen citado no identifica las especies de combustible.',
    findings: 'El informe de NASA presenta datos de los primeros 284 ensayos. Su resumen indica explícitamente que se publican sin interpretación; por ello, este archivo no añade conclusiones cuantitativas.',
    limitations: 'El informe citado cubre una serie de ensayos y una configuración de equipo determinadas. Su resumen no establece que los resultados se apliquen a todo combustible, tamaño de gota o entorno de una nave espacial.',
    references: [
      {
        label: 'Título original de NASA NTRS · Detailed Results from the FLEX Experiment',
        url: 'https://ntrs.nasa.gov/citations/20150023456',
        kind: 'Publicación técnica · NASA/TP-2015-216046'
      }
    ],
    related: ['flex-2'],
    media: []
  },
  {
    id: 'flex-2',
    name: 'Experimento de extinción de llama 2 (FLEX-2)',
    type: 'Registro operativo de combustión de gotas',
    organization: 'Centro de Investigación Glenn de la NASA',
    domain: 'Combustión de gotas',
    year: '2013',
    dateContext: 'Registro fotográfico de NASA fechado el 10 de abril de 2013; el pie indica que el ensayo estaba programado, no que la imagen muestre un resultado.',
    location: 'Multi-User Droplet Combustion Apparatus, laboratorio Destiny, EEI',
    background: 'El registro de imágenes de NASA identifica los depósitos de combustible del MDCA como recipientes de combustible líquido para experimentos de combustión de gotas.',
    objective: 'Investigar la combustión de gotas en microgravedad mediante el MDCA. Esta ficha se limita a los hechos documentados en la fotografía operativa de NASA.',
    methodology: 'NASA documenta el reemplazo de los depósitos de combustible del MDCA con el inserto de cámara parcialmente retirado, como apoyo a FLEX-2. El pie de foto indica que la ejecución del ensayo se controlaría desde tierra.',
    equipment: 'Depósitos de combustible del MDCA y conjunto de inserto de cámara.',
    materials: 'Se identifica el combustible líquido de forma genérica; el registro fotográfico citado no especifica su composición química.',
    findings: 'La fuente citada documenta el mantenimiento del equipo y operaciones planificadas, pero no informa resultados experimentales. Por ello, no se infieren resultados.',
    limitations: 'Una fotografía de preparación no demuestra una observación de combustión. Esta ficha no atribuye resultados a FLEX-2.',
    references: [
      {
        label: 'Título original del registro multimedia de NASA · MDCA reservoir service for FLEX-2',
        url: 'https://images.nasa.gov/details/iss035e017702',
        kind: 'Registro de imagen de NASA · 10 de abril de 2013'
      }
    ],
    related: ['flex'],
    media: [
      {
        type: 'image',
        src: `${nasaImageBase}/iss035e017702/iss035e017702~medium.jpg`,
        alt: 'Tripulante de la EEI realizando mantenimiento al Multi-User Droplet Combustion Apparatus.',
        caption: 'Mantenimiento de los depósitos de combustible del MDCA para apoyar FLEX-2; es una imagen operativa, no un registro de resultados de llama.',
        credit: 'NASA / Biblioteca de Imágenes y Videos de NASA · ISS035-E-017702',
        source: 'https://images.nasa.gov/details/iss035e017702'
      }
    ]
  },
  {
    id: 'saffire-i',
    name: 'Experimento de fuego en una nave espacial (Saffire-I)',
    type: 'Ensayo de inflamabilidad de materiales sólidos a gran escala',
    organization: 'Centro de Investigación Glenn de la NASA',
    domain: 'Seguridad contra incendios en naves espaciales',
    year: '2016',
    dateContext: 'Publicaciones de congresos de NASA de 2016 describen el programa; el documento operativo adjunto no tiene fecha.',
    location: 'Vehículo de carga Cygnus, después de separarse de la Estación Espacial Internacional',
    background: 'NASA desarrolló Saffire para abordar vacíos de conocimiento sobre seguridad contra incendios en naves espaciales mediante ensayos de inflamabilidad a escalas pertinentes para una nave y en baja gravedad.',
    objective: 'Estudiar el crecimiento de incendios a gran escala y la inflamabilidad en baja gravedad dentro de un contexto pertinente para naves espaciales, según la publicación de NASA sobre Saffire.',
    methodology: 'El documento operativo indica que Saffire-I comenzó después de la separación de Cygnus. La muestra grande medía aproximadamente 0,4 m de ancho por 0,94 m de alto; el experimento se ejecutó automáticamente y los datos registrados se comprimieron y transmitieron antes de la reentrada del vehículo.',
    equipment: 'Unidad de vuelo Saffire a bordo de Cygnus, aviónica del experimento, captura de imágenes y datos, y comunicaciones de la nave para transmitirlos.',
    materials: 'Una muestra combustible de aproximadamente 0,4 m de ancho por 0,94 m de alto; el documento operativo no identifica su composición.',
    findings: 'El documento operativo indexado describe la secuencia de la misión y el manejo de datos, no los resultados medidos del fuego. El artículo vinculado de NASA expone los objetivos de investigación; esta ficha no afirma resultados.',
    limitations: 'El documento operativo es un protocolo de una página, no un artículo de resultados. La fotografía de NASA que aparece abajo documenta el procesamiento en tierra, no una llama en vuelo.',
    references: [
      {
        label: 'Título original de NASA NTRS · Operation and Development Status of the Saffire Experiments',
        url: 'https://ntrs.nasa.gov/citations/20170000230',
        kind: 'Artículo de congreso de NASA · publicado en 2016'
      },
      {
        label: 'Operaciones de SAFFIRE-I · fuente indexada localmente',
        url: getDocumentUrl('SAFFIRE-I Operations.pdf'),
        kind: 'Requisitos operativos y protocolos · 1 página'
      }
    ],
    related: ['bass-ii'],
    media: [
      {
        type: 'image',
        src: `${nasaImageBase}/jsc2016e017570/jsc2016e017570~medium.jpg`,
        alt: 'Equipo de Saffire-I documentado durante la prueba de interfaz de equipo de tripulación OA-6.',
        caption: 'Procesamiento en tierra previo al vuelo en el Centro Espacial Kennedy; no es una imagen del experimento en vuelo.',
        credit: 'NASA Johnson Space Center · NASA ID jsc2016e017570',
        source: 'https://images.nasa.gov/details/jsc2016e017570'
      },
      {
        type: 'video',
        src: `${nasaVideoBase}/GRC-2021-CN-00008/GRC-2021-CN-00008~preview.mp4`,
        poster: `${nasaVideoBase}/GRC-2021-CN-00008/GRC-2021-CN-00008~large.jpg`,
        caption: 'Material audiovisual relacionado: combustión de una muestra Saffire-V, no de Saffire-I.',
        credit: 'NASA Glenn Research Center · NASA ID GRC-2021-CN-00008',
        source: 'https://images.nasa.gov/details/GRC-2021-CN-00008'
      }
    ]
  },
  {
    id: 'bass-ii',
    name: 'Combustión y supresión de sólidos II (BASS-II)',
    type: 'Experimento de combustión y extinción de combustible sólido',
    organization: 'Centro de Investigación Glenn de la NASA',
    domain: 'Combustión de materiales sólidos',
    year: '2021',
    dateContext: 'Informe resumido de NASA publicado en 2021; el resumen no especifica el año de los ensayos en vuelo.',
    location: 'Microgravity Science Glovebox, Estación Espacial Internacional',
    background: 'BASS-II estudió la combustión de combustibles sólidos dentro de un conducto de flujo contenido en la Microgravity Science Glovebox de la EEI.',
    objective: 'Caracterizar la combustión y extinción de muestras sólidas en microgravedad y aportar información a la evaluación de inflamabilidad de materiales para naves espaciales.',
    methodology: 'NASA describe un conducto de flujo contenido, controles de ignición y ventilador operados por astronautas, y registro de video y fotografías. BASS-II varió la concentración ambiental de oxígeno, la velocidad de ventilación y el tipo, grosor y geometría del combustible; sensores a bordo registraron O₂, CO y CO₂.',
    equipment: 'Microgravity Science Glovebox, conducto de flujo BASS, cámaras, analizador de gases CSA-CP y monitor de dióxido de carbono.',
    materials: 'Combustibles sólidos de distintos tipos, grosores y geometrías; el resumen de NASA no enumera materiales específicos.',
    findings: 'El informe de NASA indica que los cambios de O₂ y CO₂ antes y después de los ensayos concuerdan bien con relaciones estequiométricas de una reacción en fase gaseosa de un solo paso. La relación entre CO y CO₂ siguió una tendencia lineal en algunos conjuntos de datos, pero no en todos.',
    limitations: 'Las tendencias informadas no fueron universales para todas las geometrías y condiciones de flujo ensayadas. Corresponden a este equipo y matriz de ensayos, no a un modelo general de incendio en naves espaciales.',
    references: [
      {
        label: 'Título original de NASA NTRS · BASS-II Summary Report',
        url: 'https://ntrs.nasa.gov/citations/20210011385',
        kind: 'Memorando técnico · Centro de Investigación Glenn de NASA · 2021'
      }
    ],
    related: ['saffire-i'],
    media: [
      {
        type: 'image',
        src: `${nasaImageBase}/iss040e086481/iss040e086481~medium.jpg`,
        alt: 'Ensayo de llama BASS-II realizado con presión parcial de oxígeno reducida a bordo de la EEI.',
        caption: 'Ensayo de llama BASS-II con presión parcial de oxígeno reducida; los metadatos de NASA fechan la imagen el 2 de agosto de 2014.',
        credit: 'NASA / Reid Wiseman · NASA ID iss040e086481',
        source: 'https://images.nasa.gov/details/iss040e086481'
      }
    ]
  }
]

const visualizers = [
  {
    id: 'flame',
    label: 'Llama en microgravedad',
    description: 'Explora cómo la gravedad y la ventilación impuesta definen el contexto de transporte alrededor de una llama.',
    limitation: 'Las flechas codifican únicamente los valores de entrada seleccionados. La geometría es esquemática; no se calcula el campo de flujo ni la respuesta de la llama.',
    controls: ['gravity', 'ventilation']
  },
  {
    id: 'droplet',
    label: 'Combustión de gotas',
    description: 'Examina la geometría relativa de una gota de combustible líquido y la zona conceptual de llama que la rodea.',
    limitation: 'La gota se dibuja con una escala visual indicada. El anillo que la rodea es ilustrativo y no predice la velocidad ni la duración de la combustión.',
    controls: ['diameter']
  },
  {
    id: 'solid',
    label: 'Propagación en sólidos',
    description: 'Cambia el grosor mostrado de la muestra y examina una disposición conceptual del frente de llama.',
    limitation: 'La muestra es esquemática; no se calcula la propagación para un material específico ni se informa una velocidad.',
    controls: ['thickness']
  },
  {
    id: 'smoke',
    label: 'Humo y productos',
    description: 'Explora cómo se representa un vector de ventilación impuesta alrededor de una fuente de combustión contenida.',
    limitation: 'Las trayectorias de partículas son líneas esquemáticas, no representan trayectorias de humo, concentraciones ni campos de gases tóxicos calculados.',
    controls: ['ventilation', 'direction']
  },
  {
    id: 'extinction',
    label: 'Contexto de extinción',
    description: 'Examina la fracción de oxidante y la presión seleccionadas como variables independientes del contexto experimental.',
    limitation: 'No se representa un umbral de inflamabilidad o extinción. Estos umbrales dependen del combustible, la geometría, el flujo, la presión y el método de ensayo.',
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
            <text className="lab-svg-label" x="369" y="80">entrada g</text>
            <text className="lab-svg-label" x="92" y="70">entrada de ventilación</text>
            <text className="lab-svg-subtle" x="258" y="273" textAnchor="middle">silueta fija · no es una respuesta predicha</text>
          </>
        )}

        {visualizer.id === 'droplet' && (
          <>
            <circle className="lab-droplet-zone" cx="260" cy="150" r={dropletRadius + 37} />
            <circle className="lab-droplet" cx="260" cy="150" r={dropletRadius} />
            <path className="lab-dimension-line" d={`M${260 - dropletRadius} ${150 + dropletRadius + 23}H${260 + dropletRadius}`} />
            <text className="lab-svg-label" x="260" y="265" textAnchor="middle">diámetro de gota · escala visual 13 px/mm</text>
          </>
        )}

        {visualizer.id === 'solid' && (
          <>
            <rect className="lab-specimen" x="88" y={180 - sampleThickness} width="344" height={sampleThickness} rx="3" />
            <path className="lab-flame-halo" d="M257 178C227 153 240 127 252 108C265 88 257 73 255 62C287 88 302 120 291 148C284 164 271 174 257 178Z" fill="url(#lab-flame-gradient)" />
            <path className="lab-dimension-line" d={`M449 ${180 - sampleThickness}V180`} />
            <text className="lab-svg-label" x="260" y="235" textAnchor="middle">muestra sólida esquemática</text>
            <text className="lab-svg-subtle" x="260" y="257" textAnchor="middle">frente ilustrativo, no es un resultado de propagación</text>
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
            <text className="lab-svg-label" x="416" y="45" textAnchor="end">ventilación impuesta</text>
            <text className="lab-svg-subtle" x="260" y="265" textAnchor="middle">trayectorias ilustrativas · sin campo de concentración</text>
          </>
        )}

        {visualizer.id === 'extinction' && (
          <>
            <rect className="lab-chamber" x="68" y="56" width="384" height="157" rx="12" />
            <path className="lab-flame-halo" d="M260 184C235 164 245 137 257 121C268 105 260 91 258 81C286 103 298 130 289 154C283 168 272 179 260 184Z" fill="url(#lab-flame-gradient)" />
            <text className="lab-svg-label" x="260" y="238" textAnchor="middle">el símbolo de llama no cambia</text>
            <text className="lab-svg-subtle" x="260" y="260" textAnchor="middle">no se calcula un umbral ni se predice la extinción</text>
            <path className="lab-gauge-track" d="M115 91H405" />
            <path className="lab-gauge-marker" d={`M${115 + oxygenPosition * 2.9} 81V101`} />
            <text className="lab-svg-subtle" x="115" y="75">rango de entrada de oxidante: 12–24 % vol</text>
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
        label="Aceleración gravitatoria"
        value={parameters.gravity}
        min={0}
        max={9.81}
        step={0.1}
        unit="m/s²"
        onChange={(value) => onChange('gravity', value)}
        help="Rango de referencia: de 0 a la gravedad terrestre estándar."
      />
    ),
    ventilation: (
      <ParameterSlider
        key="ventilation"
        label="Velocidad de ventilación impuesta"
        value={parameters.ventilation}
        min={0}
        max={0.5}
        step={0.01}
        unit="m/s"
        onChange={(value) => onChange('ventilation', value)}
        help="El diagrama ajusta una flecha a este valor; no calcula el flujo."
      />
    ),
    diameter: (
      <ParameterSlider
        key="diameter"
        label="Diámetro de la gota"
        value={parameters.diameter}
        min={0.5}
        max={5}
        step={0.1}
        unit="mm"
        onChange={(value) => onChange('diameter', value)}
        help="El círculo usa una escala visual fija, no las dimensiones del equipo."
      />
    ),
    thickness: (
      <ParameterSlider
        key="thickness"
        label="Grosor mostrado de la muestra"
        value={parameters.thickness}
        min={1}
        max={10}
        step={0.5}
        unit="mm"
        onChange={(value) => onChange('thickness', value)}
        help="Solo cambia el contorno de la muestra; no se calcula la respuesta del material."
      />
    ),
    direction: (
      <label className="lab-parameter">
        <span className="lab-parameter-heading"><span>Orientación de la ventilación</span></span>
        <select
          value={parameters.direction}
          onChange={(event) => onChange('direction', event.target.value)}
          aria-label="Orientación de la ventilación"
        >
          <option value="axial">Axial · diagrama horizontal</option>
          <option value="transverse">Transversal · diagrama vertical</option>
        </select>
      </label>
    ),
    oxygen: (
      <ParameterSlider
        key="oxygen"
        label="Fracción de oxidante"
        value={parameters.oxygen}
        min={12}
        max={24}
        step={0.1}
        unit="% vol"
        onChange={(value) => onChange('oxygen', value)}
        help="Se muestra únicamente como entrada; no se supone un límite de inflamabilidad."
      />
    ),
    pressure: (
      <ParameterSlider
        key="pressure"
        label="Presión ambiental"
        value={parameters.pressure}
        min={70}
        max={110}
        step={1}
        unit="kPa"
        onChange={(value) => onChange('pressure', value)}
        help="Solo es una variable de contexto; no se calcula un umbral dependiente de la presión."
      />
    )
  }

  return <div className="lab-parameter-list">{visualizer.controls.map((key) => controls[key])}</div>
}

function LegacySimulationLab() {
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
          <span className="panel-kicker">MODELOS CONCEPTUALES INTERACTIVOS</span>
          <h3 id="lab-simulations-heading">Explora las variables, no resultados inventados</h3>
        </div>
        <span className="lab-status-badge"><SlidersHorizontal size={13} /> CONCEPTUAL · NO VALIDADO</span>
      </div>
      <p className="lab-section-intro">
        Cada control actualiza un diagrama o muestra una condición seleccionada. Estas visualizaciones no son
        simulaciones numéricas ni presentan datos experimentales medidos.
      </p>

      <div className="lab-simulation-tabs" role="tablist" aria-label="Visualizaciones conceptuales de combustión">
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
            {String(activeIndex + 1).padStart(2, '0')} / 05 · VISTA CONCEPTUAL
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

function SimulationLab({ onOpenExperiment }) {
  return (
    <>
      <React.Suspense fallback={<div className="lab-simulation-loading" role="status">Cargando el motor de visualización 3D...</div>}>
        <ExperimentSimulator3D onOpenExperiment={onOpenExperiment} />
      </React.Suspense>
      <details className="lab-2d-reference">
        <summary>Abrir las referencias conceptuales 2D compactas</summary>
        <LegacySimulationLab />
      </details>
    </>
  )
}

function ExperimentCard({ experiment, selected, onOpen, onCompare }) {
  return (
    <article className="lab-experiment-card">
      <div className="lab-card-topline">
        <span>{experiment.domain}</span>
        <span className="lab-year">{experiment.year} · año de la fuente</span>
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
          Abrir experimento <ArrowRight size={14} />
        </button>
        <button
          type="button"
          className={`lab-compare-button ${selected ? 'selected' : ''}`}
          onClick={onCompare}
          aria-pressed={selected}
        >
          {selected ? <Check size={14} /> : <SlidersHorizontal size={14} />}
          {selected ? 'En comparación' : 'Comparar'}
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
        setCompareMessage('Puedes comparar hasta dos experimentos. Quita una selección antes de añadir otra.')
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
          <span className="panel-kicker">REGISTROS VERIFICADOS EN LAS FUENTES</span>
          <h3 id="lab-archive-heading">Experimentos reales y evidencia operativa</h3>
        </div>
        <span className="lab-record-count">{filtered.length} / {experiments.length} REGISTROS</span>
      </div>
      <p className="lab-section-intro">
        Las fechas y los hallazgos se limitan a lo documentado en los registros vinculados de NASA. El año de
        publicación de una fuente no se presenta como fecha del experimento.
      </p>

      <div className="lab-discovery-toolbar">
        <label className="lab-search">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, tema u objetivo..."
            aria-label="Buscar en el archivo de experimentos"
          />
        </label>
        <label className="lab-filter">
          <span>TIPO DE EXPERIMENTO</span>
          <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filtrar por tipo de experimento">
            <option value="all">Todos los tipos de experimento</option>
            {types.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="lab-filter">
          <span>ÁREA DE INVESTIGACIÓN</span>
          <select value={domain} onChange={(event) => setDomain(event.target.value)} aria-label="Filtrar por área de investigación">
            <option value="all">Todas las áreas de investigación</option>
            {domains.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="lab-filter">
          <span>ORGANIZACIÓN</span>
          <select value={organization} onChange={(event) => setOrganization(event.target.value)} aria-label="Filtrar por organización">
            <option value="all">Todas las organizaciones</option>
            {organizations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="lab-filter">
          <span>AÑO DE LA FUENTE</span>
          <select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filtrar por año de la fuente">
            <option value="all">Todos los años de las fuentes</option>
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
          <h4>Ningún experimento coincide con estos filtros</h4>
          <p>Prueba con un término más general o quita alguno de los filtros.</p>
        </div>
      )}

      {compared.length > 0 && (
        <section className="lab-comparison" aria-labelledby="lab-comparison-heading">
          <div className="lab-comparison-heading">
            <div>
              <span className="panel-kicker">COMPARACIÓN LADO A LADO</span>
              <h4 id="lab-comparison-heading">Comparación de experimentos</h4>
            </div>
            <button type="button" onClick={() => setComparisonIds([])}>Borrar comparación</button>
          </div>
          <div
            className="lab-comparison-table"
            role="table"
            aria-label="Comparación de metadatos de los experimentos seleccionados"
            style={{ '--comparison-columns': compared.length }}
          >
            <div className="lab-comparison-row lab-comparison-labels" role="row">
              <span role="columnheader">Propiedad</span>
              {compared.map((item) => <strong key={item.id} role="columnheader">{item.name}</strong>)}
            </div>
            {[
              ['Tipo de experimento', 'type'],
              ['Área de investigación', 'domain'],
              ['Organización', 'organization'],
              ['Contexto de fecha de la fuente', 'dateContext'],
              ['Ubicación', 'location'],
              ['Método', 'methodology'],
              ['Evidencia en este registro', 'findings']
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
        <ArrowLeft size={15} /> Volver al archivo
      </button>
      <header className="lab-detail-header">
        <div className="lab-card-topline">
          <span>{experiment.domain}</span>
          <span className="lab-year">{experiment.year} · año de la fuente</span>
        </div>
        <h3 id="lab-detail-title">{experiment.name}</h3>
        <p>{experiment.objective}</p>
        <div className="lab-detail-meta">
          <span><strong>Organización</strong>{experiment.organization}</span>
          <span><strong>Tipo de experimento</strong>{experiment.type}</span>
          <span><strong>Contexto de fecha</strong>{experiment.dateContext}</span>
          <span><strong>Ubicación</strong>{experiment.location}</span>
        </div>
      </header>

      <section className="lab-detail-section">
        <div className="lab-section-heading">
          <div>
            <span className="panel-kicker">MATERIAL DE LA FUENTE ORIGINAL</span>
            <h4>Imágenes y videos</h4>
          </div>
        </div>
        {experiment.media.length ? (
          <div className="lab-media-grid">
            {experiment.media.map((item) => (
              <figure className="lab-media-item" key={item.src}>
                {item.type === 'video' ? (
                  <video controls preload="metadata" poster={item.poster}>
                    <source src={item.src} type="video/mp4" />
                    Tu navegador no admite video integrado. Abre el registro original de NASA.
                  </video>
                ) : (
                  <a href={item.source} target="_blank" rel="noreferrer" className="lab-media-image-link">
                    <img src={item.src} alt={item.alt} loading="lazy" />
                  </a>
                )}
                <figcaption>
                  <span>{item.caption}</span>
                  <small>{item.credit}</small>
                  <small>Derechos de uso: consulta el registro original de NASA; esta interfaz no atribuye una licencia independiente.</small>
                  <a href={item.source} target="_blank" rel="noreferrer">
                    Abrir material multimedia original de NASA <ExternalLink size={12} />
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="lab-no-media">
            <FileText size={18} />
            <p>No se verificó material multimedia original para este registro. La publicación de NASA vinculada es la fuente primaria.</p>
          </div>
        )}
      </section>

      <div className="lab-detail-grid">
        <article className="lab-detail-section">
          <span className="panel-kicker">CONTEXTO CIENTÍFICO</span>
          <h4>Contexto de la investigación</h4>
          <p>{experiment.background}</p>
        </article>
        <article className="lab-detail-section">
          <span className="panel-kicker">MÉTODO</span>
          <h4>Metodología, equipo y materiales</h4>
          <p>{experiment.methodology}</p>
          <p className="lab-equipment"><strong>Equipo:</strong> {experiment.equipment}</p>
          <p className="lab-equipment"><strong>Materiales:</strong> {experiment.materials}</p>
        </article>
        <article className="lab-detail-section">
          <span className="panel-kicker">EVIDENCIA</span>
          <h4>Observaciones y hallazgos</h4>
          <p>{experiment.findings}</p>
        </article>
        <article className="lab-detail-section lab-limitation-section">
          <span className="panel-kicker">ALCANCE Y LIMITACIONES</span>
          <h4>Qué no establece este registro</h4>
          <p>{experiment.limitations}</p>
        </article>
      </div>

      <section className="lab-detail-section lab-references">
        <div className="lab-section-heading">
          <div>
            <span className="panel-kicker">REFERENCIAS TRAZABLES</span>
            <h4>Publicaciones y fuentes originales</h4>
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
          <span className="panel-kicker">REGISTROS RELACIONADOS</span>
          <h4>Experimentos relacionados</h4>
          <div className="lab-related-experiment-list">
            {relatedExperiments.map((item) => (
              <button type="button" key={item.id} onClick={() => onOpenRelated(item.id)}>
                <span><strong>{item.name}</strong><small>{item.type} · fuente de {item.year}</small></span>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </section>
      )}

      <nav className="lab-related-links" aria-label="Módulos de IGNIS relacionados">
        <a href="#experiments-lab"><Flame size={15} /> Explorar modelos conceptuales</a>
        <a href="#research"><BookOpen size={15} /> Inteligencia de investigación</a>
        <a href="#combustion"><Wind size={15} /> Explorador de combustión</a>
        <a href="#assistant"><Search size={15} /> Consultar a IGNIS IA</a>
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
        <div className="eyebrow"><span className="status-dot" /> LABORATORIO DE EXPERIMENTOS · EVIDENCIA Y MODELOS</div>
        <h2>Explora los experimentos detrás de la evidencia</h2>
        <p>
          Visualizaciones conceptuales interactivas junto con experimentos documentados por NASA sobre combustión
          y seguridad contra incendios en naves espaciales. Las fuentes, el contexto de la misión y las limitaciones
          del modelo permanecen visibles.
        </p>
      </header>

      <nav className="experience-links lab-experience-links" aria-label="Experiencias de IGNIS conectadas">
        <a href="#digital-twin"><Wind size={14} /> Explorar el gemelo digital del hábitat <ArrowRight size={13} /></a>
        <a href="#microgravity-lab"><Flame size={14} /> Comparar la Tierra y la microgravedad <ArrowRight size={13} /></a>
        <a href="#assistant"><Search size={14} /> Investigar con IGNIS IA <ArrowRight size={13} /></a>
      </nav>

      {activeExperiment ? (
        <ExperimentDetail
          experiment={activeExperiment}
          onBack={() => setActiveExperimentId(null)}
          onOpenRelated={setActiveExperimentId}
        />
      ) : (
        <>
          <div className="lab-workspace-tabs" role="tablist" aria-label="Espacio de trabajo del laboratorio de experimentos">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'simulations'}
              className={tab === 'simulations' ? 'selected' : ''}
              onClick={() => setTab('simulations')}
            >
              <SlidersHorizontal size={15} /> Visualizaciones interactivas
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'archive'}
              className={tab === 'archive' ? 'selected' : ''}
              onClick={() => setTab('archive')}
            >
              <FileText size={15} /> Archivo de experimentos reales
            </button>
          </div>
          {tab === 'simulations' ? (
            <SimulationLab onOpenExperiment={setActiveExperimentId} />
          ) : (
            <ExperimentArchive onOpen={setActiveExperimentId} />
          )}
          <div className="lab-integrity-note">
            <Flame size={16} />
            <p>
              <strong>Integridad científica:</strong> las afirmaciones del archivo enlazan con sus fuentes.
              Las escenas 3D son modelos conceptuales o matemáticos simplificados, no simulaciones validadas
              experimentalmente; las curvas del modelo no son mediciones experimentales.
            </p>
          </div>
        </>
      )}
    </section>
  )
}
