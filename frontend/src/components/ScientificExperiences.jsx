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
  ExternalLink,
  Flame,
  Info,
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
    label: 'Reference condition',
    description: 'Illustrative baseline for learning; not a measured spacecraft atmosphere.',
    values: DEFAULT_TWIN_STATE,
    alert: 'No scenario change selected'
  },
  {
    id: 'ventilation',
    label: 'Reduced ventilation · hypothetical',
    description: 'A hypothetical input set illustrates how monitored values might be reviewed together. It is not a prediction.',
    values: { temperatureC: 24, oxygenPercent: 20.9, carbonMonoxidePpm: 1, carbonDioxidePpm: 1100 },
    alert: 'Review hypothetical ventilation scenario'
  },
  {
    id: 'heating',
    label: 'Localized heating · hypothetical',
    description: 'A hypothetical localized heating case changes illustrative values only; no fire growth or sensor response is modeled.',
    values: { temperatureC: 36, oxygenPercent: 20.4, carbonMonoxidePpm: 3, carbonDioxidePpm: 1500 },
    alert: 'Review hypothetical heating scenario'
  }
]

const habitatZones = [
  { id: 'crew', label: 'Crew quarters', position: [-2.7, 0, 0], detail: 'Bunk and personal-equipment zone; displayed sensor markers are conceptual.' },
  { id: 'work', label: 'Work & science', position: [0, 0, 0], detail: 'Instrument rack and work surface; no real spacecraft layout is represented.' },
  { id: 'utility', label: 'Utility bay', position: [2.7, 0, 0], detail: 'Environmental-system equipment zone; no operational controls are modeled.' }
]

function HabitatRoom({ zone, selected, statusColor, onSelect }) {
  const trim = selected ? '#38d6e5' : '#38546a'
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
      <mesh position={[0, 0.75, -0.55]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1.8} />
      </mesh>
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

function HabitatScene({ selectedZone, scenarioId, onSelectZone }) {
  const color = scenarioId === 'baseline' ? '#35cddd' : '#ffae62'
  return (
    <>
      <color attach="background" args={['#081320']} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 7, 5]} intensity={1.65} color="#dcecff" />
      <pointLight position={[-3, 2, 1]} intensity={5} distance={9} color="#35cddd" />
      <pointLight position={[3, 1, -2]} intensity={3} distance={8} color="#ff914f" />
      <gridHelper args={[12, 24, '#234456', '#172b3e']} position={[0, -1.38, 0]} />
      {habitatZones.map((zone) => (
        <HabitatRoom
          key={zone.id}
          zone={zone}
          selected={selectedZone.id === zone.id}
          statusColor={color}
          onSelect={onSelectZone}
        />
      ))}
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
        <button type="button" className="twin-info-trigger" title={note} aria-label={`${label}: ${note}`}>
          <Info size={13} />
        </button>
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
  const controlsRef = React.useRef(null)
  const scenario = twinScenarios.find((item) => item.id === scenarioId) ?? twinScenarios[0]
  const values = scenario.values
  const changed = scenarioId !== 'baseline'

  const metrics = [
    { key: 'temperatureC', label: 'Ambient temperature', value: values.temperatureC.toFixed(1), unit: '°C', icon: Thermometer, range: 'Illustrative scale · 0–50 °C', percent: (values.temperatureC / 50) * 100, note: 'Hypothetical scenario value; not a habitat measurement or predicted thermal response.' },
    { key: 'oxygenPercent', label: 'Oxygen fraction', value: values.oxygenPercent.toFixed(1), unit: '% vol', icon: Activity, range: 'Illustrative input · 0–30 % vol', percent: (values.oxygenPercent / 30) * 100, note: 'Hypothetical concentration used to explore an interface; it does not represent a spacecraft atmosphere.' },
    { key: 'carbonMonoxidePpm', label: 'Carbon monoxide', value: String(values.carbonMonoxidePpm), unit: 'ppm', icon: Flame, range: 'Illustrative scale · 0–20 ppm', percent: (values.carbonMonoxidePpm / 20) * 100, note: 'Hypothetical concentration input; not a sensor measurement, alarm threshold, or safety recommendation.' },
    { key: 'carbonDioxidePpm', label: 'Carbon dioxide', value: String(values.carbonDioxidePpm), unit: 'ppm', icon: Wind, range: 'Illustrative scale · 0–2,000 ppm', percent: (values.carbonDioxidePpm / 2000) * 100, note: 'Hypothetical concentration input; not a sensor measurement, alarm threshold, or safety recommendation.' }
  ]

  return (
    <section className="module-page ignis-experience">
      <PageHeader
        kicker="IGNIS DIGITAL TWIN · EDUCATIONAL CONCEPT"
        title="A habitat you can inspect"
        description="Explore a schematic modular habitat, inspect its zones, and compare explicitly hypothetical safety scenarios. This is not a spacecraft replica, detection system, or operational control."
      />

      <div className="experience-links" aria-label="Connected IGNIS experiences">
        <a href="#experiments-lab"><Flame size={14} /> Open combustion lab <ArrowRight size={13} /></a>
        <a href="#microgravity-lab"><ArrowLeftRight size={14} /> Compare Earth & microgravity <ArrowRight size={13} /></a>
        <a href="#assistant"><BookOpen size={14} /> Investigate with IGNIS AI <ArrowRight size={13} /></a>
      </div>

      <div className="twin-workspace">
        <section className="twin-scene-panel" aria-label="Interactive habitat model">
          <div className="experience-panel-heading">
            <div>
              <span className="panel-kicker">SCHEMATIC HABITAT · INTERACTIVE 3D</span>
              <h3>Interior zones & sensor locations</h3>
            </div>
            <span className="experience-badge"><Camera size={12} /> ORBIT · ZOOM · PAN</span>
          </div>
          <div className="experience-canvas twin-canvas">
            <div className="experience-scene-label"><span className={changed ? 'scenario-dot warning' : 'scenario-dot'} /> {scenario.label}</div>
            <SceneBoundary fallback={<div className="experience-webgl-fallback">3D rendering is unavailable. Scenario values, descriptions, and references are still available below.</div>}>
              <Canvas
                camera={{ position: [7.6, 5.2, 8.3], fov: 43 }}
                dpr={[1, 1.3]}
                gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
                fallback={<div className="experience-webgl-fallback">WebGL is unavailable in this browser.</div>}
              >
                <HabitatScene
                  selectedZone={selectedZone}
                  scenarioId={scenarioId}
                  onSelectZone={setSelectedZone}
                />
                <CameraControls controlsRef={controlsRef} />
              </Canvas>
            </SceneBoundary>
            <button type="button" className="experience-camera-reset" onClick={() => controlsRef.current?.reset()}>
              <RotateCcw size={12} /> Reset camera
            </button>
            <div className="twin-canvas-caption">Schematic arrangement · sensor markers are illustrative</div>
          </div>

          <div className="twin-zone-list" role="group" aria-label="Select habitat zone">
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
              <span className="panel-kicker">CONDITION MONITOR · HYPOTHETICAL DATA</span>
              <h3>Scenario telemetry</h3>
            </div>
            <SlidersHorizontal size={17} />
          </div>
          <label className="twin-scenario-select">
            <span>EDUCATIONAL SCENARIO</span>
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
              <strong>{changed ? 'EDUCATIONAL REVIEW PROMPT' : 'REFERENCE SCENARIO'}</strong>
              <p>{scenario.alert}. No alarm thresholds, detection logic, or control response are implemented.</p>
            </div>
          </div>

          <div className="twin-sensor-status">
            <span>SENSOR STATUS</span>
            <strong><i /> Simulated indicators · no sensor diagnostics</strong>
          </div>
        </aside>
      </div>

      <section className="twin-comparison-panel">
        <div className="experience-panel-heading">
          <div>
            <span className="panel-kicker">SCENARIO COMPARISON · NOT MEASUREMENTS</span>
            <h3>Reference and selected condition</h3>
          </div>
          <span className="experience-badge"><ArrowLeftRight size={12} /> SIDE BY SIDE</span>
        </div>
        <div className="twin-comparison-table" role="table" aria-label="Hypothetical scenario values compared with reference">
          <div className="twin-comparison-row header" role="row">
            <span role="columnheader">Variable</span>
            <strong role="columnheader">Reference (hypothetical)</strong>
            <strong role="columnheader">{scenario.label}</strong>
            <span role="columnheader">Change in scenario</span>
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
          <summary><span><Info size={15} /> Scientific scope & assumptions</span><ArrowDown size={14} /></summary>
          <p><strong>Classification:</strong> conceptual visualization. The 3D habitat is schematic; all displayed telemetry is manually specified hypothetical scenario data.</p>
          <p><strong>Model:</strong> no combustion, atmosphere, sensor, thermal, or ventilation equations are solved. Scenario values are direct educational inputs, not predicted outcomes.</p>
          <p><strong>Limitations:</strong> no spacecraft geometry, sensor placement standard, material behavior, alarm threshold, or fire-control procedure is represented.</p>
        </details>
        <section className="experience-science-card">
          <span className="panel-kicker">TRACEABLE RESEARCH & NEXT STEPS</span>
          <h3>Continue with primary evidence</h3>
          <a href="https://ntrs.nasa.gov/citations/20150023456" target="_blank" rel="noreferrer">
            NASA · Detailed Results from the FLEX Experiment <ExternalLink size={13} />
          </a>
          <a href="https://ntrs.nasa.gov/citations/20210011385" target="_blank" rel="noreferrer">
            NASA · BASS-II Summary Report <ExternalLink size={13} />
          </a>
          <a href="#research"><BookOpen size={13} /> Search indexed publications in IGNIS</a>
          <a href="#assistant"><Activity size={13} /> Ask IGNIS AI about cited evidence</a>
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

function dropletDiameter(parameters, time) {
  return Math.sqrt(Math.max(0, parameters.diameterMm ** 2 - parameters.evaporationK * time))
}

function CombustionEnvelope({ mode, radius, oxygenPercent, ambientTemperatureK }) {
  const envelope = React.useRef(null)
  const oxygenFactor = clamp((oxygenPercent - 12) / 12, 0.2, 1)
  const heatTint = clamp((ambientTemperatureK - 250) / 650, 0, 1)
  useFrame(({ clock }) => {
    if (!envelope.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.018
    envelope.current.scale.set(mode === 'earth' ? 0.65 * pulse : pulse, mode === 'earth' ? 1.3 * pulse : 0.92 * pulse, mode === 'earth' ? 0.65 * pulse : pulse)
  })

  return (
    <group ref={envelope}>
      {mode === 'earth' ? (
        <>
          <mesh position={[0, 0.46, 0]}>
            <sphereGeometry args={[radius * 1.45, 28, 20]} />
            <meshBasicMaterial color="#ff9d59" transparent opacity={0.19 * oxygenFactor} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.27, 0]}>
            <coneGeometry args={[radius * 1.02, radius * 2.1, 32, 1, true]} />
            <meshBasicMaterial color={heatTint > 0.5 ? '#ff8b4e' : '#f6b95e'} transparent opacity={0.46 * oxygenFactor} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <coneGeometry args={[radius * 0.58, radius * 1.45, 28, 1, true]} />
            <meshBasicMaterial color="#ffe1a0" transparent opacity={0.52 * oxygenFactor} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </>
      ) : (
        <>
          <mesh>
            <sphereGeometry args={[radius * 1.85, 32, 24]} />
            <meshBasicMaterial color="#ff985a" transparent opacity={0.16 * oxygenFactor} depthWrite={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[radius * 1.42, 30, 22]} />
            <meshBasicMaterial color="#ffc06d" transparent opacity={0.25 * oxygenFactor} depthWrite={false} />
          </mesh>
          <mesh>
            <torusGeometry args={[radius * 2.05, 0.012, 6, 48]} />
            <meshBasicMaterial color="#49d6e5" transparent opacity={0.6} />
          </mesh>
        </>
      )}
    </group>
  )
}

function TransportCue({ mode, ventilationMs }) {
  const windLength = 0.25 + ventilationMs * 2.2
  return (
    <group>
      {mode === 'earth' ? (
        <>
          <mesh position={[0.95, 0.55, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.9, 8]} />
            <meshBasicMaterial color="#35cddd" />
          </mesh>
          <mesh position={[0.95, 1.04, 0]}>
            <coneGeometry args={[0.075, 0.2, 10]} />
            <meshBasicMaterial color="#35cddd" />
          </mesh>
          <mesh position={[0.96, 1.48, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.72, 7]} />
            <meshBasicMaterial color="#6ee3ea" transparent opacity={0.28} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0.98, 0.2, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
            <meshBasicMaterial color="#35cddd" transparent opacity={0.55} />
          </mesh>
          <mesh position={[0.98, 0.36, 0]}>
            <coneGeometry args={[0.06, 0.13, 10]} />
            <meshBasicMaterial color="#35cddd" transparent opacity={0.55} />
          </mesh>
        </>
      )}
      <mesh position={[-0.95 - windLength / 2, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, windLength, 8]} />
        <meshBasicMaterial color="#ffc06d" />
      </mesh>
      <mesh position={[-0.95 - windLength, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.18, 10]} />
        <meshBasicMaterial color="#ffc06d" />
      </mesh>
    </group>
  )
}

function ComparisonScene({ mode, parameters, elapsedSeconds, onSelect }) {
  const diameter = dropletDiameter(parameters, elapsedSeconds)
  const radius = Math.max(0.015, diameter * 0.13)
  return (
    <>
      <color attach="background" args={['#081320']} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 5, 3]} intensity={1.5} color="#ffe2c0" />
      <pointLight position={[-1, 1, 1]} intensity={5} distance={5} color="#ff8745" />
      <gridHelper args={[5, 20, '#234456', '#172b3e']} position={[0, -0.9, 0]} />
      <mesh position={[0, -0.62, 0]} onClick={(event) => {
        event.stopPropagation()
        onSelect('Liquid fuel droplet', `Idealized d²-law diameter at t = ${elapsedSeconds.toFixed(1)} s: ${diameter.toFixed(2)} mm. The user-selected coefficient is illustrative, not fitted to a FLEX test.`)
      }}>
        <sphereGeometry args={[radius, 28, 20]} />
        <meshPhysicalMaterial color="#4fd7e2" roughness={0.22} metalness={0.08} clearcoat={0.8} />
      </mesh>
      <group position={[0, -0.62 + radius + 0.05, 0]} onClick={(event) => {
        event.stopPropagation()
        onSelect(
          mode === 'earth' ? 'Earth-gravity transport context' : 'Idealized microgravity transport context',
          mode === 'earth'
            ? 'The upward cue indicates the direction of buoyancy-driven natural convection qualitatively. No flow field or flame response is calculated.'
            : 'The shortened gravity cue indicates the idealized g = 0 comparison. Diffusion and imposed ventilation remain possible; no transport field is calculated.'
        )
      }}>
        <CombustionEnvelope
          mode={mode}
          radius={Math.max(radius, 0.18)}
          oxygenPercent={parameters.oxygenPercent}
          ambientTemperatureK={parameters.ambientTemperatureK}
        />
      </group>
      <TransportCue mode={mode} ventilationMs={parameters.ventilationMs} />
      <mesh position={[0, -0.9, 0]}>
        <torusGeometry args={[0.35, 0.01, 6, 42]} />
        <meshBasicMaterial color="#35cddd" transparent opacity={0.38} />
      </mesh>
    </>
  )
}

function ComparisonChart({ data, currentDiameter, elapsedSeconds, duration }) {
  return (
    <section className="comparison-chart-panel" aria-label="Simplified droplet diameter versus time">
      <div className="experience-panel-heading">
        <div>
          <span className="panel-kicker">CALCULATED MODEL OUTPUT · NOT EXPERIMENTAL DATA</span>
          <h3>Idealized droplet diameter</h3>
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
            <Line type="monotone" dataKey="earth" name="Earth · d² model" stroke="#ff9a5c" strokeWidth={2.2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="microgravity" name="Microgravity · same d² model" stroke="#35cddd" strokeWidth={1.8} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="lab-chart-caveat">The lines coincide because gravity is not a term in the selected d² relation. This is a declared model limitation, not evidence that real droplet burning rates are equal in both environments.</p>
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
    label: 'Droplet diameter',
    detail: 'Initial diameter D₀ defines the droplet scale and the starting value in the displayed d² relation. Current diameter is calculated from the selected coefficient and elapsed time.'
  },
  evaporationK: {
    label: 'Illustrative coefficient K',
    detail: 'K in mm²/s is freely selected for this demonstration; it is not measured or fitted to FLEX/FLEX-2 data. Changing K changes the modelled diameter curve in both panels equally.'
  },
  ambientTemperatureK: {
    label: 'Ambient temperature input',
    detail: 'This input changes the scene color cue only. Droplet temperature, flame temperature, heat transfer, and chemical reaction rates are not calculated.'
  },
  oxygenPercent: {
    label: 'Oxygen fraction input',
    detail: 'This input changes flame-envelope visual emphasis only. No flammability limit, oxygen threshold, or burning-rate response is inferred.'
  },
  ventilationMs: {
    label: 'Imposed ventilation input',
    detail: 'This input changes the drawn airflow cue in both scenes. It is not a calculated flow field and does not change the d² model.'
  },
  gravity: {
    label: 'Gravity context',
    detail: 'The Earth panel uses 9.81 m/s²; the comparison panel uses an idealized g = 0 m/s² limit. Zero-g here does not mean gases are motionless: diffusion and imposed flow remain possible.'
  }
}

function ComparisonScenePanel({
  mode,
  parameters,
  elapsedSeconds,
  onSelect,
  controlsRef,
  cameraControls,
  registerControls,
  syncEnabled,
  cameraIndex,
  syncGuard
}) {
  const isEarth = mode === 'earth'
  const title = isEarth ? 'A · EARTH GRAVITY' : 'B · IDEALIZED MICROGRAVITY'
  const gravity = isEarth ? '9.81 m/s²' : '0 m/s²'
  return (
    <section className={`gravity-scene-panel gravity-scene-${mode}`} aria-label={title}>
      <div className="gravity-scene-heading">
        <div>
          <span className="panel-kicker">{title}</span>
          <h3>{isEarth ? 'Buoyancy-driven context' : 'Diffusion & imposed-flow context'}</h3>
        </div>
        <span className="gravity-input-tag">g = {gravity}</span>
      </div>
      <div className="experience-canvas gravity-canvas">
        <div className="experience-scene-label">{isEarth ? 'VERTICAL PLUME · SCHEMATIC' : 'APPROXIMATELY SPHERICAL · SCHEMATIC'}</div>
        <SceneBoundary fallback={<div className="experience-webgl-fallback">3D rendering is unavailable. Use the model, comparison chart, and scientific notes below.</div>}>
          <Canvas
            camera={{ position: [3.8, 2.7, 4.8], fov: 42 }}
            dpr={[1, 1.25]}
            gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
            fallback={<div className="experience-webgl-fallback">WebGL is unavailable in this browser.</div>}
          >
            <ComparisonScene
              mode={mode}
              parameters={parameters}
              elapsedSeconds={elapsedSeconds}
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
          <RotateCcw size={12} /> Reset camera
        </button>
        <div className="gravity-scene-scale">Same initial droplet · same selected ambient inputs</div>
      </div>
      <div className="gravity-scene-readout">
        <span><i className={isEarth ? 'gravity-dot earth-dot' : 'gravity-dot micro-dot'} /> {isEarth ? 'Natural convection can be buoyancy-driven' : 'Natural buoyancy is absent in the idealized limit'}</span>
        <span><Thermometer size={11} /> {parameters.ambientTemperatureK} K ambient input</span>
        <strong>d(t) = {dropletDiameter(parameters, elapsedSeconds).toFixed(2)} mm</strong>
      </div>
    </section>
  )
}

function ComparisonDataTable({ parameters, elapsedSeconds }) {
  const diameter = dropletDiameter(parameters, elapsedSeconds)
  const dataRows = [
    ['Gravity input', '9.81 m/s²', '0 m/s² (idealized)'],
    ['Initial droplet diameter', `${parameters.diameterMm.toFixed(1)} mm`, `${parameters.diameterMm.toFixed(1)} mm`],
    ['Illustrative d² coefficient, K', `${parameters.evaporationK.toFixed(2)} mm²/s`, `${parameters.evaporationK.toFixed(2)} mm²/s`],
    ['Current model diameter', `${diameter.toFixed(2)} mm`, `${diameter.toFixed(2)} mm`],
    ['Ambient temperature input', `${parameters.ambientTemperatureK} K`, `${parameters.ambientTemperatureK} K`],
    ['Oxygen fraction input', `${parameters.oxygenPercent.toFixed(1)} % vol`, `${parameters.oxygenPercent.toFixed(1)} % vol`],
    ['Imposed ventilation input', `${parameters.ventilationMs.toFixed(2)} m/s`, `${parameters.ventilationMs.toFixed(2)} m/s`]
  ]
  return (
    <section className="gravity-data-panel">
      <div className="experience-panel-heading">
        <div><span className="panel-kicker">SHARED INITIAL CONDITIONS</span><h3>Input and model-output table</h3></div>
      </div>
      <div className="twin-comparison-table" role="table" aria-label="Earth and idealized microgravity inputs and model outputs">
        <div className="twin-comparison-row header" role="row">
          <span role="columnheader">Variable</span><strong role="columnheader">Earth gravity</strong><strong role="columnheader">Idealized microgravity</strong>
        </div>
        {dataRows.map(([name, earth, micro]) => (
          <div className="twin-comparison-row" role="row" key={name}>
            <span role="rowheader">{name}</span><span role="cell">{earth}</span><span role="cell">{micro}</span>
          </div>
        ))}
      </div>
      <p className="lab-chart-caveat">The model output is the same in both columns because this simplified diameter law does not include gravity or transport. The different scene cues are qualitative and do not claim calculated flame dimensions or measured results.</p>
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
  const duration = Math.max(0.1, (parameters.diameterMm ** 2) / parameters.evaporationK)
  const currentDiameter = dropletDiameter(parameters, elapsedSeconds)
  const chartData = React.useMemo(
    () => Array.from({ length: 51 }, (_, index) => {
      const time = (duration * index) / 50
      const diameter = dropletDiameter(parameters, time)
      return { time, earth: diameter, microgravity: diameter }
    }),
    [duration, parameters]
  )

  React.useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      const next = Math.min(duration, elapsedRef.current + 0.1 * playbackRate)
      elapsedRef.current = next
      setElapsedSeconds(next)
      if (next >= duration) setPlaying(false)
    }, 100)
    return () => window.clearInterval(timer)
  }, [duration, playbackRate, playing])

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
    resetTime()
  }

  const shownScenes = sceneView === 'split' ? ['earth', 'microgravity'] : [sceneView]
  const detail = selectedPart
    ? { label: selectedPart.label, text: selectedPart.description }
    : variableDetails[selectedVariable]

  return (
    <section className="module-page ignis-experience">
      <PageHeader
        kicker="MICROGRAVITY VS EARTH LAB · COMPARATIVE MODEL"
        title="One droplet. Two transport environments."
        description="Compare a conceptual droplet flame under Earth gravity and an idealized zero-g limit, with shared initial inputs and a transparent simplified diameter model."
      />

      <div className="experience-links" aria-label="Connected IGNIS experiences">
        <a href="#digital-twin"><Activity size={14} /> Open habitat digital twin <ArrowRight size={13} /></a>
        <a href="#experiments-lab"><Flame size={14} /> Explore all combustion models <ArrowRight size={13} /></a>
        <a href="#assistant"><BookOpen size={14} /> Investigate with IGNIS AI <ArrowRight size={13} /></a>
      </div>

      <div className="gravity-workspace">
        <aside className="gravity-controls-panel">
          <div className="experience-panel-heading">
            <div><span className="panel-kicker">SHARED EXPERIMENT INPUTS</span><h3>Matched conditions</h3></div>
            <SlidersHorizontal size={17} />
          </div>
          <div className="gravity-input-lock"><Check size={13} /> Both environments share these inputs</div>
          <div className="gravity-parameter-list">
            <ParameterSlider
              label="Initial droplet diameter, D₀"
              value={parameters.diameterMm}
              min={0.5}
              max={4}
              step={0.1}
              unit="mm"
              onChange={(value) => updateParameter('diameterMm', value)}
              help="Sets the droplet size and D₀ in the simplified d² relation."
            />
            <ParameterSlider
              label="Illustrative evaporation coefficient, K"
              value={parameters.evaporationK}
              min={0.02}
              max={0.5}
              step={0.01}
              unit="mm²/s"
              onChange={(value) => updateParameter('evaporationK', value)}
              help="User input only; not fitted to a FLEX/FLEX-2 experiment."
            />
            <ParameterSlider
              label="Ambient temperature input"
              value={parameters.ambientTemperatureK}
              min={250}
              max={900}
              step={10}
              unit="K"
              onChange={(value) => updateParameter('ambientTemperatureK', value)}
              help="Visual color cue only; temperature fields are not calculated."
            />
            <ParameterSlider
              label="Oxygen fraction input"
              value={parameters.oxygenPercent}
              min={12}
              max={24}
              step={0.1}
              unit="% vol"
              onChange={(value) => updateParameter('oxygenPercent', value)}
              help="Visual envelope emphasis only; no flammability threshold is inferred."
            />
            <ParameterSlider
              label="Imposed ventilation input"
              value={parameters.ventilationMs}
              min={0}
              max={0.5}
              step={0.01}
              unit="m/s"
              onChange={(value) => updateParameter('ventilationMs', value)}
              help="Changes the drawn airflow cue; it does not calculate a flow field."
            />
          </div>
          <div className="lab-playback-panel">
            <div className="lab-playback-status">
              <span className={playing ? 'lab-live-dot is-running' : 'lab-live-dot'} />
              {playing ? 'RUNNING' : 'PAUSED'} · t = {elapsedSeconds.toFixed(1)} s
            </div>
            <div className="lab-playback-actions">
              <button type="button" onClick={() => {
                if (!playing && elapsedSeconds >= duration) resetTime()
                setPlaying((current) => !current)
              }} aria-label={playing ? 'Pause comparison' : 'Start comparison'}>
                {playing ? <Pause size={14} /> : <Play size={14} />}{playing ? 'Pause both' : 'Start both'}
              </button>
              <button type="button" onClick={resetTime}><RotateCcw size={14} /> Restart</button>
            </div>
            <label className="lab-rate-control">
              <span>Playback rate</span>
              <select value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))}>
                <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option>
              </select>
            </label>
            <label className="gravity-timeline">
              <span>Model time <output>{elapsedSeconds.toFixed(1)} s</output></span>
              <input
                type="range"
                min={0}
                max={duration}
                step={Math.max(0.01, Math.min(1, duration / 100))}
                value={elapsedSeconds}
                onChange={(event) => updateTime(Number(event.target.value))}
                aria-label="Model time in seconds"
              />
            </label>
          </div>
          <div className="lab-simulation-tools gravity-tools">
            <button type="button" onClick={restoreDefaults}><RotateCcw size={14} /> Restore shared defaults</button>
            <button
              type="button"
              className={syncEnabled ? 'selected' : ''}
              aria-pressed={syncEnabled}
              onClick={() => setSyncEnabled((current) => !current)}
            >
              <Camera size={14} /> Camera sync: {syncEnabled ? 'on' : 'off'}
            </button>
          </div>
          <details className="lab-model-assumptions">
            <summary>Equation, initial conditions, and limitations</summary>
            <p><strong>Classification:</strong> simplified mathematical model (diameter only) plus conceptual transport visualization.</p>
            <p><strong>Equation:</strong> D²(t) = max(D₀² − Kt, 0), using D in mm, t in seconds, and a user-selected K in mm²/s.</p>
            <p><strong>Initial conditions:</strong> same D₀, K, ambient-temperature input, oxygen input, ventilation input, and t = 0 s for both scenes.</p>
            <p><strong>Limitations:</strong> no chemistry, gas or droplet temperature, species diffusion, convective transport, radiation, soot, extinction, chamber boundaries, or gravity-dependent burning-rate closure is solved. The visuals do not depict validated test results.</p>
          </details>
        </aside>

        <div className="gravity-content-panel">
          <div className="gravity-display-toolbar">
            <div className="gravity-view-toggle" role="group" aria-label="Choose scene view">
              {[
                ['split', 'Split view'],
                ['earth', 'Earth only'],
                ['microgravity', 'Microgravity only']
              ].map(([value, label]) => (
                <button type="button" key={value} className={sceneView === value ? 'selected' : ''} aria-pressed={sceneView === value} onClick={() => setSceneView(value)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="gravity-panel-toggle" role="tablist" aria-label="Comparison output view">
              {[
                ['scenes', '3D scenes'],
                ['graphs', 'Comparison graph'],
                ['data', 'Data view']
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
                    parameters={parameters}
                    elapsedSeconds={elapsedSeconds}
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
              <div className="gravity-camera-hint"><Camera size={13} /> Drag to orbit · scroll to zoom · right-drag to pan</div>
              <div className="gravity-selection-info" aria-live="polite">
                <Info size={15} /><span><strong>{detail.label}:</strong> {detail.detail ?? detail.text}</span>
              </div>
            </>
          )}

          {panelView === 'graphs' && (
            <ComparisonChart
              data={chartData}
              currentDiameter={currentDiameter}
              elapsedSeconds={elapsedSeconds}
              duration={duration}
            />
          )}

          {panelView === 'data' && <ComparisonDataTable parameters={parameters} elapsedSeconds={elapsedSeconds} />}

          <div className="gravity-variable-explorer">
            <div>
              <span className="panel-kicker">SELECT A VARIABLE · CONTEXTUAL EXPLANATION</span>
              <div className="gravity-variable-buttons">
                {Object.entries(variableDetails).map(([key, variable]) => (
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
            <p><strong>{variableDetails[selectedVariable].label}:</strong> {variableDetails[selectedVariable].detail}</p>
          </div>
        </div>
      </div>

      <div className="gravity-science-grid">
        <section className="experience-science-card">
          <span className="panel-kicker">WHY DOES GRAVITY MATTER?</span>
          <h3>Buoyancy, convection, diffusion</h3>
          <div className="gravity-physics-list">
            <article><span>01</span><div><strong>Buoyancy</strong><p>Density differences in a gravitational field can drive motion around a flame. The Earth plume arrow is a directional cue, not a velocity field.</p></div></article>
            <article><span>02</span><div><strong>Natural convection</strong><p>Buoyancy-driven transport changes shape and direction with gravity. In the idealized zero-g limit this mechanism vanishes, but other motion does not.</p></div></article>
            <article><span>03</span><div><strong>Diffusion & imposed flow</strong><p>Species still diffuse in microgravity, and fans, spacecraft ventilation, disturbances, or residual accelerations can move gas. None is solved in this model.</p></div></article>
          </div>
          <div className="gravity-warning"><Info size={15} /><p>“Microgravity” is represented as an idealized g = 0 limit for comparison, not as a claim that the ISS has no residual acceleration or gas motion.</p></div>
        </section>

        <details className="experience-science-card" open>
          <summary><span><Activity size={15} /> Model level, assumptions, and caveats</span><ArrowDown size={14} /></summary>
          <p><strong>Classification:</strong> simplified mathematical model for droplet diameter; conceptual flame and transport scenes. No experimental validation is claimed.</p>
          <p><strong>Equation:</strong> D²(t) = max(D₀² − Kt, 0). The display uses the same initial conditions and coefficient in both environments.</p>
          <p><strong>Crucial caveat:</strong> the d² law shown has no gravity term. Identical curves are a consequence of that simplification, not a comparative scientific finding about real Earth or microgravity combustion.</p>
          <p><strong>Outside scope:</strong> evaporation physics, heat/mass transfer coupling, combustion chemistry, buoyant or forced-flow solution, radiative loss, fuel-specific properties, chamber effects, and experimental uncertainty.</p>
        </details>
      </div>

      <section className="experience-science-card gravity-references">
        <div className="experience-panel-heading">
          <div><span className="panel-kicker">NASA PRIMARY SOURCES · NOT MODEL CALIBRATION DATA</span><h3>Research context</h3></div>
          <BookOpen size={17} />
        </div>
        <a href="https://ntrs.nasa.gov/citations/20150023456" target="_blank" rel="noreferrer">NASA · Detailed Results from the FLEX Experiment <ExternalLink size={13} /></a>
        <a href="https://ntrs.nasa.gov/citations/20210011385" target="_blank" rel="noreferrer">NASA · BASS-II Summary Report <ExternalLink size={13} /></a>
        <a href="#research"><BookOpen size={13} /> Search the IGNIS indexed library</a>
        <a href="#experiments-lab"><Flame size={13} /> Open the 3D combustion simulation lab</a>
        <a href="#assistant"><Activity size={13} /> Ask IGNIS AI about the source evidence</a>
      </section>
    </section>
  )
}

