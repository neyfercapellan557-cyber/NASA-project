import React from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Activity,
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Droplets,
  ExternalLink,
  Flame,
  Info,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Thermometer,
  Wind
} from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { OrbitControls as ThreeOrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as THREE from 'three'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const EMPTY_CONTROLS = [null, null]
const EMPTY_SYNC_GUARD = { current: false }
const ignoreControls = () => {}
const DEFAULT_TWIN_STATE = {
  temperatureC: 22,
  oxygenPercent: 20.9,
  carbonMonoxidePpm: 0,
  carbonDioxidePpm: 450
}

const twinScenarios = [
  {
    id: 'baseline',
    label: 'Condición de referencia',
    description: 'Referencia ilustrativa para aprendizaje; no es una medición de la atmósfera de una nave espacial.',
    values: DEFAULT_TWIN_STATE,
    alert: 'No se seleccionó un cambio de escenario'
  },
  {
    id: 'ventilation',
    label: 'Ventilación reducida · hipotético',
    description: 'Un conjunto hipotético de entradas ilustra cómo podrían revisarse conjuntamente los valores monitorizados. No es una predicción.',
    values: { temperatureC: 24, oxygenPercent: 20.9, carbonMonoxidePpm: 1, carbonDioxidePpm: 1100 },
    alert: 'Revisar el escenario hipotético de ventilación'
  },
  {
    id: 'heating',
    label: 'Calentamiento localizado · hipotético',
    description: 'Un caso hipotético de calentamiento localizado solo modifica valores ilustrativos; no se modelan el crecimiento del fuego ni la respuesta de los sensores.',
    values: { temperatureC: 36, oxygenPercent: 20.4, carbonMonoxidePpm: 3, carbonDioxidePpm: 1500 },
    alert: 'Revisar el escenario hipotético de calentamiento'
  }
]

const habitatZones = [
  { id: 'crew', label: 'Alojamiento de la tripulación', position: [-2.7, 0, 0], detail: 'Zona de literas y equipo personal; los marcadores de sensores son conceptuales.' },
  { id: 'work', label: 'Trabajo y ciencia', position: [0, 0, 0], detail: 'Bastidor de instrumentos y superficie de trabajo; no representa la distribución de una nave real.' },
  { id: 'utility', label: 'Zona de servicios', position: [2.7, 0, 0], detail: 'Zona de equipos de sistemas ambientales; no se modelan controles operativos.' }
]

function HabitatRoom({ zone, selected, showSensors, onSelect }) {
  const trim = selected ? '#38d6e5' : '#38546a'
  const sensorMarkers = [
    { label: 'O₂', color: '#51dce8', position: [-0.62, 0.83, -0.65] },
    { label: 'CO', color: '#ffb56e', position: [0, 0.83, -0.65] },
    { label: 'CO₂', color: '#ff855d', position: [0.62, 0.83, -0.65] }
  ]

  return (
    <group position={zone.position} onClick={(event) => {
      event.stopPropagation()
      onSelect(zone)
    }}>
      <mesh position={[0, -1.05, 0]} receiveShadow>
        <boxGeometry args={[2.45, 0.16, 2.25]} />
        <meshStandardMaterial color={selected ? '#24495d' : '#1c3043'} metalness={0.45} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.15, -1.06]}>
        <boxGeometry args={[2.42, 2.25, 0.08]} />
        <meshStandardMaterial color="#214052" transparent opacity={0.28} metalness={0.35} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {[-1.16, 1.16].map((side) => (
        <mesh key={side} position={[side, -0.02, 0]}>
          <boxGeometry args={[0.08, 2.1, 2.12]} />
          <meshStandardMaterial color="#2a4052" transparent opacity={0.36} metalness={0.25} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[2.5, 0.09, 2.28]} />
        <meshStandardMaterial color="#62788a" metalness={0.65} roughness={0.35} />
      </mesh>
      <mesh position={[0.7, -0.42, -0.52]}>
        <boxGeometry args={[0.62, 1.05, 0.58]} />
        <meshStandardMaterial color={zone.id === 'work' ? '#28566a' : '#263b4b'} metalness={0.3} roughness={0.55} />
      </mesh>
      {zone.id === 'crew' && (
        <mesh position={[-0.45, -0.48, 0.48]}>
          <boxGeometry args={[1.1, 0.16, 0.56]} />
          <meshStandardMaterial color="#34475a" roughness={0.8} />
        </mesh>
      )}
      {zone.id === 'work' && (
        <mesh position={[-0.45, -0.55, -0.2]}>
          <boxGeometry args={[1.1, 0.1, 0.68]} />
          <meshStandardMaterial color="#536c7d" metalness={0.45} roughness={0.5} />
        </mesh>
      )}
      <mesh position={[-0.72, 0.53, 0.66]}>
        <boxGeometry args={[0.28, 0.18, 0.1]} />
        <meshBasicMaterial color="#142637" />
      </mesh>
      <mesh position={[-0.72, 0.53, 0.59]}>
        <boxGeometry args={[0.19, 0.07, 0.025]} />
        <meshBasicMaterial color="#35cddd" />
      </mesh>
      {showSensors && sensorMarkers.map((marker) => (
        <mesh key={marker.label} position={marker.position}>
          <sphereGeometry args={[0.055, 12, 10]} />
          <meshBasicMaterial color={marker.color} />
        </mesh>
      ))}
      <mesh position={[0, 0.15, 1.11]}>
        <boxGeometry args={[0.56, 1.62, 0.06]} />
        <meshStandardMaterial color={trim} metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[0, -1.23, 0]}>
        <boxGeometry args={[2.5, 0.02, 2.28]} />
        <meshBasicMaterial color="#35cddd" transparent opacity={selected ? 0.82 : 0.3} />
      </mesh>
    </group>
  )
}

function HabitatAirflowCue() {
  const particleRefs = React.useRef([])
  const particleCount = 18

  useFrame(({ clock }) => {
    particleRefs.current.forEach((particle, index) => {
      if (!particle) return
      const progress = (clock.elapsedTime * 0.11 + index / particleCount) % 1
      const x = progress * 6.1 - 3.05
      particle.position.set(x, 0.72 + Math.sin(progress * Math.PI * 4) * 0.045, 0.69)
    })
  })

  return (
    <group>
      <mesh position={[0, 0.72, 0.69]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.009, 0.009, 6.1, 6]} />
        <meshBasicMaterial color="#35cddd" transparent opacity={0.42} />
      </mesh>
      <mesh position={[0.35, 0.72, 0.69]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.16, 8]} />
        <meshBasicMaterial color="#60e1e9" transparent opacity={0.75} />
      </mesh>
      {Array.from({ length: particleCount }, (_, index) => (
        <mesh
          key={index}
          ref={(node) => { particleRefs.current[index] = node }}
        >
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshBasicMaterial color="#73e8ed" />
        </mesh>
      ))}
    </group>
  )
}

function HabitatScene({ selectedZone, showSensors, showAirflow, onSelectZone }) {
  return (
    <>
      <color attach="background" args={['#081320']} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 7, 5]} intensity={1.65} color="#dcecff" />
      <pointLight position={[-3, 2, 1]} intensity={5} distance={9} color="#35cddd" />
      <pointLight position={[3, 1, -2]} intensity={2} distance={8} color="#ff914f" />
      <gridHelper args={[12, 24, '#234456', '#172b3e']} position={[0, -1.38, 0]} />
      {habitatZones.map((zone) => (
        <HabitatRoom
          key={zone.id}
          zone={zone}
          selected={selectedZone.id === zone.id}
          showSensors={showSensors}
          onSelect={onSelectZone}
        />
      ))}
      {showAirflow && <HabitatAirflowCue />}
      {[-1.35, 1.35].map((x) => (
        <group key={x} position={[x, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.44, 0.44, 0.62, 24, 1, true]} />
            <meshStandardMaterial color="#718596" metalness={0.75} roughness={0.32} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.44, 0.045, 8, 24]} />
            <meshStandardMaterial color="#a6b8c5" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.2, 0.012, 5, 64]} />
        <meshBasicMaterial color="#35cddd" transparent opacity={0.35} />
      </mesh>
    </>
  )
}

function CameraControls({
  controlsRef,
  cameraControls = EMPTY_CONTROLS,
  registerControls = ignoreControls,
  syncEnabled = false,
  cameraIndex = 0,
  syncGuard = EMPTY_SYNC_GUARD
}) {
  const { camera, gl } = useThree()
  const latestControls = React.useRef(cameraControls)
  const syncEnabledRef = React.useRef(syncEnabled)

  React.useEffect(() => {
    latestControls.current = cameraControls
  }, [cameraControls])

  React.useEffect(() => {
    syncEnabledRef.current = syncEnabled
  }, [syncEnabled])

  React.useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = true
    controls.minDistance = 3
    controls.maxDistance = 14
    controls.target.set(0, 0, 0)
    controls.update()
    controlsRef.current = controls
    registerControls(cameraIndex, controls)

    const syncCamera = () => {
      if (!syncEnabledRef.current || syncGuard.current) return
      const peer = latestControls.current[1 - cameraIndex]
      if (!peer) return
      syncGuard.current = true
      peer.object.position.copy(controls.object.position)
      peer.object.quaternion.copy(controls.object.quaternion)
      peer.object.up.copy(controls.object.up)
      peer.target.copy(controls.target)
      peer.update()
      syncGuard.current = false
    }
    controls.addEventListener('change', syncCamera)

    return () => {
      controls.removeEventListener('change', syncCamera)
      controls.dispose()
      if (controlsRef.current === controls) controlsRef.current = null
      registerControls(cameraIndex, null)
    }
  }, [camera, cameraIndex, controlsRef, gl.domElement, registerControls, syncGuard])

  useFrame(() => controlsRef.current?.update())
  return null
}

class SceneBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function PageHeader({ kicker, title, description }) {
  return (
    <header className="module-page-header ignis-experience-header">
      <div className="eyebrow"><span className="status-dot" /> {kicker}</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  )
}

function TwinMetric({ label, value, unit, icon: Icon, range, percent, note }) {
  return (
    <article className="twin-metric">
      <div className="twin-metric-top">
        <span><Icon size={15} /> {label}</span>
        <span className="twin-info-trigger" role="img" title={note} aria-label={`${label}: ${note}`}>
          <Info size={13} aria-hidden="true" />
        </span>
      </div>
      <strong>{value}<small> {unit}</small></strong>
      <div className="twin-meter" role="img" aria-label={`${label} illustrative display, ${percent}% of display scale`}>
        <span style={{ width: `${clamp(percent, 0, 100)}%` }} />
      </div>
      <small className="twin-metric-note">{range}</small>
    </article>
  )
}

export function DigitalTwin() {
  const [scenarioId, setScenarioId] = React.useState('baseline')
  const [selectedZone, setSelectedZone] = React.useState(habitatZones[0])
  const [showSensors, setShowSensors] = React.useState(true)
  const [showAirflow, setShowAirflow] = React.useState(false)
  const controlsRef = React.useRef(null)
  const scenario = twinScenarios.find((item) => item.id === scenarioId) ?? twinScenarios[0]
  const values = scenario.values
  const changed = scenarioId !== 'baseline'

  const metrics = [
    { key: 'temperatureC', label: 'Temperatura ambiente', value: values.temperatureC.toFixed(1), unit: '°C', icon: Thermometer, range: 'Escala ilustrativa · 0–50 °C', percent: (values.temperatureC / 50) * 100, note: 'Valor de un escenario hipotético; no es una medición del hábitat ni una respuesta térmica predicha.' },
    { key: 'oxygenPercent', label: 'Fracción de oxígeno', value: values.oxygenPercent.toFixed(1), unit: '% vol', icon: Activity, range: 'Entrada ilustrativa · 0–30 % vol', percent: (values.oxygenPercent / 30) * 100, note: 'Concentración hipotética para explorar la interfaz; no representa la atmósfera de una nave espacial.' },
    { key: 'carbonMonoxidePpm', label: 'Monóxido de carbono', value: String(values.carbonMonoxidePpm), unit: 'ppm', icon: Flame, range: 'Escala ilustrativa · 0–20 ppm', percent: (values.carbonMonoxidePpm / 20) * 100, note: 'Entrada de concentración hipotética; no es una medición de sensor, un umbral de alarma ni una recomendación de seguridad.' },
    { key: 'carbonDioxidePpm', label: 'Dióxido de carbono', value: String(values.carbonDioxidePpm), unit: 'ppm', icon: Wind, range: 'Escala ilustrativa · 0–2.000 ppm', percent: (values.carbonDioxidePpm / 2000) * 100, note: 'Entrada de concentración hipotética; no es una medición de sensor, un umbral de alarma ni una recomendación de seguridad.' }
  ]

  return (
    <section className="module-page ignis-experience">
      <PageHeader
        kicker="GEMELO DIGITAL IGNIS · CONCEPTO EDUCATIVO"
        title="Un hábitat que puedes explorar"
        description="Explora un hábitat modular esquemático, examina sus zonas y compara escenarios de seguridad explícitamente hipotéticos. No es una réplica de una nave espacial, un sistema de detección ni un control operativo."
      />

      <div className="experience-links" aria-label="Experiencias de IGNIS conectadas">
        <a href="#experiments-lab"><Flame size={14} /> Abrir laboratorio de combustión <ArrowRight size={13} /></a>
        <a href="#microgravity-lab"><ArrowLeftRight size={14} /> Comparar la Tierra y la microgravedad <ArrowRight size={13} /></a>
        <a href="#habitat-safety"><Activity size={14} /> Abrir revisión de seguridad <ArrowRight size={13} /></a>
        <a href="#assistant"><BookOpen size={14} /> Investigar con IGNIS IA <ArrowRight size={13} /></a>
      </div>

      <div className="twin-workspace">
        <section className="twin-scene-panel" aria-label="Modelo interactivo del hábitat">
          <div className="experience-panel-heading">
            <div>
              <span className="panel-kicker">HÁBITAT ESQUEMÁTICO · 3D INTERACTIVO</span>
              <h3>Zonas interiores y ubicación de sensores</h3>
            </div>
            <span className="experience-badge"><Camera size={12} /> GIRAR · ACERCAR · MOVER</span>
          </div>
          <div className="experience-canvas twin-canvas">
            <div className="experience-scene-label"><span className={changed ? 'scenario-dot warning' : 'scenario-dot'} /> {scenario.label}</div>
            <SceneBoundary fallback={<div className="experience-webgl-fallback">La visualización 3D no está disponible. Los valores, descripciones y referencias del escenario siguen disponibles abajo.</div>}>
              <Canvas
                camera={{ position: [7.6, 5.2, 8.3], fov: 43 }}
                dpr={[1, 1.3]}
                gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
                fallback={<div className="experience-webgl-fallback">WebGL no está disponible en este navegador.</div>}
              >
                <HabitatScene
                  selectedZone={selectedZone}
                  showSensors={showSensors}
                  showAirflow={showAirflow}
                  onSelectZone={setSelectedZone}
                />
                <CameraControls controlsRef={controlsRef} />
              </Canvas>
            </SceneBoundary>
            <button type="button" className="experience-camera-reset" onClick={() => controlsRef.current?.reset()}>
              <RotateCcw size={12} /> Restablecer cámara
            </button>
            <div className="twin-canvas-caption">Distribución esquemática · las capas son ilustrativas, no medidas</div>
          </div>

          <div className="twin-visual-toggles" role="group" aria-label="Capas del modelo del hábitat">
            <button type="button" aria-pressed={showSensors} onClick={() => setShowSensors((current) => !current)}>
              <Activity size={14} /> Marcadores de sensores
              <span>{showSensors ? 'ACTIVADOS' : 'DESACTIVADOS'}</span>
            </button>
            <button type="button" aria-pressed={showAirflow} onClick={() => setShowAirflow((current) => !current)}>
              <Wind size={14} /> Indicador de flujo de aire
              <span>{showAirflow ? 'ACTIVADO' : 'DESACTIVADO'}</span>
            </button>
          </div>
          {(showSensors || showAirflow) && (
            <div className="twin-overlay-note" aria-live="polite">
              {showSensors && <span><i className="sensor-key oxygen" /> O₂ <i className="sensor-key carbon-monoxide" /> CO <i className="sensor-key carbon-dioxide" /> CO₂</span>}
              {showAirflow && <small>Solo es un indicador direccional · sin modelo de dinámica de fluidos computacional ni de ubicación de sensores</small>}
            </div>
          )}
          <div className="twin-zone-list" role="group" aria-label="Seleccionar zona del hábitat">
            {habitatZones.map((zone, index) => (
              <button
                type="button"
                key={zone.id}
                className={selectedZone.id === zone.id ? 'selected' : ''}
                aria-pressed={selectedZone.id === zone.id}
                onClick={() => setSelectedZone(zone)}
              >
                <span>0{index + 1}</span>{zone.label}
              </button>
            ))}
          </div>
          <div className="twin-zone-info" aria-live="polite">
            <Activity size={15} />
            <span><strong>{selectedZone.label}:</strong> {selectedZone.detail}</span>
          </div>
        </section>

        <aside className="twin-monitor-panel">
          <div className="experience-panel-heading">
            <div>
              <span className="panel-kicker">MONITOR DE CONDICIONES · DATOS HIPOTÉTICOS</span>
              <h3>Telemetría del escenario</h3>
            </div>
            <SlidersHorizontal size={17} />
          </div>
          <label className="twin-scenario-select">
            <span>ESCENARIO EDUCATIVO</span>
            <select value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}>
              {twinScenarios.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
            </select>
          </label>
          <p className="twin-scenario-description">{scenario.description}</p>

          <div className="twin-metric-grid">
            {metrics.map((metric) => (
              <TwinMetric
                key={metric.key}
                {...metric}
              />
            ))}
          </div>

          <div className={`twin-alert ${changed ? 'scenario-alert' : ''}`}>
            <span className="twin-alert-light" />
            <div>
              <strong>{changed ? 'INDICACIÓN PARA REVISIÓN EDUCATIVA' : 'ESCENARIO DE REFERENCIA'}</strong>
              <p>{scenario.alert}. No se implementan umbrales de alarma, lógica de detección ni respuestas de control.</p>
            </div>
          </div>

          <div className="twin-sensor-status">
            <span>ESTADO DE LOS SENSORES</span>
            <strong><i /> Indicadores simulados · sin diagnóstico de sensores</strong>
          </div>
        </aside>
      </div>

      <section className="twin-comparison-panel">
        <div className="experience-panel-heading">
          <div>
            <span className="panel-kicker">COMPARACIÓN DE ESCENARIOS · NO SON MEDICIONES</span>
            <h3>Condición de referencia y condición seleccionada</h3>
          </div>
          <span className="experience-badge"><ArrowLeftRight size={12} /> LADO A LADO</span>
        </div>
        <div className="twin-comparison-table" role="table" aria-label="Comparación de valores del escenario hipotético con la referencia">
          <div className="twin-comparison-row header" role="row">
            <span role="columnheader">Variable</span>
            <strong role="columnheader">Referencia (hipotética)</strong>
            <strong role="columnheader">{scenario.label}</strong>
            <span role="columnheader">Cambio en el escenario</span>
          </div>
          {metrics.map((metric) => {
            const start = DEFAULT_TWIN_STATE[metric.key]
            const current = values[metric.key]
            const difference = current - start
            const format = (number) => Number.isInteger(number) ? String(number) : number.toFixed(1)
            return (
              <div className="twin-comparison-row" role="row" key={metric.key}>
                <span role="rowheader">{metric.label}</span>
                <span role="cell">{format(start)} {metric.unit}</span>
                <strong role="cell">{format(current)} {metric.unit}</strong>
                <span role="cell">{difference === 0 ? '—' : `${difference > 0 ? '+' : ''}${format(difference)} ${metric.unit}`}</span>
              </div>
            )
          })}
        </div>
      </section>

      <div className="experience-science-grid">
        <details className="experience-science-card" open>
          <summary><span><Info size={15} /> Alcance científico y supuestos</span><ArrowDown size={14} /></summary>
          <p><strong>Clasificación:</strong> visualización conceptual. El hábitat 3D es esquemático; toda la telemetría mostrada son datos hipotéticos definidos manualmente.</p>
          <p><strong>Modelo:</strong> no se resuelven ecuaciones de combustión, atmósfera, sensores, temperatura o ventilación. Los valores del escenario son entradas educativas directas, no resultados predichos.</p>
          <p><strong>Limitaciones:</strong> no se representan la geometría de una nave espacial, normas de ubicación de sensores, comportamiento de materiales, umbrales de alarma ni procedimientos de control de incendios.</p>
        </details>
        <section className="experience-science-card">
          <span className="panel-kicker">INVESTIGACIÓN TRAZABLE Y SIGUIENTES PASOS</span>
          <h3>Continúa con la evidencia primaria</h3>
          <a href="https://ntrs.nasa.gov/citations/20150023456" target="_blank" rel="noreferrer">
            Título original de NASA · Detailed Results from the FLEX Experiment <ExternalLink size={13} />
          </a>
          <a href="https://ntrs.nasa.gov/citations/20210011385" target="_blank" rel="noreferrer">
            Título original de NASA · BASS-II Summary Report <ExternalLink size={13} />
          </a>
          <a href="#research"><BookOpen size={13} /> Buscar publicaciones indexadas en IGNIS</a>
          <a href="#assistant"><Activity size={13} /> Consultar a IGNIS IA sobre la evidencia citada</a>
        </section>
      </div>
    </section>
  )
}

const comparisonDefaults = {
  diameterMm: 2,
  evaporationK: 0.12,
  ambientTemperatureK: 300,
  oxygenPercent: 21,
  ventilationMs: 0.1
}

const overlayDefaults = {
  flameStructure: true,
  buoyancyFlow: true,
  massTransfer: true,
  thermalCue: false,
  sootMarkers: false
}

const gravityPresets = [
  { label: 'EEI · idealizado', value: 0, detail: '≈ 0 g' },
  { label: 'Lunar', value: 0.166, detail: '0,17 g' },
  { label: 'Marciano', value: 0.38, detail: '0,38 g' },
  { label: 'Terrestre', value: 1, detail: '1,00 g' }
]

function dropletDiameter(parameters, time) {
  return Math.sqrt(Math.max(0, parameters.diameterMm ** 2 - parameters.evaporationK * time))
}

function useSimulationClock(playing, elapsedSeconds, playbackRate) {
  const timeRef = React.useRef(elapsedSeconds)
  React.useEffect(() => {
    timeRef.current = elapsedSeconds
  }, [elapsedSeconds])
  useFrame((_, delta) => {
    if (playing) timeRef.current += delta * playbackRate
  })
  return timeRef
}

function CombustionEnvelope({
  scenario,
  gravityLevel,
  radius,
  oxygenPercent,
  ambientTemperatureK,
  overlays,
  playing,
  simulationTime
}) {
  const envelope = React.useRef(null)
  const oxygenFactor = clamp((oxygenPercent - 12) / 12, 0.2, 1)
  const heatTint = clamp((ambientTemperatureK - 250) / 650, 0, 1)
  const gravity = clamp(gravityLevel, 0, 1)
  const isDroplet = scenario === 'droplet'
  const flameColor = heatTint > 0.58 ? '#ff8b4e' : '#f6b95e'
  const flameOpacity = 0.2 + oxygenFactor * 0.28
  useFrame(() => {
    if (!envelope.current) return
    const pulse = playing ? 1 + Math.sin(simulationTime.current * 2.2) * 0.018 : 1
    const xScale = isDroplet ? 1 - gravity * 0.16 : 1 - gravity * 0.24
    const yScale = isDroplet ? 1 + gravity * 0.34 : 0.82 + gravity * 1.42
    envelope.current.scale.set(xScale * pulse, yScale * pulse, xScale * pulse)
    envelope.current.position.y = isDroplet ? gravity * 0.12 : -0.42 + gravity * 0.16
  })

  return (
    <group ref={envelope}>
      {overlays.flameStructure && (
        isDroplet ? (
          <>
            <mesh>
              <sphereGeometry args={[radius * 1.9, 32, 24]} />
              <meshBasicMaterial color={flameColor} transparent opacity={flameOpacity * 0.45} depthWrite={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[radius * 1.52, 30, 22]} />
              <meshBasicMaterial color="#ffc06d" transparent opacity={flameOpacity * 0.62} depthWrite={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[radius * 1.12, 26, 20]} />
              <meshBasicMaterial color="#ffe1a0" transparent opacity={flameOpacity * 0.34} depthWrite={false} />
            </mesh>
          </>
        ) : (
          <>
            <mesh>
              <sphereGeometry args={[0.34, 32, 24]} />
              <meshBasicMaterial color={flameColor} transparent opacity={flameOpacity * 0.48} depthWrite={false} />
            </mesh>
            <mesh position={[0, 0.36, 0]} scale={[1, Math.max(0.015, gravity), 1]}>
              <coneGeometry args={[0.32, 1.05, 32, 12]} />
              <meshBasicMaterial color={flameColor} transparent opacity={flameOpacity * gravity * 0.72} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <mesh position={[0, 0.1, 0]} scale={[0.72, 0.8 + gravity * 0.34, 0.72]}>
              <sphereGeometry args={[0.25, 28, 20]} />
              <meshBasicMaterial color="#ffe1a0" transparent opacity={flameOpacity * 0.56} depthWrite={false} />
            </mesh>
          </>
        )
      )}
      {overlays.thermalCue && (
        <mesh position={[0, isDroplet ? 0 : 0.12, 0]}>
          <sphereGeometry args={[isDroplet ? radius * 2.2 : 0.57, 24, 18]} />
          <meshBasicMaterial
            color={heatTint > 0.58 ? '#ff7652' : '#ffd17a'}
            transparent
            opacity={0.055 + heatTint * 0.055}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

function TransportCue({
  gravityLevel,
  ventilationMs,
  overlays,
  simulationTime,
  onSelect
}) {
  const buoyancyParticles = React.useRef([])
  const transferParticles = React.useRef([])
  const sootParticles = React.useRef([])
  const gravity = clamp(gravityLevel, 0, 1)
  const buoyancyLength = 0.28 + gravity * 0.82
  const particleCount = 12
  const transferCount = 16
  const sootCount = 8
  const windLength = ventilationMs * 2.2

  useFrame(() => {
    const time = simulationTime.current
    buoyancyParticles.current.forEach((particle, index) => {
      if (!particle) return
      const progress = (time * (0.12 + gravity * 0.26) + index / particleCount) % 1
      particle.position.set(
        0.6 + Math.sin(progress * Math.PI * 4) * 0.1,
        -0.5 + progress * buoyancyLength,
        0.05 + Math.cos(progress * Math.PI * 4) * 0.08
      )
    })
    transferParticles.current.forEach((particle, index) => {
      if (!particle) return
      const angle = (index / transferCount) * Math.PI * 2 + time * 0.18
      const radius = 0.32 + ((time * 0.09 + index / transferCount) % 1) * 0.45
      particle.position.set(
        Math.cos(angle) * radius + Math.sin(time * 0.2 + index) * ventilationMs * 0.16,
        -0.48 + Math.sin(angle) * radius * 0.68,
        Math.sin(angle) * radius
      )
    })
    sootParticles.current.forEach((particle, index) => {
      if (!particle) return
      const progress = (time * 0.08 + index / sootCount) % 1
      particle.position.set(
        0.12 + Math.sin(progress * Math.PI * 3 + index) * 0.1,
        0.05 + progress * (0.45 + gravity * 0.5),
        Math.cos(progress * Math.PI * 3 + index) * 0.1
      )
    })
  })

  return (
    <group>
      {overlays.buoyancyFlow && gravity > 0.01 && (
        <group onClick={(event) => {
          event.stopPropagation()
          onSelect('Indicador de flujo por flotabilidad', 'Las partículas ascendentes y la flecha son cualitativas y se escalan según la gravedad seleccionada. No representan un campo de velocidad calculado; la difusión y la ventilación impuesta se representan por separado.')
        }}>
          <mesh position={[0.6, -0.5 + buoyancyLength / 2, 0.05]}>
            <cylinderGeometry args={[0.012, 0.012, buoyancyLength, 8]} />
            <meshBasicMaterial color="#ffb56e" transparent opacity={0.25 + gravity * 0.4} />
          </mesh>
          <mesh position={[0.6, -0.5 + buoyancyLength, 0.05]}>
            <coneGeometry args={[0.06, 0.16, 10]} />
            <meshBasicMaterial color="#ffcf83" transparent opacity={0.4 + gravity * 0.5} />
          </mesh>
          {Array.from({ length: particleCount }, (_, index) => (
            <mesh key={`buoyancy-${index}`} ref={(node) => { buoyancyParticles.current[index] = node }}>
              <sphereGeometry args={[0.025, 7, 6]} />
              <meshBasicMaterial color="#ffbb74" transparent opacity={0.55} />
            </mesh>
          ))}
        </group>
      )}
      {overlays.massTransfer && (
        <group onClick={(event) => {
          event.stopPropagation()
          onSelect('Indicador de transferencia de masa', 'Las partículas cian indican que la difusión molecular puede continuar con baja gravedad. Sus trayectorias son ilustrativas y no resuelven el transporte ni la concentración de especies.')
        }}>
          {Array.from({ length: transferCount }, (_, index) => (
            <mesh key={`transfer-${index}`} ref={(node) => { transferParticles.current[index] = node }}>
              <sphereGeometry args={[0.018, 6, 5]} />
              <meshBasicMaterial color={index % 2 ? '#43d5e5' : '#a9eff1'} transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      )}
      {overlays.sootMarkers && (
        <group onClick={(event) => {
          event.stopPropagation()
          onSelect('Marcadores simbólicos de hollín', 'Estos marcadores oscuros opcionales son solo ilustrativos. La escena no calcula la formación, concentración ni producción de hollín.')
        }}>
          {Array.from({ length: sootCount }, (_, index) => (
            <mesh key={`soot-${index}`} ref={(node) => { sootParticles.current[index] = node }}>
              <sphereGeometry args={[0.024, 7, 6]} />
              <meshBasicMaterial color="#627181" transparent opacity={0.68} />
            </mesh>
          ))}
        </group>
      )}
      {ventilationMs > 0 && (
        <>
          <mesh
            position={[-0.92 - windLength / 2, -0.02, 0]}
            rotation={[0, 0, Math.PI / 2]}
            onClick={(event) => {
              event.stopPropagation()
              onSelect('Entrada de ventilación impuesta', `${ventilationMs.toFixed(2)} m/s es un indicador ilustrativo seleccionado por el usuario. La escena no calcula el flujo resultante ni la respuesta de la llama.`)
            }}
          >
            <cylinderGeometry args={[0.014, 0.014, windLength, 8]} />
            <meshBasicMaterial color="#ffc06d" />
          </mesh>
          <mesh position={[-0.92 - windLength, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.07, 0.18, 10]} />
            <meshBasicMaterial color="#ffc06d" />
          </mesh>
        </>
      )}
    </group>
  )
}

function ComparisonScene({
  scenario,
  gravityLevel,
  parameters,
  elapsedSeconds,
  playing,
  playbackRate,
  overlays,
  onSelect
}) {
  const simulationTime = useSimulationClock(playing, elapsedSeconds, playbackRate)
  const diameter = dropletDiameter(parameters, elapsedSeconds)
  const radius = Math.max(0.015, diameter * 0.13)
  return (
    <>
      <color attach="background" args={['#081320']} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 5, 3]} intensity={1.5} color="#ffe2c0" />
      <pointLight position={[-1, 1, 1]} intensity={5} distance={5} color="#ff8745" />
      <gridHelper args={[5, 20, '#234456', '#172b3e']} position={[0, -0.9, 0]} />
      {scenario === 'droplet' ? (
        <mesh position={[0, -0.62, 0]} onClick={(event) => {
          event.stopPropagation()
          onSelect('Gota de combustible líquido', `Diámetro idealizado según la ley d² en t = ${elapsedSeconds.toFixed(1)} s: ${diameter.toFixed(2)} mm. K es un coeficiente seleccionado por el usuario; no se ajustó a un ensayo FLEX.`)
        }}>
          <sphereGeometry args={[radius, 28, 20]} />
          <meshPhysicalMaterial color="#4fd7e2" roughness={0.22} metalness={0.08} clearcoat={0.8} />
        </mesh>
      ) : (
        <group onClick={(event) => {
          event.stopPropagation()
          onSelect('Esquema de vela y mecha', 'La vela es solo una referencia geométrica. No se modelan la vaporización del combustible, el comportamiento de la mecha, la química de combustión ni la física de propagación de llama.')
        }}>
          <mesh position={[0, -0.83, 0]}>
            <cylinderGeometry args={[0.24, 0.27, 0.12, 24]} />
            <meshStandardMaterial color="#526779" metalness={0.55} roughness={0.42} />
          </mesh>
          <mesh position={[0, -0.7, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.18, 10]} />
            <meshStandardMaterial color="#d4c6a9" roughness={0.8} />
          </mesh>
        </group>
      )}
      <group
        position={scenario === 'droplet' ? [0, -0.62 + radius + 0.05, 0] : [0, 0, 0]}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(
            scenario === 'droplet' ? 'Envolvente de llama de la gota' : 'Envolvente de llama de la vela',
            `Esta forma conceptual de llama cambia continuamente con la entrada de gravedad seleccionada (${gravityLevel.toFixed(2)} g). Es una correspondencia visual, no una dimensión de llama calculada ni un experimento validado.`
          )
        }}
      >
        <CombustionEnvelope
          scenario={scenario}
          gravityLevel={gravityLevel}
          radius={scenario === 'droplet' ? Math.max(radius, 0.18) : 0.3}
          oxygenPercent={parameters.oxygenPercent}
          ambientTemperatureK={parameters.ambientTemperatureK}
          overlays={overlays}
          playing={playing}
          simulationTime={simulationTime}
        />
      </group>
      <TransportCue
        gravityLevel={gravityLevel}
        ventilationMs={parameters.ventilationMs}
        overlays={overlays}
        simulationTime={simulationTime}
        onSelect={onSelect}
      />
      <mesh position={[0, -0.9, 0]}>
        <torusGeometry args={[0.35, 0.01, 6, 42]} />
        <meshBasicMaterial color="#35cddd" transparent opacity={0.38} />
      </mesh>
    </>
  )
}

function ComparisonChart({
  scenario,
  data,
  renderingData,
  currentDiameter,
  elapsedSeconds,
  duration,
  gravityLevel
}) {
  if (scenario === 'candle') {
    return (
      <section className="comparison-chart-panel" aria-label="Mapa conceptual de visualización de la vela">
        <div className="experience-panel-heading">
          <div>
            <span className="panel-kicker">MAPA CONCEPTUAL DE VISUALIZACIÓN · NO ES UNA SALIDA FÍSICA</span>
            <h3>Entrada de gravedad e indicadores visuales</h3>
          </div>
          <strong>{gravityLevel.toFixed(2)} g</strong>
        </div>
        <div className="comparison-chart-canvas">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={renderingData} margin={{ top: 10, right: 14, left: 2, bottom: 8 }}>
              <CartesianGrid stroke="#243449" strokeDasharray="3 5" />
              <XAxis dataKey="gravity" type="number" domain={[0, 1]} stroke="#8293a8" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 'auto']} stroke="#8293a8" tick={{ fontSize: 10 }} width={45} />
              <Tooltip
                contentStyle={{ background: '#101a29', border: '1px solid #344a61', borderRadius: 6, fontSize: 11 }}
                labelFormatter={(value) => `${Number(value).toFixed(2)} g`}
                formatter={(value) => [Number(value).toFixed(2), 'Indicador visual (adimensional)']}
              />
              <Legend wrapperStyle={{ fontSize: 10, color: '#b8c5d5' }} />
              <ReferenceLine x={gravityLevel} stroke="#ffd08a" strokeDasharray="3 4" />
              <Line type="monotone" dataKey="shapeCue" name="Correspondencia de forma de la envolvente" stroke="#ff9a5c" strokeWidth={2.2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="buoyancyCue" name="Correspondencia del indicador de flotabilidad" stroke="#35cddd" strokeWidth={1.8} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="lab-chart-caveat">Estas curvas adimensionales muestran cómo responde la visualización al control de gravedad; no son predicciones de altura de llama, mediciones ni relaciones físicas validadas.</p>
      </section>
    )
  }

  return (
    <section className="comparison-chart-panel" aria-label="Diámetro simplificado de la gota en función del tiempo">
      <div className="experience-panel-heading">
        <div>
          <span className="panel-kicker">SALIDA CALCULADA DEL MODELO · NO SON DATOS EXPERIMENTALES</span>
          <h3>Diámetro idealizado de la gota</h3>
        </div>
        <strong>{currentDiameter.toFixed(2)} mm</strong>
      </div>
      <div className="comparison-chart-canvas">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 14, left: 2, bottom: 8 }}>
            <CartesianGrid stroke="#243449" strokeDasharray="3 5" />
            <XAxis dataKey="time" type="number" domain={[0, duration]} stroke="#8293a8" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 'auto']} stroke="#8293a8" tick={{ fontSize: 10 }} width={45} />
            <Tooltip
              contentStyle={{ background: '#101a29', border: '1px solid #344a61', borderRadius: 6, fontSize: 11 }}
              labelFormatter={(value) => `t = ${Number(value).toFixed(2)} s`}
              formatter={(value) => [`${Number(value).toFixed(3)} mm`]}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: '#b8c5d5' }} />
            <ReferenceLine x={elapsedSeconds} stroke="#ffd08a" strokeDasharray="3 4" />
            <Line type="monotone" dataKey="earth" name="Tierra · modelo d²" stroke="#ff9a5c" strokeWidth={2.2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="microgravity" name="Gravedad seleccionada · mismo modelo d²" stroke="#35cddd" strokeWidth={1.8} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="lab-chart-caveat">Las líneas coinciden porque la gravedad no forma parte de la relación d² seleccionada. Esta es una limitación declarada del modelo, no evidencia de que las velocidades reales de combustión de gotas sean iguales en distintas condiciones de gravedad.</p>
    </section>
  )
}

function gravityCueLabel(gravityLevel) {
  if (gravityLevel <= 0.03) return 'Flotabilidad suprimida en este límite idealizado'
  if (gravityLevel < 0.2) return 'Indicador de flotabilidad reducida'
  if (gravityLevel < 0.7) return 'Indicador de flotabilidad intermedia'
  return 'Indicador de flotabilidad similar a la terrestre'
}

function flameShapeLabel(scenario, gravityLevel) {
  if (gravityLevel <= 0.03) return scenario === 'candle' ? 'Envolvente compacta y redondeada' : 'Envolvente casi esférica'
  if (gravityLevel >= 0.7) return scenario === 'candle' ? 'Indicador de penacho alargado' : 'Indicador de penacho asimétrico'
  return 'Forma conceptual intermedia'
}

function ComparisonReadout({ scenario, gravityLevel, ventilationMs }) {
  const selectedGravity = gravityLevel.toFixed(2)
  const selectedShape = flameShapeLabel(scenario, gravityLevel)
  const selectedBuoyancy = gravityCueLabel(gravityLevel)
  const selectedTransport = gravityLevel <= 0.03
    ? 'Difusión y ventilación impuesta; flotabilidad suprimida'
    : 'Difusión, ventilación impuesta e indicador de flotabilidad'
  const rows = [
    ['Geometría de la llama', 'Indicador alargado / asimétrico', selectedShape],
    ['Flotabilidad', 'Indicador de referencia terrestre', selectedBuoyancy],
    ['Transporte mostrado', 'Flotabilidad + difusión + flujo impuesto', selectedTransport],
    ['Simetría', 'Esquema potencialmente asimétrico', gravityLevel <= 0.03 ? 'Esquema más simétrico radialmente' : 'Esquema intermedio'],
    ['Comportamiento del hollín', 'No se calcula; marcadores simbólicos opcionales', 'No se calcula; marcadores simbólicos opcionales'],
    ['Transferencia de calor', 'No se resuelve; solo indicador de color opcional', 'No se resuelve; solo indicador de color opcional'],
    ['Implicación científica', 'No representa el comportamiento a gravedad reducida', 'La visualización no predice resultados experimentales']
  ]
  return (
    <section className="gravity-comparison-readout" aria-label="Comparación cualitativa entre la Tierra y la gravedad seleccionada">
      <div className="experience-panel-heading">
        <div>
          <span className="panel-kicker">COMPARACIÓN EN TIEMPO REAL · SOLO INDICADORES CUALITATIVOS</span>
          <h3>{scenario === 'candle' ? 'Llama de vela' : 'Combustión de gotas'}: referencia terrestre y condición seleccionada</h3>
        </div>
        <span className="gravity-input-tag">{selectedGravity} g seleccionada</span>
      </div>
      <div className="gravity-readout-table" role="table" aria-label="Comparación cualitativa entre la referencia terrestre y la condición de gravedad seleccionada">
        <div className="gravity-readout-row is-header" role="row">
          <span role="columnheader">Aspecto</span>
          <strong role="columnheader">Tierra · 1,00 g</strong>
          <strong role="columnheader">Seleccionada · {selectedGravity} g</strong>
        </div>
        {rows.map(([aspect, earth, selected]) => (
          <div className="gravity-readout-row" role="row" key={aspect}>
            <span role="rowheader">{aspect}</span>
            <span role="cell">{earth}</span>
            <span role="cell">{selected}</span>
          </div>
        ))}
      </div>
      <p className="lab-chart-caveat">Ambas escenas usan la misma entrada de flujo impuesto de {ventilationMs.toFixed(2)} m/s. Los indicadores de geometría y transporte son ilustrativos; no se calculan resultados de hollín, transferencia de calor, transporte de especies ni propagación de llama.</p>
    </section>
  )
}

function ParameterSlider({ label, value, min, max, step, unit, onChange, help }) {
  const precision = step < 0.1 ? 2 : step < 1 ? 1 : 0
  return (
    <label className="lab-parameter">
      <span className="lab-parameter-heading">
        <span>{label}</span>
        <output>{Number(value).toFixed(precision)} {unit}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <small>{help}</small>
    </label>
  )
}

const variableDetails = {
  diameterMm: {
    label: 'Diámetro de la gota',
    detail: 'El diámetro inicial D₀ define la escala de la gota y el valor inicial de la relación d² mostrada. El diámetro actual se calcula con el coeficiente seleccionado y el tiempo transcurrido.'
  },
  evaporationK: {
    label: 'Coeficiente ilustrativo K',
    detail: 'El valor de K en mm²/s se selecciona libremente para esta demostración; no se midió ni se ajustó con datos de FLEX/FLEX-2. Al cambiar K, la curva de diámetro del modelo cambia por igual en ambos paneles.'
  },
  ambientTemperatureK: {
    label: 'Entrada de temperatura ambiente',
    detail: 'Esta entrada solo modifica el indicador de color de la escena. No se calculan la temperatura de la gota, la temperatura de la llama, la transferencia de calor ni las velocidades de reacción química.'
  },
  oxygenPercent: {
    label: 'Entrada de fracción de oxígeno',
    detail: 'Esta entrada solo modifica el énfasis visual de la envolvente de la llama. No se infieren límites de inflamabilidad, umbrales de oxígeno ni respuestas de velocidad de combustión.'
  },
  ventilationMs: {
    label: 'Entrada de ventilación impuesta',
    detail: 'Esta entrada modifica el indicador de flujo de aire dibujado en ambas escenas. No es un campo de flujo calculado ni cambia el modelo d².'
  },
  gravity: {
    label: 'Control de gravedad',
    detail: 'La escena terrestre permanece como referencia de 1 g. Este control modifica continuamente la entrada de gravedad de la segunda escena; solo ajusta la geometría conceptual y un indicador de flotabilidad, no resuelve físicamente la llama.'
  },
  flameMode: {
    label: 'Escenario',
    detail: 'Cambia entre una gota de combustible líquido y un esquema de vela. La vela no incluye la física de la mecha, la vaporización ni la propagación de llama.'
  }
}

function ComparisonScenePanel({
  mode,
  scenario,
  gravityLevel,
  parameters,
  elapsedSeconds,
  playing,
  playbackRate,
  overlays,
  onSelect,
  controlsRef,
  cameraControls,
  registerControls,
  syncEnabled,
  cameraIndex,
  syncGuard
}) {
  const isEarth = mode === 'earth'
  const sceneGravity = isEarth ? 1 : gravityLevel
  const gravity = `${sceneGravity.toFixed(2)} g · ${(sceneGravity * 9.81).toFixed(2)} m/s²`
  const title = isEarth ? 'A · REFERENCIA TERRESTRE' : 'B · GRAVEDAD SELECCIONADA'
  const scenarioLabel = scenario === 'candle' ? 'VELA' : 'GOTA'
  const sceneCue = flameShapeLabel(scenario, sceneGravity).toUpperCase()
  const currentDiameter = dropletDiameter(parameters, elapsedSeconds)
  return (
    <section className={`gravity-scene-panel gravity-scene-${mode}`} aria-label={title}>
      <div className="gravity-scene-heading">
        <div>
          <span className="panel-kicker">{title}</span>
          <h3>{scenario === 'candle' ? (isEarth ? 'Referencia de llama a 1 g' : 'Condición seleccionada de la vela') : (isEarth ? 'Gota · referencia de 1 g' : 'Gota · condición seleccionada')}</h3>
        </div>
        <span className="gravity-input-tag">g = {gravity}</span>
      </div>
      <div className="experience-canvas gravity-canvas">
        <div className="experience-scene-label">{scenarioLabel} · {sceneCue} · CONCEPTUAL</div>
        <SceneBoundary fallback={<div className="experience-webgl-fallback">La visualización 3D no está disponible. Usa el modelo, la gráfica comparativa y las notas científicas de abajo.</div>}>
          <Canvas
            camera={{ position: [3.8, 2.7, 4.8], fov: 42 }}
            dpr={[1, 1.25]}
            gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
            fallback={<div className="experience-webgl-fallback">WebGL no está disponible en este navegador.</div>}
          >
            <ComparisonScene
              scenario={scenario}
              gravityLevel={sceneGravity}
              parameters={parameters}
              elapsedSeconds={elapsedSeconds}
              playing={playing}
              playbackRate={playbackRate}
              overlays={overlays}
              onSelect={onSelect}
            />
            <CameraControls
              controlsRef={controlsRef}
              cameraControls={cameraControls}
              registerControls={registerControls}
              syncEnabled={syncEnabled}
              cameraIndex={cameraIndex}
              syncGuard={syncGuard}
            />
          </Canvas>
        </SceneBoundary>
        <button type="button" className="experience-camera-reset" onClick={() => controlsRef.current?.reset()}>
          <RotateCcw size={12} /> Restablecer cámara
        </button>
        <div className="gravity-scene-scale">Mismo escenario y entradas ambientales · solo correspondencia visual</div>
      </div>
      <div className="gravity-scene-readout">
        <span><i className={isEarth ? 'gravity-dot earth-dot' : 'gravity-dot micro-dot'} /> {gravityCueLabel(sceneGravity)}</span>
        <span><Thermometer size={11} /> Entrada de temperatura ambiente: {parameters.ambientTemperatureK} K</span>
        {scenario === 'droplet' && <strong>d(t) = {currentDiameter.toFixed(2)} mm</strong>}
      </div>
    </section>
  )
}

function ComparisonDataTable({ scenario, gravityLevel, parameters, elapsedSeconds }) {
  const diameter = dropletDiameter(parameters, elapsedSeconds)
  const dataRows = [
    ['Entrada de gravedad', '1,00 g · 9,81 m/s²', `${gravityLevel.toFixed(2)} g · ${(gravityLevel * 9.81).toFixed(2)} m/s²`],
    ['Escenario', scenario === 'droplet' ? 'Gota de combustible líquido' : 'Esquema de vela y mecha', scenario === 'droplet' ? 'Gota de combustible líquido' : 'Esquema de vela y mecha'],
    ['Entrada de temperatura ambiente', `${parameters.ambientTemperatureK} K`, `${parameters.ambientTemperatureK} K`],
    ['Entrada de fracción de oxígeno', `${parameters.oxygenPercent.toFixed(1)} % vol`, `${parameters.oxygenPercent.toFixed(1)} % vol`],
    ['Entrada de ventilación impuesta', `${parameters.ventilationMs.toFixed(2)} m/s`, `${parameters.ventilationMs.toFixed(2)} m/s`]
  ]
  if (scenario === 'droplet') {
    dataRows.splice(2, 0,
      ['Diámetro inicial de la gota, D₀', `${parameters.diameterMm.toFixed(1)} mm`, `${parameters.diameterMm.toFixed(1)} mm`],
      ['Coeficiente d² ilustrativo, K', `${parameters.evaporationK.toFixed(2)} mm²/s`, `${parameters.evaporationK.toFixed(2)} mm²/s`],
      ['Diámetro actual del modelo', `${diameter.toFixed(2)} mm`, `${diameter.toFixed(2)} mm`]
    )
  }
  return (
    <section className="gravity-data-panel">
      <div className="experience-panel-heading">
        <div><span className="panel-kicker">CONDICIONES INICIALES COMPARTIDAS</span><h3>Entradas y salidas declaradas del modelo</h3></div>
      </div>
      <div className="twin-comparison-table" role="table" aria-label="Entradas y salidas del modelo para la referencia terrestre y la gravedad seleccionada">
        <div className="twin-comparison-row header" role="row">
          <span role="columnheader">Variable</span><strong role="columnheader">Referencia terrestre</strong><strong role="columnheader">Condición seleccionada</strong>
        </div>
        {dataRows.map(([name, earth, micro]) => (
          <div className="twin-comparison-row" role="row" key={name}>
            <span role="rowheader">{name}</span><span role="cell">{earth}</span><span role="cell">{micro}</span>
          </div>
        ))}
      </div>
      <p className="lab-chart-caveat">{scenario === 'droplet' ? 'El diámetro es idéntico en ambas columnas porque la relación d² seleccionada no incluye términos de gravedad ni de transporte. Esta es una limitación del modelo, no evidencia de que las velocidades reales de combustión de gotas sean iguales.' : 'La escena de la vela no tiene salidas físicas calculadas. Sus indicadores de forma y flujo son correspondencias visuales cualitativas, no dimensiones de llama medidas ni predicciones.'}</p>
    </section>
  )
}

export function MicrogravityLab() {
  const [parameters, setParameters] = React.useState(comparisonDefaults)
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const [playbackRate, setPlaybackRate] = React.useState(1)
  const [syncEnabled, setSyncEnabled] = React.useState(true)
  const [sceneView, setSceneView] = React.useState('split')
  const [panelView, setPanelView] = React.useState('scenes')
  const [scenario, setScenario] = React.useState('droplet')
  const [gravityLevel, setGravityLevel] = React.useState(0)
  const [overlays, setOverlays] = React.useState(overlayDefaults)
  const [selectedVariable, setSelectedVariable] = React.useState('gravity')
  const [selectedPart, setSelectedPart] = React.useState(null)
  const earthControls = React.useRef(null)
  const microControls = React.useRef(null)
  const [cameraControls, setCameraControls] = React.useState(EMPTY_CONTROLS)
  const registerCameraControls = React.useCallback((cameraIndex, controls) => {
    setCameraControls((current) => {
      if (current[cameraIndex] === controls) return current
      const next = [...current]
      next[cameraIndex] = controls
      return next
    })
  }, [])
  const syncGuard = React.useRef(false)
  const elapsedRef = React.useRef(0)
  const duration = scenario === 'droplet'
    ? Math.max(0.1, (parameters.diameterMm ** 2) / parameters.evaporationK)
    : 60
  const currentDiameter = dropletDiameter(parameters, elapsedSeconds)
  const chartData = React.useMemo(
    () => Array.from({ length: 51 }, (_, index) => {
      const time = (duration * index) / 50
      const diameter = dropletDiameter(parameters, time)
      return { time, earth: diameter, microgravity: diameter }
    }),
    [duration, parameters]
  )
  const renderingData = React.useMemo(
    () => Array.from({ length: 21 }, (_, index) => {
      const gravity = index / 20
      return { gravity, shapeCue: 0.82 + gravity * 1.42, buoyancyCue: gravity }
    }),
    []
  )

  React.useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      const next = scenario === 'droplet'
        ? Math.min(duration, elapsedRef.current + 0.1 * playbackRate)
        : (elapsedRef.current + 0.1 * playbackRate) % duration
      elapsedRef.current = next
      setElapsedSeconds(next)
      if (scenario === 'droplet' && next >= duration) setPlaying(false)
    }, 100)
    return () => window.clearInterval(timer)
  }, [duration, playbackRate, playing, scenario])

  function updateParameter(key, value) {
    const updated = { ...parameters, [key]: value }
    setParameters(updated)
    if (key === 'diameterMm' || key === 'evaporationK') {
      const nextDuration = Math.max(0.1, (updated.diameterMm ** 2) / updated.evaporationK)
      if (elapsedRef.current > nextDuration) {
        elapsedRef.current = nextDuration
        setElapsedSeconds(nextDuration)
        setPlaying(false)
      }
    }
  }

  function updateTime(value) {
    const next = clamp(value, 0, duration)
    elapsedRef.current = next
    setElapsedSeconds(next)
    setPlaying(false)
  }

  function resetTime() {
    setPlaying(false)
    elapsedRef.current = 0
    setElapsedSeconds(0)
  }

  function restoreDefaults() {
    setParameters({ ...comparisonDefaults })
    setScenario('droplet')
    setGravityLevel(0)
    setOverlays({ ...overlayDefaults })
    setSelectedVariable('gravity')
    setSelectedPart(null)
    setSceneView('split')
    setSyncEnabled(true)
    resetTime()
  }

  const shownScenes = sceneView === 'split' ? ['earth', 'microgravity'] : [sceneView]
  const variableOptions = Object.entries(variableDetails).filter(([key]) => (
    scenario === 'droplet' || (key !== 'diameterMm' && key !== 'evaporationK')
  ))
  const selectedVariableDetail = variableDetails[selectedVariable]
  const detail = selectedPart
    ? { label: selectedPart.label, text: selectedPart.description }
    : selectedVariableDetail
  const overlayOptions = [
    { key: 'flameStructure',     label: 'Capas de la envolvente de llama', color: '#ff9a5c' },
    { key: 'buoyancyFlow',     label: 'Indicador de flujo por flotabilidad', color: '#ffc06d' },
    { key: 'massTransfer',     label: 'Indicador de difusión / transferencia de masa', color: '#35cddd' },
    { key: 'thermalCue',     label: 'Indicador de color térmico', color: '#ff795d' },
    { key: 'sootMarkers',     label: 'Marcadores simbólicos de hollín', color: '#8998a7' }
  ]

  return (
    <section className="module-page ignis-experience">
      <PageHeader
        kicker="LABORATORIO DE GRAVEDAD IGNIS · VISUALIZACIÓN COMPARATIVA"
        title="Cómo la gravedad modifica la combustión"
        description="Explora escenas conceptuales 3D emparejadas de combustión de gotas y llamas de vela. Mantén una referencia terrestre junto a una condición de gravedad ajustable, con límites explícitos entre los indicadores visuales y las salidas calculadas."
      />

      <div className="experience-links" aria-label="Experiencias de IGNIS conectadas">
        <a href="#digital-twin"><Activity size={14} /> Abrir gemelo digital del hábitat <ArrowRight size={13} /></a>
        <a href="#experiments-lab"><Flame size={14} /> Explorar experimentos documentados <ArrowRight size={13} /></a>
        <a href="#research"><BookOpen size={14} /> Buscar evidencia de investigación <ArrowRight size={13} /></a>
        <a href="#assistant"><BookOpen size={14} /> Investigar con IGNIS IA <ArrowRight size={13} /></a>
      </div>

      <div className="gravity-workspace">
        <aside className="gravity-controls-panel">
          <div className="experience-panel-heading">
            <div><span className="panel-kicker">CONTROLES DEL LABORATORIO DE GRAVEDAD</span><h3>Configurar una comparación</h3></div>
            <SlidersHorizontal size={17} />
          </div>

          <div className="gravity-scenario-picker" role="group" aria-label="Elegir un escenario conceptual de llama">
            <button
              type="button"
              className={scenario === 'droplet' ? 'selected' : ''}
              aria-pressed={scenario === 'droplet'}
              onClick={() => {
                setScenario('droplet')
                setSelectedVariable('gravity')
                setSelectedPart(null)
                resetTime()
              }}
            >
              <Droplets size={15} /> Combustión de gotas
            </button>
            <button
              type="button"
              className={scenario === 'candle' ? 'selected' : ''}
              aria-pressed={scenario === 'candle'}
              onClick={() => {
                setScenario('candle')
                setSelectedVariable('gravity')
                setSelectedPart(null)
                resetTime()
              }}
            >
              <Flame size={15} /> Llama de vela
            </button>
          </div>
          <p className="gravity-control-note">Ambas escenas comparten el escenario y las entradas ambientales. La escena izquierda permanece en 1 g; la derecha sigue este control de gravedad.</p>

          <section className="gravity-control-section" aria-labelledby="gravity-slider-heading">
            <div className="gravity-control-heading">
              <div>
                <span className="panel-kicker">ENTRADA CONTINUA DE GRAVEDAD</span>
                <h4 id="gravity-slider-heading">Condición seleccionada</h4>
              </div>
              <output htmlFor="gravity-level-slider">{gravityLevel.toFixed(2)} g · {(gravityLevel * 9.81).toFixed(2)} m/s²</output>
            </div>
            <label className="gravity-range-label" htmlFor="gravity-level-slider">
              <span>0 g</span><span>1 g</span>
            </label>
            <input
              id="gravity-level-slider"
              className="gravity-range-input"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gravityLevel}
              onChange={(event) => {
                setGravityLevel(Number(event.target.value))
                setSelectedPart(null)
              }}
              aria-label="Gravedad seleccionada como fracción de la gravedad terrestre"
              aria-valuetext={`${gravityLevel.toFixed(2)} veces la gravedad terrestre, ${(gravityLevel * 9.81).toFixed(2)} metros por segundo al cuadrado`}
            />
            <div className="gravity-preset-list" role="group" aria-label="Valores preestablecidos de gravedad">
              {gravityPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  className={Math.abs(gravityLevel - preset.value) < 0.005 ? 'selected' : ''}
                  aria-pressed={Math.abs(gravityLevel - preset.value) < 0.005}
                  onClick={() => {
                    setGravityLevel(preset.value)
                    setSelectedPart(null)
                  }}
                >
                  <span>{preset.label}</span><small>{preset.detail}</small>
                </button>
              ))}
            </div>
            <p className="gravity-control-note">Los valores preestablecidos son entradas aproximadas de gravedad superficial. El valor de la EEI es un límite idealizado de 0 g, no una representación de la aceleración residual.</p>
          </section>

          <div className="gravity-input-lock"><Check size={13} /> La referencia terrestre permanece fija en 1,00 g</div>
          <div className="gravity-parameter-list">
            {scenario === 'droplet' && (
              <>
                <ParameterSlider
                  label="Diámetro inicial de la gota, D₀"
                  value={parameters.diameterMm}
                  min={0.5}
                  max={4}
                  step={0.1}
                  unit="mm"
                  onChange={(value) => updateParameter('diameterMm', value)}
                  help="Define el tamaño de la gota y D₀ en la relación d² simplificada."
                />
                <ParameterSlider
                  label="Coeficiente ilustrativo de evaporación, K"
                  value={parameters.evaporationK}
                  min={0.02}
                  max={0.5}
                  step={0.01}
                  unit="mm²/s"
                  onChange={(value) => updateParameter('evaporationK', value)}
                  help="Solo es una entrada del usuario; no se ajustó a un experimento FLEX/FLEX-2."
                />
              </>
            )}
            <ParameterSlider
              label="Entrada de temperatura ambiente"
              value={parameters.ambientTemperatureK}
              min={250}
              max={900}
              step={10}
              unit="K"
              onChange={(value) => updateParameter('ambientTemperatureK', value)}
              help="Solo es un indicador visual de color; no se calculan campos de temperatura."
            />
            <ParameterSlider
              label="Entrada de fracción de oxígeno"
              value={parameters.oxygenPercent}
              min={12}
              max={24}
              step={0.1}
              unit="% vol"
              onChange={(value) => updateParameter('oxygenPercent', value)}
              help="Solo modifica el énfasis visual de la envolvente; no se infiere un umbral de inflamabilidad."
            />
            <ParameterSlider
              label="Entrada de ventilación impuesta"
              value={parameters.ventilationMs}
              min={0}
              max={0.5}
              step={0.01}
              unit="m/s"
              onChange={(value) => updateParameter('ventilationMs', value)}
              help="Cambia el indicador de flujo de aire dibujado; no calcula un campo de flujo."
            />
          </div>

          <section className="gravity-overlay-control" aria-labelledby="gravity-overlay-heading">
            <div className="experience-panel-heading">
              <div><span className="panel-kicker">CAPAS VISUALES OPCIONALES</span><h3 id="gravity-overlay-heading">Capas de la escena</h3></div>
              <Layers3 size={15} />
            </div>
            <div className="gravity-overlay-list">
              {overlayOptions.map((overlay) => (
                <button
                  type="button"
                  key={overlay.key}
                  className={overlays[overlay.key] ? 'selected' : ''}
                  aria-pressed={overlays[overlay.key]}
                  onClick={() => {
                    setOverlays((current) => ({ ...current, [overlay.key]: !current[overlay.key] }))
                    setSelectedPart(null)
                  }}
                >
                  <i style={{ '--overlay-color': overlay.color }} />
                  <span>{overlay.label}</span>
                  <small>{overlays[overlay.key] ? 'ACTIVADA' : 'DESACTIVADA'}</small>
                </button>
              ))}
            </div>
            <p className="gravity-control-note">Todas las capas son ayudas visuales. No muestran temperaturas medidas, concentración de especies, producción de hollín ni flujo calculado.</p>
          </section>

          <div className="lab-playback-panel">
            <div className="lab-playback-status">
              <span className={playing ? 'lab-live-dot is-running' : 'lab-live-dot'} />
              {playing ? 'ANIMANDO' : 'EN PAUSA'} · t = {elapsedSeconds.toFixed(1)} s
            </div>
            <div className="lab-playback-actions">
              <button type="button" onClick={() => {
                if (!playing && elapsedSeconds >= duration) resetTime()
                setPlaying((current) => !current)
              }} aria-label={playing ? 'Pausar ambas escenas' : 'Animar ambas escenas'}>
                {playing ? <Pause size={14} /> : <Play size={14} />}{playing ? 'Pausar escenas' : 'Animar escenas'}
              </button>
              <button type="button" onClick={resetTime}><RotateCcw size={14} /> Reiniciar tiempo</button>
            </div>
            <label className="lab-rate-control">
              <span>Velocidad de reproducción</span>
              <select value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))}>
                <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option>
              </select>
            </label>
            <label className="gravity-timeline">
              <span>{scenario === 'droplet' ? 'Tiempo del modelo' : 'Tiempo de animación'} <output>{elapsedSeconds.toFixed(1)} s</output></span>
              <input
                type="range"
                min={0}
                max={duration}
                step={Math.max(0.01, Math.min(1, duration / 100))}
                value={elapsedSeconds}
                onChange={(event) => updateTime(Number(event.target.value))}
                aria-label="Tiempo del modelo en segundos"
              />
            </label>
          </div>
          <div className="lab-simulation-tools gravity-tools">
            <button type="button" onClick={restoreDefaults}><RotateCcw size={14} /> Restaurar valores predeterminados</button>
            <button
              type="button"
              className={syncEnabled ? 'selected' : ''}
              aria-pressed={syncEnabled}
              onClick={() => setSyncEnabled((current) => !current)}
            >
              <Camera size={14} /> Sincronización de cámara: {syncEnabled ? 'activada' : 'desactivada'}
            </button>
          </div>
          <details className="lab-model-assumptions">
            <summary>Clasificación y limitaciones del modelo</summary>
            <p><strong>Clasificación:</strong> visualizaciones 3D conceptuales de llama y transporte. Solo en el modo de gota se muestra por separado una relación matemática simplificada para el diámetro.</p>
            <p><strong>Ecuación (modo gota):</strong> D²(t) = máx(D₀² − Kt, 0), con D en mm, t en segundos y K seleccionado por el usuario en mm²/s. La ecuación no incluye la gravedad.</p>
            <p><strong>Correspondencia de gravedad:</strong> el control de gravedad modifica continuamente la geometría conceptual de la envolvente y el indicador de flotabilidad. Estas correspondencias visuales no son un solucionador físico de llamas.</p>
            <p><strong>Limitaciones:</strong> no se resuelven química, campo de temperatura, difusión de especies, transporte convectivo, radiación, formación de hollín, extinción, límites de la cámara ni una relación de velocidad de combustión dependiente de la gravedad. El modelo no está calibrado ni validado con experimentos.</p>
          </details>
        </aside>

        <div className="gravity-content-panel">
          <div className="gravity-lab-status"><Info size={14} /><span><strong>VISUALIZACIÓN CONCEPTUAL</strong> · No es una simulación numérica validada; no se reproduce ningún experimento medido.</span></div>
          <div className="gravity-display-toolbar">
            <div className="gravity-view-toggle" role="group" aria-label="Elegir vista de escena">
              {[
                ['split', 'Vista dividida'],
                ['earth', 'Solo la Tierra'],
                ['microgravity', 'Solo la seleccionada']
              ].map(([value, label]) => (
                <button type="button" key={value} className={sceneView === value ? 'selected' : ''} aria-pressed={sceneView === value} onClick={() => setSceneView(value)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="gravity-panel-toggle" role="tablist" aria-label="Vista de resultados de comparación">
              {[
                ['scenes', 'Escenas 3D'],
                ['graphs', 'Gráfica comparativa'],
                ['data', 'Vista de datos']
              ].map(([value, label]) => (
                <button type="button" role="tab" aria-selected={panelView === value} key={value} className={panelView === value ? 'selected' : ''} onClick={() => setPanelView(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {panelView === 'scenes' && (
            <>
              <div className={`gravity-scenes gravity-scenes-count-${shownScenes.length}`}>
                {shownScenes.map((mode) => (
                  <ComparisonScenePanel
                    key={mode}
                    mode={mode}
                    scenario={scenario}
                    gravityLevel={gravityLevel}
                    parameters={parameters}
                    elapsedSeconds={elapsedSeconds}
                    playing={playing}
                    playbackRate={playbackRate}
                    overlays={overlays}
                    onSelect={(label, description) => setSelectedPart({ label, description })}
                    controlsRef={mode === 'earth' ? earthControls : microControls}
                    cameraControls={cameraControls}
                    registerControls={registerCameraControls}
                    syncEnabled={syncEnabled}
                    cameraIndex={mode === 'earth' ? 0 : 1}
                    syncGuard={syncGuard}
                  />
                ))}
              </div>
              <ComparisonReadout
                scenario={scenario}
                gravityLevel={gravityLevel}
                ventilationMs={parameters.ventilationMs}
              />
              <div className="gravity-overlay-legend" aria-label="Active conceptual scene layers">
                <span className="panel-kicker">INDICADORES VISUALES ACTIVOS</span>
                {overlayOptions.filter(({ key }) => overlays[key]).map((overlay) => (
                  <span key={overlay.key}><i style={{ '--overlay-color': overlay.color }} />{overlay.label}</span>
                ))}
                <small>Solo codificación visual · no son campos medidos</small>
              </div>
              <div className="gravity-camera-hint"><Camera size={13} /> Arrastra para girar · desplázate para acercar · arrastra con el botón derecho para mover</div>
              <div className="gravity-selection-info" aria-live="polite">
                <Info size={15} /><span><strong>{detail.label}:</strong> {detail.detail ?? detail.text}</span>
              </div>
            </>
          )}

          {panelView === 'graphs' && (
            <ComparisonChart
              scenario={scenario}
              data={chartData}
              renderingData={renderingData}
              currentDiameter={currentDiameter}
              elapsedSeconds={elapsedSeconds}
              duration={duration}
              gravityLevel={gravityLevel}
            />
          )}

          {panelView === 'data' && (
            <ComparisonDataTable
              scenario={scenario}
              gravityLevel={gravityLevel}
              parameters={parameters}
              elapsedSeconds={elapsedSeconds}
            />
          )}

          <div className="gravity-variable-explorer">
            <div>
              <span className="panel-kicker">SELECCIONA UNA VARIABLE · EXPLICACIÓN CONTEXTUAL</span>
              <div className="gravity-variable-buttons">
                {variableOptions.map(([key, variable]) => (
                  <button
                    type="button"
                    key={key}
                    className={selectedVariable === key ? 'selected' : ''}
                    aria-pressed={selectedVariable === key}
                    onClick={() => {
                      setSelectedVariable(key)
                      setSelectedPart(null)
                    }}
                  >
                    {variable.label}
                  </button>
                ))}
              </div>
            </div>
            <p><strong>{detail.label}:</strong> {detail.detail ?? detail.text}</p>
          </div>
        </div>
      </div>

      <div className="gravity-science-grid">
        <section className="experience-science-card">
          <span className="panel-kicker">CONTEXTO CIENTÍFICO</span>
          <h3>Flotabilidad, convección y difusión</h3>
          <div className="gravity-physics-list">
            <article><span>01</span><div><strong>Flujo impulsado por flotabilidad</strong><p>Las diferencias de densidad en un campo gravitatorio pueden impulsar el movimiento alrededor de las llamas. La flecha ámbar y las partículas solo indican dirección; no representan un campo de velocidad resuelto.</p></div></article>
            <article><span>02</span><div><strong>La gravedad modifica el balance de transporte</strong><p>Los cambios de gravedad pueden alterar el transporte por flotabilidad, pero el comportamiento real de la llama también depende del combustible, la geometría, el oxidante, el flujo impuesto y los límites. Esta visualización no predice cuantitativamente esos efectos.</p></div></article>
            <article><span>03</span><div><strong>La difusión y la ventilación persisten</strong><p>La difusión de especies y el flujo impuesto pueden seguir moviendo el gas con baja gravedad. Los trazadores cian y la flecha de ventilación son trayectorias esquemáticas, no mediciones de concentración o flujo.</p></div></article>
          </div>
          <div className="gravity-warning"><Info size={15} /><p>El valor preestablecido de la EEI es una comparación idealizada de 0 g. No implica que la estación carezca de aceleración residual o movimiento del gas.</p></div>
        </section>

        <details className="experience-science-card" open>
          <summary><span><Activity size={15} /> Nivel de evidencia y supuestos</span><ArrowDown size={14} /></summary>
          <p><strong>Contexto de investigación establecido:</strong> NASA describe cómo la flotabilidad puede impulsar el flujo de una llama y complicar el análisis de la combustión terrestre. Las publicaciones vinculadas documentan experimentos; no validan esta visualización.</p>
          <p><strong>Salida conceptual:</strong> la forma de la llama, el halo térmico, los trazadores de transporte y los marcadores de hollín son representaciones ilustrativas sin una solución de campos físicos ni datos experimentales asociados.</p>
          <p><strong>Salida matemática simplificada:</strong> el modo de gota usa D²(t) = máx(D₀² − Kt, 0). Las curvas idénticas para distintas entradas de gravedad reflejan que la ecuación no incluye la gravedad; no son una comparación científica de velocidades reales de combustión.</p>
          <p><strong>Fuera de alcance:</strong> física de evaporación, acoplamiento de transferencia de calor y masa, química de combustión, resolución del flujo, pérdidas radiativas, propiedades específicas del combustible, efectos de la cámara, incertidumbre y validación experimental.</p>
        </details>
      </div>

      <section className="experience-science-card gravity-references">
        <div className="experience-panel-heading">
          <div><span className="panel-kicker">FUENTES PRIMARIAS DE NASA · NO SON DATOS DE CALIBRACIÓN DEL MODELO</span><h3>Contexto de investigación</h3></div>
          <BookOpen size={17} />
        </div>
        <a href="https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/" target="_blank" rel="noreferrer">NASA Glenn · título original: Combustion Science program (incluye ACME y BASS archivados) <ExternalLink size={13} /></a>
        <a href="https://ntrs.nasa.gov/citations/20150023456" target="_blank" rel="noreferrer">Título original de NASA · Detailed Results from the FLEX Experiment <ExternalLink size={13} /></a>
        <a href="https://ntrs.nasa.gov/citations/20210011385" target="_blank" rel="noreferrer">Título original de NASA · BASS-II Summary Report <ExternalLink size={13} /></a>
        <a href="#research"><BookOpen size={13} /> Buscar en la biblioteca indexada de IGNIS</a>
        <a href="#experiments-lab"><Flame size={13} /> Abrir el laboratorio 3D de simulación de combustión</a>
        <a href="#assistant"><Activity size={13} /> Consultar a IGNIS IA sobre la evidencia de las fuentes</a>
      </section>
    </section>
  )
}

