import React from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Activity,
  ArrowRight,
  BookOpen,
  Camera,
  Info,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SlidersHorizontal
} from 'lucide-react'
import * as THREE from 'three'
import { OrbitControls as ThreeOrbitControls } from 'three/addons/controls/OrbitControls.js'

const ExperimentModelChart = React.lazy(() => import('./ExperimentModelChart'))

const simulationList = [
  {
    id: 'droplet',
    label: 'Droplet combustion',
    title: 'Droplet Combustion in Microgravity',
    classification: 'SIMPLIFIED MATHEMATICAL MODEL',
    description: 'A suspended liquid-fuel droplet inside independently selectable, animated schematic flame layers and vapor tracers.',
    model: 'The diameter curve uses the idealized d² relation: D²(t) = max(D₀² − Kt, 0). K is a user-selected illustrative coefficient, not fitted to FLEX data.',
    assumptions: 'Spherical droplet; constant user-specified K; no internal circulation, transient heating, soot radiation, convection, or finite chamber boundaries. Temperature and oxidizer inputs alter visual emphasis only.',
    records: ['flex', 'flex-2']
  },
  {
    id: 'solid',
    label: 'Solid-material spread',
    title: 'Flame Spread on Solid Materials',
    classification: 'SIMPLIFIED MATHEMATICAL MODEL',
    description: 'A material surface with a conceptual thermal front, displayed as a temperature-relative color field.',
    model: 'The displayed thermal penetration length is ℓ = min(L, 2√(αt)). The heat-map colors are normalized visualization values, not calculated material temperatures or flame-spread rates.',
    assumptions: 'One-dimensional diffusion-length scale; constant user-selected diffusivity; no chemistry, gas-phase coupling, radiative feedback, orientation, or material-specific ignition/spread model.',
    records: ['bass-ii', 'saffire-i']
  },
  {
    id: 'smoke',
    label: 'Smoke and products',
    title: 'Combustion Products and Smoke Dynamics',
    classification: 'SIMPLIFIED MATHEMATICAL MODEL',
    description: 'Animated tracer particles move through a conceptual chamber under an imposed ventilation vector.',
    model: 'The chart uses the ideal well-mixed purge relation C/C₀ = exp(−Ut/L). Particles are visual tracers; they are not computed smoke, soot, or toxic-gas trajectories.',
    assumptions: 'A single characteristic length, uniform mixing, constant ventilation, and a source switched off at t = 0. No chamber geometry, deposition, buoyancy, reaction, or species-specific transport is calculated.',
    records: ['bass-ii']
  },
  {
    id: 'extinction',
    label: 'Extinction context',
    title: 'Flame Extinction and Combustion Limits',
    classification: 'CONCEPTUAL VISUALIZATION',
    description: 'Adjust environmental inputs and inspect a qualitative transition in the displayed flame envelope.',
    model: 'The displayed visual-support index is an explicit graphic mapping of oxygen, heat-loss, and ventilation inputs. It is not a flammability model, extinction probability, or limiting oxygen concentration.',
    assumptions: 'No fuel-specific kinetics, heat-transfer balance, chamber geometry, pressure correction, or experimentally measured extinction boundary is represented.',
    records: ['bass-ii', 'flex']
  },
  {
    id: 'microgravity',
    label: 'Microgravity flame',
    title: 'Microgravity Flame Context',
    classification: 'CONCEPTUAL VISUALIZATION',
    description: 'Inspect a layered spherical flame concept alongside adjustable gravity and ventilation vectors.',
    model: 'Arrow lengths encode only the selected inputs. Flame geometry is deliberately fixed and is not a predicted flame shape.',
    assumptions: 'No buoyant-flow field, combustion chemistry, diffusion, or flame response is calculated.',
    records: ['flex', 'bass-ii', 'saffire-i']
  }
]

const defaultParameters = {
  droplet: {
    diameterMm: 2,
    evaporationK: 0.12,
    ambientTemperatureK: 450,
    oxygenPercent: 21
  },
  solid: {
    thicknessMm: 8,
    diffusivityMm2s: 1.2,
    surfaceTemperatureK: 700,
    ventilationMs: 0.1
  },
  smoke: {
    ventilationMs: 0.15,
    chamberLengthM: 2,
    orientation: 'axial'
  },
  extinction: {
    oxygenPercent: 21,
    heatLossIndex: 0.35,
    ventilationMs: 0.1
  },
  microgravity: {
    gravityMs2: 0.1,
    ventilationMs: 0.15
  }
}

const parameterDefinitions = {
  droplet: [
    { key: 'diameterMm', label: 'Initial droplet diameter', unit: 'mm', min: 0.5, max: 5, step: 0.1, help: 'Sets the droplet scale and D₀ in the displayed d² relation.' },
    { key: 'evaporationK', label: 'Illustrative evaporation coefficient, K', unit: 'mm²/s', min: 0.02, max: 0.5, step: 0.01, help: 'User-selected coefficient; not an experimental FLEX measurement.' },
    { key: 'ambientTemperatureK', label: 'Ambient gas temperature input', unit: 'K', min: 250, max: 900, step: 10, help: 'Displayed as a condition input; the model does not predict flame temperature.' },
    { key: 'oxygenPercent', label: 'Oxygen fraction input', unit: '% vol', min: 12, max: 24, step: 0.1, help: 'Changes visual envelope emphasis only; no flammability limit is calculated.' }
  ],
  solid: [
    { key: 'thicknessMm', label: 'Specimen thickness', unit: 'mm', min: 1, max: 20, step: 0.5, help: 'Sets the displayed slab thickness and caps the diffusion length.' },
    { key: 'diffusivityMm2s', label: 'Thermal diffusivity input, α', unit: 'mm²/s', min: 0.1, max: 5, step: 0.1, help: 'Illustrative constant for the displayed diffusion-length relation.' },
    { key: 'surfaceTemperatureK', label: 'Surface temperature input', unit: 'K', min: 300, max: 1200, step: 10, help: 'Controls heat-map color scaling only; no material temperature field is solved.' },
    { key: 'ventilationMs', label: 'Imposed ventilation speed', unit: 'm/s', min: 0, max: 0.5, step: 0.01, help: 'Scales the displayed airflow vector; no flow field is calculated.' }
  ],
  smoke: [
    { key: 'ventilationMs', label: 'Ventilation speed, U', unit: 'm/s', min: 0, max: 0.5, step: 0.01, help: 'Sets tracer drift and the idealized purge time constant.' },
    { key: 'chamberLengthM', label: 'Characteristic chamber length, L', unit: 'm', min: 0.5, max: 5, step: 0.1, help: 'Used only as the characteristic length in the well-mixed purge relation.' },
    { key: 'orientation', label: 'Ventilation orientation', min: 0, max: 1, step: 1, options: [['axial', 'Axial · horizontal'], ['transverse', 'Transverse · lateral']], help: 'Rotates the displayed ventilation vector and tracer drift.' }
  ],
  extinction: [
    { key: 'oxygenPercent', label: 'Oxygen fraction input', unit: '% vol', min: 12, max: 24, step: 0.1, help: 'Environmental context only; not a limiting oxygen concentration.' },
    { key: 'heatLossIndex', label: 'Illustrative heat-loss input', unit: '0–1 index', min: 0, max: 1, step: 0.01, help: 'Dimensionless visual control, not a measured heat-transfer coefficient.' },
    { key: 'ventilationMs', label: 'Ventilation speed input', unit: 'm/s', min: 0, max: 0.5, step: 0.01, help: 'Affects the graphic index only; no extinction threshold is inferred.' }
  ],
  microgravity: [
    { key: 'gravityMs2', label: 'Gravitational acceleration input', unit: 'm/s²', min: 0, max: 9.81, step: 0.1, help: 'Sets the displayed gravity-vector length from 0 to standard Earth gravity.' },
    { key: 'ventilationMs', label: 'Imposed ventilation speed', unit: 'm/s', min: 0, max: 0.5, step: 0.01, help: 'Sets the displayed ventilation-vector length.' }
  ]
}

const experimentLabels = {
  flex: 'FLEX',
  'flex-2': 'FLEX-2',
  'saffire-i': 'Saffire-I',
  'bass-ii': 'BASS-II'
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function getDuration(id, parameters) {
  if (id === 'droplet') {
    return Math.max(0.1, (parameters.diameterMm ** 2) / parameters.evaporationK)
  }
  if (id === 'smoke' && parameters.ventilationMs > 0) {
    return clamp((parameters.chamberLengthM / parameters.ventilationMs) * 3, 10, 300)
  }
  return id === 'smoke' ? 60 : id === 'solid' ? 60 : 30
}

function getVisualSupport(parameters) {
  const oxygenFactor = clamp((parameters.oxygenPercent - 12) / 12, 0, 1)
  const flowFactor = clamp(parameters.ventilationMs / 0.5, 0, 1)
  return clamp(
    0.2 + oxygenFactor * 0.8 - parameters.heatLossIndex * 0.55 - flowFactor * 0.25,
    0,
    1
  )
}

function getModelValue(id, parameters, timeSeconds) {
  if (id === 'droplet') {
    return Math.sqrt(Math.max(0, parameters.diameterMm ** 2 - parameters.evaporationK * timeSeconds))
  }
  if (id === 'solid') {
    return Math.min(parameters.thicknessMm, 2 * Math.sqrt(parameters.diffusivityMm2s * timeSeconds))
  }
  if (id === 'smoke') {
    return Math.exp((-parameters.ventilationMs * timeSeconds) / parameters.chamberLengthM)
  }
  if (id === 'extinction') return getVisualSupport(parameters)
  return clamp((parameters.gravityMs2 / 9.81 + parameters.ventilationMs / 0.5) / 2, 0, 1)
}

function getGraphLabel(id) {
  if (id === 'droplet') return { title: 'Idealized droplet diameter', unit: 'mm' }
  if (id === 'solid') return { title: 'Thermal penetration-length scale', unit: 'mm' }
  if (id === 'smoke') return { title: 'Normalized residual concentration, C/C₀', unit: 'dimensionless' }
  if (id === 'extinction') return { title: 'Visual-support index', unit: 'dimensionless' }
  return { title: 'Normalized input-context index', unit: 'dimensionless' }
}

function ParameterControl({ definition, value, onChange }) {
  if (definition.options) {
    return (
      <label className="lab-parameter">
        <span className="lab-parameter-heading">
          <span>{definition.label}</span>
        </span>
        <select
          value={value}
          onChange={(event) => onChange(definition.key, event.target.value)}
          aria-label={definition.label}
        >
          {definition.options.map(([optionValue, label]) => (
            <option value={optionValue} key={optionValue}>{label}</option>
          ))}
        </select>
        <small>{definition.help}</small>
      </label>
    )
  }

  const precision = definition.step < 0.1 ? 2 : definition.step < 1 ? 1 : 0
  return (
    <label className="lab-parameter">
      <span className="lab-parameter-heading">
        <span>{definition.label}</span>
        <output>{Number(value).toFixed(precision)} {definition.unit}</output>
      </span>
      <input
        type="range"
        min={definition.min}
        max={definition.max}
        step={definition.step}
        value={value}
        onChange={(event) => onChange(definition.key, Number(event.target.value))}
        aria-label={`${definition.label} (${definition.unit})`}
      />
      <small>{definition.help}</small>
    </label>
  )
}

function Stage({ children }) {
  const sceneRig = React.useRef(null)
  const combustionLight = React.useRef(null)

  useFrame((state, delta) => {
    if (sceneRig.current) {
      const targetX = -state.pointer.y * 0.045
      const targetY = state.pointer.x * 0.075
      sceneRig.current.rotation.x = THREE.MathUtils.damp(sceneRig.current.rotation.x, targetX, 3.5, delta)
      sceneRig.current.rotation.y = THREE.MathUtils.damp(sceneRig.current.rotation.y, targetY, 3.5, delta)
    }

    if (combustionLight.current) {
      combustionLight.current.intensity = 12 + Math.sin(state.clock.elapsedTime * 2.4) * 1.4
    }
  })

  return (
    <>
      <color attach="background" args={['#091321']} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 3]} intensity={1.8} color="#ffe4c2" />
      <pointLight ref={combustionLight} position={[-2, 1, -2]} intensity={12} distance={8} color="#ff793f" />
      <gridHelper args={[5, 20, '#234456', '#172b3e']} position={[0, -1.2, 0]} />
      <group ref={sceneRig}>{children}</group>
    </>
  )
}

function createFlamePlumeGeometry() {
  const radialSegments = 48
  const heightSegments = 42
  const positions = new Float32Array((radialSegments + 1) * (heightSegments + 1) * 3)
  const uvs = new Float32Array((radialSegments + 1) * (heightSegments + 1) * 2)
  const indices = []

  for (let row = 0; row <= heightSegments; row += 1) {
    const height = row / heightSegments
    const taper = Math.pow(1 - height, 0.82) * (0.42 + 0.58 * Math.sin(Math.PI * height))

    for (let column = 0; column <= radialSegments; column += 1) {
      const angle = (column / radialSegments) * Math.PI * 2
      const scallop = 1
        + 0.11 * Math.sin(angle * 3 + height * 7)
        + 0.05 * Math.sin(angle * 5 - height * 11)
      const offset = (row * (radialSegments + 1) + column) * 3
      positions[offset] = Math.cos(angle) * taper * scallop
      positions[offset + 1] = height - 0.5
      positions[offset + 2] = Math.sin(angle) * taper * scallop

      const uvOffset = (row * (radialSegments + 1) + column) * 2
      uvs[uvOffset] = column / radialSegments
      uvs[uvOffset + 1] = height
    }
  }

  for (let row = 0; row < heightSegments; row += 1) {
    for (let column = 0; column < radialSegments; column += 1) {
      const a = row * (radialSegments + 1) + column
      const b = a + radialSegments + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

const flameVertexShader = `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  varying vec3 vFlamePosition;
  varying vec3 vFlameNormal;
  varying vec3 vFlameViewPosition;

  void main() {
    float angle = atan(position.z, position.x);
    float wave = sin(angle * 3.0 + position.y * uFrequency + uTime * 2.15) * 0.035
      + sin(angle * 5.0 - position.y * 6.2 - uTime * 1.65) * 0.018;
    vec3 displaced = position + normal * wave * uAmplitude;
    vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
    vFlamePosition = displaced;
    vFlameNormal = normalize(normalMatrix * normal);
    vFlameViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`

const flameFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uPhase;
  uniform float uShape;
  uniform float uRimIntensity;
  uniform vec3 uCoreColor;
  uniform vec3 uEdgeColor;
  varying vec3 vFlamePosition;
  varying vec3 vFlameNormal;
  varying vec3 vFlameViewPosition;

  void main() {
    float height = mix(
      vFlamePosition.y * 0.5 + 0.5,
      vFlamePosition.y + 0.5,
      uShape
    );
    height = clamp(height, 0.0, 1.0);
    float angle = atan(vFlamePosition.z, vFlamePosition.x);
    float filament = 0.5 + 0.5 * sin(angle * 4.0 + height * 13.0 - uTime * 2.8 + uPhase);
    float reactionBand = smoothstep(0.05, 0.86, height);
    vec3 color = mix(uCoreColor, uEdgeColor, clamp(reactionBand * 0.78 + filament * 0.22, 0.0, 1.0));

    vec3 normal = normalize(vFlameNormal);
    vec3 viewDirection = normalize(vFlameViewPosition);
    float light = 0.52 + 0.48 * max(dot(normal, normalize(vec3(-0.4, 0.75, 0.55))), 0.0);
    float rim = pow(1.0 - abs(dot(normal, viewDirection)), 2.0);
    float alpha = uOpacity * (0.72 + 0.28 * filament) + rim * uRimIntensity;
    alpha *= mix(1.0, smoothstep(0.0, 0.18, height) * (1.0 - smoothstep(0.88, 1.0, height)), uShape);

    if (alpha < 0.015) discard;
    gl_FragColor = vec4(color * (light + rim * 0.28), clamp(alpha, 0.0, 0.62));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

function FlameSurface({
  shape = 'sphere',
  scale,
  position,
  coreColor,
  edgeColor,
  opacity,
  amplitude = 1,
  phase = 0,
  onSelect,
  renderOrder = 1
}) {
  const geometry = React.useMemo(
    () => shape === 'plume'
      ? createFlamePlumeGeometry()
      : new THREE.SphereGeometry(1, 48, 36),
    [shape]
  )
  const uniforms = React.useMemo(() => ({
    uTime: { value: 0 },
    uAmplitude: { value: amplitude },
    uFrequency: { value: 7 },
    uOpacity: { value: opacity },
    uPhase: { value: phase },
    uShape: { value: shape === 'plume' ? 1 : 0 },
    uRimIntensity: { value: opacity * 0.48 },
    uCoreColor: { value: new THREE.Color(coreColor) },
    uEdgeColor: { value: new THREE.Color(edgeColor) }
  }), [amplitude, coreColor, edgeColor, opacity, phase, shape])
  const materialRef = React.useRef(null)

  useFrame((state) => {
    const uniforms = materialRef.current?.uniforms
    if (uniforms) uniforms.uTime.value = state.clock.elapsedTime
  })

  React.useEffect(() => () => {
    geometry.dispose()
  }, [geometry])

  return (
    <mesh
      position={position}
      scale={scale}
      renderOrder={renderOrder}
      onClick={onSelect ? (event) => {
        event.stopPropagation()
        onSelect()
      } : undefined}
    >
      <primitive object={geometry} attach="geometry" dispose={null} />
      <shaderMaterial
        ref={materialRef}
        attach="material"
        uniforms={uniforms}
        vertexShader={flameVertexShader}
        fragmentShader={flameFragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
        toneMapped
      />
    </mesh>
  )
}

const dropletFlameLayers = [
  {
    id: 'diffusion',
    label: 'Outer diffusion region',
    shortLabel: 'Diffusion region',
    scale: 1.5,
    coreColor: '#24596a',
    edgeColor: '#67dcea',
    opacity: 0.11,
    amplitude: 0.65,
    phase: 0.2,
    description: 'Outer shell is a schematic diffusion region; no species concentration or flame radius is calculated.'
  },
  {
    id: 'reaction',
    label: 'Reaction envelope',
    shortLabel: 'Reaction envelope',
    scale: 1.18,
    coreColor: '#f05b2c',
    edgeColor: '#ffd17c',
    opacity: 0.28,
    amplitude: 1,
    phase: 1.1,
    description: 'Bright layer marks an illustrative reaction-zone envelope, not a computed reaction rate or measured flame front.'
  },
  {
    id: 'fuel-vapor',
    label: 'Fuel-vapor region',
    shortLabel: 'Fuel vapor',
    scale: 0.79,
    coreColor: '#174d5f',
    edgeColor: '#63dce5',
    opacity: 0.15,
    amplitude: 0.7,
    phase: 2.2,
    description: 'Inner region represents fuel vapor schematically; its boundary and composition are not solved.'
  }
]

const microgravityFlameLayers = [
  {
    ...dropletFlameLayers[0],
    label: 'Outer diffusion region',
    shortLabel: 'Diffusion region',
    description: 'Outer boundary is a schematic diffusion region and does not represent a calculated transport field.'
  },
  {
    ...dropletFlameLayers[1],
    label: 'Luminous reaction envelope',
    shortLabel: 'Reaction envelope',
    description: 'This animated envelope is conceptual; it is not a predicted microgravity flame geometry.'
  },
  {
    ...dropletFlameLayers[2],
    label: 'Inner flame region',
    shortLabel: 'Inner region',
    description: 'The center is an illustrative inner region; no fuel concentration or local temperature is calculated.'
  }
]

function LayeredFlameEnvelope({ radius, layers, onSelect, intensity = 1 }) {
  return (
    <>
      {layers.map((layer, index) => (
        <FlameSurface
          key={layer.id}
          scale={[radius * layer.scale, radius * layer.scale * 1.08, radius * layer.scale]}
          coreColor={layer.coreColor}
          edgeColor={layer.edgeColor}
          opacity={layer.opacity * intensity}
          amplitude={layer.amplitude}
          phase={layer.phase}
          renderOrder={index + 1}
          onSelect={() => onSelect(layer.label, layer.description)}
        />
      ))}
    </>
  )
}

function LayeredFlamePlume({ position, scale, intensity = 1, onSelect }) {
  const layers = [
    { label: 'Outer flame envelope', scale: [1.32, 1.1, 1.32], core: '#ab4928', edge: '#ff9a51', opacity: 0.17, phase: 0.5 },
    { label: 'Luminous reaction zone', scale: [0.98, 0.92, 0.98], core: '#f36531', edge: '#ffd071', opacity: 0.31, phase: 1.6 },
    { label: 'Inner flame structure', scale: [0.57, 0.73, 0.57], core: '#e85532', edge: '#ffbc68', opacity: 0.26, phase: 2.8 }
  ]

  return (
    <group position={position} scale={scale}>
      {layers.map((layer, index) => (
        <FlameSurface
          key={layer.label}
          shape="plume"
          scale={layer.scale}
          coreColor={layer.core}
          edgeColor={layer.edge}
          opacity={layer.opacity * intensity}
          amplitude={0.85 + index * 0.1}
          phase={layer.phase}
          renderOrder={index + 1}
          onSelect={() => onSelect(layer.label, 'This animated surface is a conceptual flame layer; no validated flow, temperature field, or reaction rate is calculated.')}
        />
      ))}
    </group>
  )
}

function CameraControls({ controlsRef }) {
  const { camera, gl } = useThree()
  const instance = React.useRef(null)

  React.useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.075
    controls.enableRotate = true
    controls.enableZoom = true
    controls.enablePan = true
    controls.minDistance = 2.5
    controls.maxDistance = 10
    controls.maxPolarAngle = Math.PI * 0.88
    controls.target.set(0, 0, 0)
    controls.update()
    instance.current = controls
    controlsRef.current = controls

    return () => {
      controls.dispose()
      instance.current = null
      if (controlsRef.current === controls) controlsRef.current = null
    }
  }, [camera, controlsRef, gl.domElement])

  useFrame(() => instance.current?.update())
  return null
}

function VaporParticles({ radius, elapsedSeconds, playing }) {
  const count = 54
  const geometryRef = React.useRef(null)
  const phase = React.useRef(0)
  const positions = React.useMemo(() => new Float32Array(count * 3), [])
  const colors = React.useMemo(() => new Float32Array(count * 3), [])

  React.useEffect(() => {
    phase.current = elapsedSeconds
  }, [elapsedSeconds])

  useFrame((_, delta) => {
    if (playing) phase.current += delta
    const positionAttribute = geometryRef.current?.attributes.position
    const colorAttribute = geometryRef.current?.attributes.color
    if (!positionAttribute || !colorAttribute) return

    for (let index = 0; index < count; index += 1) {
      const angle = index * 2.399 + phase.current * 0.38
      const progress = (index / count + phase.current * 0.14) % 1
      const distance = radius * 1.12 + progress * 0.7
      positionAttribute.setXYZ(
        index,
        Math.cos(angle) * distance,
        Math.sin(angle * 1.7) * distance * 0.72,
        Math.sin(angle) * distance
      )
      const alpha = 1 - progress * 0.55
      colorAttribute.setXYZ(index, 1, 0.42 + alpha * 0.24, 0.22)
    }
    positionAttribute.needsUpdate = true
    colorAttribute.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={0.055} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  )
}

function DropletScene({ parameters, elapsedSeconds, playing, onSelect }) {
  const flameOpacity = 0.17
    + clamp((parameters.ambientTemperatureK - 250) / 650, 0, 1) * 0.12
    + clamp((parameters.oxygenPercent - 12) / 12, 0, 1) * 0.1
  const diameter = getModelValue('droplet', parameters, elapsedSeconds)
  const dropletRadius = Math.max(0.006, diameter * 0.11)
  const shellRadius = parameters.diameterMm * 0.34 + 0.22

  return (
    <Stage>
      <group position={[0, 0, 0]}>
        <LayeredFlameEnvelope
          radius={shellRadius * 0.94}
          layers={dropletFlameLayers}
          intensity={clamp(flameOpacity / 0.39, 0.55, 1)}
          onSelect={onSelect}
        />
        <mesh
          scale={dropletRadius}
          onClick={(event) => {
            event.stopPropagation()
            onSelect('Liquid-fuel droplet', `Current idealized diameter: ${diameter.toFixed(2)} mm. The d² curve uses the selected K input; it is not fitted to a NASA experiment.`)
          }}
        >
          <sphereGeometry args={[1, 40, 28]} />
          <meshPhysicalMaterial color="#48d6df" roughness={0.22} metalness={0.1} clearcoat={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={shellRadius * 1.55} position={[0, -0.78, 0]}>
          <torusGeometry args={[1, 0.008, 8, 80]} />
          <meshBasicMaterial color="#ffb16d" transparent opacity={0.65} />
        </mesh>
        <VaporParticles radius={dropletRadius} elapsedSeconds={elapsedSeconds} playing={playing} />
      </group>
    </Stage>
  )
}

function HeatSurface({ parameters, elapsedSeconds }) {
  const geometryRef = React.useRef(null)
  const colorArray = React.useMemo(() => new Float32Array(43 * 23 * 3), [])
  React.useEffect(() => {
    const geometry = geometryRef.current
    if (!geometry) return
    const positions = geometry.attributes.position
    const colors = geometry.attributes.color
    const alpha = parameters.diffusivityMm2s
    const penetrationMm = Math.min(
      parameters.thicknessMm,
      2 * Math.sqrt(alpha * Math.max(elapsedSeconds, 0.05))
    )
    const frontX = -2.15 + Math.min(4.3, (penetrationMm / parameters.thicknessMm) * 2.6)
    const temperatureScale = clamp((parameters.surfaceTemperatureK - 300) / 900, 0.08, 1)
    const cold = new THREE.Color('#164b65')
    const hot = new THREE.Color('#ff853e')
    const mixed = new THREE.Color()

    for (let index = 0; index < positions.count; index += 1) {
      const distance = Math.max(0, frontX - positions.getX(index))
      const intensity = clamp(Math.exp(-distance * 1.65) * temperatureScale, 0, 1)
      mixed.lerpColors(cold, hot, intensity)
      colors.setXYZ(index, mixed.r, mixed.g, mixed.b)
    }
    colors.needsUpdate = true
  }, [elapsedSeconds, parameters.diffusivityMm2s, parameters.surfaceTemperatureK, parameters.thicknessMm])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.69, 0]}>
      <planeGeometry ref={geometryRef} args={[4.4, 2.3, 42, 22]}>
        <bufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </planeGeometry>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.9} />
    </mesh>
  )
}

function SolidScene({ parameters, elapsedSeconds, onSelect }) {
  const penetrationMm = Math.min(
    parameters.thicknessMm,
    2 * Math.sqrt(parameters.diffusivityMm2s * Math.max(elapsedSeconds, 0))
  )
  const frontX = -2.15 + Math.min(4.3, (penetrationMm / parameters.thicknessMm) * 2.6)
  const slabDepth = 0.1 + Math.log1p(parameters.thicknessMm) * 0.025

  return (
    <Stage>
      <mesh position={[0, -0.75 - slabDepth / 2, 0]} onClick={(event) => {
        event.stopPropagation()
        onSelect('Solid specimen', `Displayed thickness: ${parameters.thicknessMm.toFixed(1)} mm. The color field is a normalized visualization, not measured temperature.`)
      }}>
        <boxGeometry args={[4.4, slabDepth, 2.3]} />
        <meshStandardMaterial color="#1c3246" metalness={0.18} roughness={0.75} />
      </mesh>
      <HeatSurface parameters={parameters} elapsedSeconds={elapsedSeconds} />
      <LayeredFlamePlume
        position={[frontX, -0.1, 0]}
        scale={[0.5, 0.52, 0.5]}
        intensity={0.9}
        onSelect={(label, description) => onSelect(
          label,
          `${description} Thermal penetration-length scale: ${penetrationMm.toFixed(2)} mm from 2√(αt), capped by the displayed specimen thickness.`
        )}
      />
      <mesh position={[-1.85, 0.48, 0]}>
        <boxGeometry args={[0.72 + parameters.ventilationMs * 2, 0.018, 0.018]} />
        <meshBasicMaterial color="#35cddd" />
      </mesh>
      <mesh position={[-1.45 + parameters.ventilationMs, 0.48, 0]}>
        <coneGeometry args={[0.08, 0.18, 12]} />
        <meshBasicMaterial color="#35cddd" />
      </mesh>
    </Stage>
  )
}

function SmokeParticleField({ parameters, elapsedSeconds, playing, onSelect }) {
  const count = 220
  const geometryRef = React.useRef(null)
  const phase = React.useRef(0)
  const positions = React.useMemo(() => new Float32Array(count * 3), [])

  React.useEffect(() => {
    phase.current = elapsedSeconds
  }, [elapsedSeconds])

  useFrame((_, delta) => {
    if (playing) phase.current += delta
    const attribute = geometryRef.current?.attributes.position
    if (!attribute) return
    const velocity = parameters.ventilationMs
    const transverse = parameters.orientation === 'transverse'
    const chamberScale = parameters.chamberLengthM / 2
    const drift = phase.current * velocity * 0.7

    for (let index = 0; index < count; index += 1) {
      const seedA = ((index * 37) % count) / count
      const seedB = ((index * 71) % count) / count
      const seedC = ((index * 113) % count) / count
      const travel = (drift * (0.4 + seedC) + seedA * 3.8) % 3.8
      const along = travel - 1.9
      const crossA = (seedB - 0.5) * 2.2
      const crossB = (seedC - 0.5) * 1.6
      attribute.setXYZ(
        index,
        transverse ? crossA : along * chamberScale,
        crossB + Math.sin(phase.current + index) * 0.035,
        transverse ? along * chamberScale : crossA
      )
    }
    attribute.needsUpdate = true
  })

  return (
    <points onClick={(event) => {
      event.stopPropagation()
      onSelect('Combustion-product tracers', 'Particles are illustrative tracers. They do not encode measured smoke concentration, soot size, or toxic-gas transport.')
    }}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#9ab5c2" size={0.045} sizeAttenuation transparent opacity={0.82} depthWrite={false} />
    </points>
  )
}

function SmokeScene({ parameters, elapsedSeconds, playing, onSelect }) {
  const chamberScale = parameters.chamberLengthM / 2
  const chamberWidth = 2.2
  const chamberDepth = parameters.orientation === 'transverse' ? 3.8 * chamberScale : 2.2
  const chamberLength = parameters.orientation === 'transverse' ? 2.2 : 3.8 * chamberScale

  return (
    <Stage>
      <mesh onClick={(event) => {
        event.stopPropagation()
        onSelect('Ventilated chamber', `Idealized characteristic length: ${parameters.chamberLengthM.toFixed(1)} m. The purge curve assumes uniform mixing.`)
      }}>
        <boxGeometry args={[chamberLength, chamberWidth, chamberDepth]} />
        <meshBasicMaterial color="#31536a" wireframe transparent opacity={0.18} />
      </mesh>
      <mesh position={[0, -0.48, 0]}>
        <sphereGeometry args={[0.18, 18, 12]} />
        <meshBasicMaterial color="#ff864b" />
      </mesh>
      <SmokeParticleField
        parameters={parameters}
        elapsedSeconds={elapsedSeconds}
        playing={playing}
        onSelect={onSelect}
      />
      <mesh position={parameters.orientation === 'axial' ? [-1.25, 0.55, 0] : [0, 0.55, -1.25]}>
        <boxGeometry args={parameters.orientation === 'axial'
          ? [0.48 + parameters.ventilationMs * 2.4, 0.018, 0.018]
          : [0.018, 0.018, 0.48 + parameters.ventilationMs * 2.4]}
        />
        <meshBasicMaterial color="#35cddd" />
      </mesh>
    </Stage>
  )
}

function ExtinctionScene({ parameters, onSelect }) {
  const support = getVisualSupport(parameters)

  return (
    <Stage>
      <LayeredFlamePlume
        position={[0, -0.1, 0]}
        scale={[0.18 + support * 0.5, 0.24 + support * 0.72, 0.18 + support * 0.5]}
        intensity={support}
        onSelect={(label, description) => onSelect(
          label,
          `${description} Graphic support index: ${support.toFixed(2)}; it is not an extinction threshold or probability.`
        )}
      />
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.23, 0.3, 0.12, 32]} />
        <meshStandardMaterial color="#30475b" metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.96, 0.012, 8, 72]} />
        <meshBasicMaterial color="#35cddd" transparent opacity={0.45} />
      </mesh>
    </Stage>
  )
}

function MicrogravityScene({ parameters, onSelect }) {
  const gravityLength = 0.15 + parameters.gravityMs2 / 9.81 * 1.1
  const ventilationLength = 0.25 + parameters.ventilationMs / 0.5 * 1.05

  return (
    <Stage>
      <LayeredFlameEnvelope
        radius={0.52}
        layers={microgravityFlameLayers}
        onSelect={onSelect}
      />
      <mesh>
        <sphereGeometry args={[0.11, 24, 18]} />
        <meshPhysicalMaterial color="#ffe09a" emissive="#ffb05d" emissiveIntensity={1.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.72 + gravityLength / 2, 0.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, gravityLength, 8]} />
        <meshBasicMaterial color="#35cddd" />
      </mesh>
      <mesh position={[0.72 + gravityLength, 0.2 - gravityLength / 2, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.065, 0.16, 10]} />
        <meshBasicMaterial color="#35cddd" />
      </mesh>
      <mesh position={[-0.8 - ventilationLength / 2, 0.25, 0]}>
        <cylinderGeometry args={[0.012, 0.012, ventilationLength, 8]} />
        <meshBasicMaterial color="#ffb36b" />
      </mesh>
      <mesh position={[-0.8 - ventilationLength, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.065, 0.16, 10]} />
        <meshBasicMaterial color="#ffb36b" />
      </mesh>
      <mesh onClick={(event) => {
        event.stopPropagation()
        onSelect('Gravity and ventilation inputs', `Selected g = ${parameters.gravityMs2.toFixed(1)} m/s²; imposed ventilation = ${parameters.ventilationMs.toFixed(2)} m/s.`)
      }}>
        <boxGeometry args={[3, 0.02, 0.02]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </Stage>
  )
}

function SceneTransition({ sceneId, children }) {
  const group = React.useRef(null)
  const progress = React.useRef(1)

  React.useEffect(() => {
    progress.current = 0
  }, [sceneId])

  useFrame((_, delta) => {
    progress.current = Math.min(1, progress.current + delta * 2.8)
    const eased = 1 - (1 - progress.current) ** 3
    if (!group.current) return
    group.current.scale.setScalar(0.94 + eased * 0.06)
    group.current.rotation.y = Math.sin((1 - eased) * Math.PI) * 0.035
  })

  return <group ref={group}>{children}</group>
}

function SceneForSimulation(props) {
  let scene
  if (props.id === 'droplet') scene = <DropletScene {...props} />
  else if (props.id === 'solid') scene = <SolidScene {...props} />
  else if (props.id === 'smoke') scene = <SmokeScene {...props} />
  else if (props.id === 'extinction') scene = <ExtinctionScene {...props} />
  else scene = <MicrogravityScene {...props} />

  return <SceneTransition sceneId={props.id}>{scene}</SceneTransition>
}

function SceneFallback({ message }) {
  return <div className="lab-webgl-fallback" role="status">{message}</div>
}

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return <SceneFallback message="3D rendering is unavailable. The model explanation and controls remain accessible." />
    }
    return this.props.children
  }
}

export default function ExperimentSimulator3D({ onOpenExperiment }) {
  const [activeId, setActiveId] = React.useState('droplet')
  const [parameters, setParameters] = React.useState(defaultParameters)
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const [playbackRate, setPlaybackRate] = React.useState(1)
  const [compareDefault, setCompareDefault] = React.useState(false)
  const [selectedPart, setSelectedPart] = React.useState(null)
  const controlsRef = React.useRef(null)
  const elapsedRef = React.useRef(0)
  const simulation = simulationList.find((item) => item.id === activeId) ?? simulationList[0]
  const activeParameters = parameters[activeId]
  const duration = getDuration(activeId, activeParameters)
  const baseline = defaultParameters[activeId]
  const graph = getGraphLabel(activeId)
  const selectableFlameLayers = activeId === 'droplet'
    ? dropletFlameLayers
    : activeId === 'microgravity'
      ? microgravityFlameLayers
      : []
  const chartData = React.useMemo(() => {
    return Array.from({ length: 41 }, (_, index) => {
      const time = (duration * index) / 40
      const point = {
        time,
        current: getModelValue(activeId, activeParameters, time)
      }
      if (compareDefault) {
        point.reference = getModelValue(activeId, baseline, time)
      }
      return point
    })
  }, [activeId, activeParameters, baseline, compareDefault, duration])
  const currentModelValue = getModelValue(activeId, activeParameters, elapsedSeconds)

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

  function setParameter(key, value) {
    setParameters((current) => ({
      ...current,
      [activeId]: { ...current[activeId], [key]: value }
    }))
  }

  function resetClock() {
    setPlaying(false)
    elapsedRef.current = 0
    setElapsedSeconds(0)
  }

  function changeSimulation(id) {
    setPlaying(false)
    elapsedRef.current = 0
    setElapsedSeconds(0)
    setSelectedPart(null)
    controlsRef.current?.reset()
    setActiveId(id)
  }

  function restoreParameters() {
    setParameters((current) => ({ ...current, [activeId]: { ...defaultParameters[activeId] } }))
    resetClock()
  }

  const chartDuration = Math.max(duration, 1)

  return (
    <section className="lab-simulations" aria-labelledby="lab-simulations-heading">
      <div className="lab-section-heading">
        <div>
          <span className="panel-kicker">INTERACTIVE 3D LABORATORY</span>
          <h3 id="lab-simulations-heading">Explore the model, not an invented result</h3>
        </div>
        <span className="lab-status-badge"><Activity size={13} /> {simulation.classification}</span>
      </div>
      <p className="lab-section-intro">
        Manipulate each scene with the mouse or touch: drag to rotate, scroll to zoom, and right-drag to pan.
        Pointing across the view adds a subtle perspective response. Flame layers are schematic, not validated physical simulations or experimental results, and remain separate from the simplified model outputs.
      </p>

      <div className="lab-simulation-tabs" role="tablist" aria-label="3D combustion visualizations">
        {simulationList.map((item, index) => (
          <button
            type="button"
            role="tab"
            key={item.id}
            id={`lab-tab-${item.id}`}
            aria-selected={activeId === item.id}
            aria-controls={`lab-panel-${item.id}`}
            className={activeId === item.id ? 'selected' : ''}
            onClick={() => changeSimulation(item.id)}
          >
            <span className="lab-tab-index">{String(index + 1).padStart(2, '0')}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div
        className="lab-simulation-panel lab-3d-panel"
        id={`lab-panel-${simulation.id}`}
        role="tabpanel"
        aria-labelledby={`lab-tab-${simulation.id}`}
      >
        <div className="lab-3d-view-column">
          <div className="lab-3d-scene-frame">
            <div className="lab-3d-scene-label">
              <span className="lab-live-dot" />
              {simulation.title}
              <span>CONCEPT / MODEL</span>
            </div>
            <SceneErrorBoundary>
              <Canvas
                camera={{ position: [4.1, 2.9, 5], fov: 40 }}
                dpr={[1, 1.4]}
                gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
                fallback={<SceneFallback message="WebGL is unavailable in this browser." />}
                onPointerMissed={() => setSelectedPart(null)}
              >
                <React.Suspense fallback={(
                  <mesh>
                    <sphereGeometry args={[0.25, 12, 8]} />
                    <meshBasicMaterial color="#35cddd" wireframe />
                  </mesh>
                )}>
                  <SceneForSimulation
                    id={simulation.id}
                    parameters={activeParameters}
                    elapsedSeconds={elapsedSeconds}
                    playing={playing}
                    onSelect={(label, description) => setSelectedPart({ label, description })}
                  />
                </React.Suspense>
                <CameraControls controlsRef={controlsRef} />
              </Canvas>
            </SceneErrorBoundary>
            <div className="lab-camera-hint"><Camera size={12} /> Drag · zoom · pan</div>
            <button type="button" className="lab-camera-reset" onClick={() => controlsRef.current?.reset()}>
              <RotateCw size={13} /> Reset view
            </button>
            <div className="lab-scene-legend">
              <span><i className="legend-amber" /> Animated conceptual flame / thermal field</span>
              <span><i className="legend-cyan" /> User-selected input</span>
            </div>
          </div>
          {selectableFlameLayers.length > 0 && (
            <div className="lab-flame-layer-controls" role="group" aria-label="Inspect conceptual flame layers">
              <span>SELECT A FLAME LAYER</span>
              <div>
                {selectableFlameLayers.map((layer) => (
                  <button
                    type="button"
                    key={layer.id}
                    className={`lab-flame-layer-button lab-flame-layer-${layer.id}${selectedPart?.label === layer.label ? ' selected' : ''}`}
                    aria-pressed={selectedPart?.label === layer.label}
                    onClick={() => setSelectedPart({ label: layer.label, description: layer.description })}
                  >
                    <i aria-hidden="true" />
                    {layer.shortLabel}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="lab-scene-selection" role="status" aria-live="polite">
            <Info size={14} />
            {selectedPart
              ? <span><strong>{selectedPart.label}:</strong> {selectedPart.description}</span>
              : <span>Select a model element in the 3D view for contextual information.</span>}
          </div>
          <React.Suspense fallback={<div className="lab-chart-loading" role="status">Loading model chart...</div>}>
            <ExperimentModelChart
              id={simulation.id}
              data={chartData}
              graph={graph}
              currentValue={currentModelValue}
              elapsedSeconds={elapsedSeconds}
              duration={chartDuration}
              compareDefault={compareDefault}
            />
          </React.Suspense>
        </div>

        <aside className="lab-3d-controls" aria-label={`${simulation.title} controls`}>
          <div className="lab-3d-controls-heading">
            <div>
              <span className="lab-simulation-number">
                {String(simulationList.findIndex((item) => item.id === activeId) + 1).padStart(2, '0')} / 05 · MODEL VIEW
              </span>
              <h4>{simulation.title}</h4>
            </div>
            <SlidersHorizontal size={17} />
          </div>
          <p className="lab-simulation-copy-text">{simulation.description}</p>
          <div className="lab-parameter-list">
            {parameterDefinitions[activeId].map((definition) => (
              <ParameterControl
                key={definition.key}
                definition={definition}
                value={activeParameters[definition.key]}
                onChange={setParameter}
              />
            ))}
          </div>

          <div className="lab-playback-panel">
            <div className="lab-playback-status">
              <span className={playing ? 'lab-live-dot is-running' : 'lab-live-dot'} />
              {playing ? 'RUNNING' : 'PAUSED'} · t = {elapsedSeconds.toFixed(1)} s
            </div>
            <div className="lab-playback-actions">
              <button type="button" onClick={() => setPlaying((current) => !current)} aria-label={playing ? 'Pause model' : 'Start model'}>
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? 'Pause' : 'Start'}
              </button>
              <button type="button" onClick={resetClock} aria-label="Reset model time">
                <RotateCcw size={14} /> Restart
              </button>
            </div>
            <label className="lab-rate-control">
              <span>Playback rate</span>
              <select value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))} aria-label="Playback rate">
                <option value={0.5}>0.5×</option>
                <option value={1}>1×</option>
                <option value={2}>2×</option>
              </select>
            </label>
          </div>

          <div className="lab-simulation-tools">
            <button
              type="button"
              className={compareDefault ? 'selected' : ''}
              aria-pressed={compareDefault}
              onClick={() => setCompareDefault((current) => !current)}
            >
              <Activity size={14} />
              {compareDefault ? 'Hide default comparison' : 'Compare with defaults'}
            </button>
            <button type="button" onClick={restoreParameters}>
              <RotateCcw size={14} /> Restore parameter defaults
            </button>
          </div>

          <details className="lab-model-assumptions">
            <summary>Model equation, initial conditions, and limitations</summary>
            <p>{simulation.model}</p>
            <p><strong>Initial conditions:</strong> t = 0 s; parameter values shown above. Time resets when a model is changed.</p>
            <p><strong>Assumptions and limitations:</strong> {simulation.assumptions}</p>
          </details>

          <div className="lab-related-evidence">
            <span className="panel-kicker">RELATED PRIMARY RECORDS</span>
            <div className="lab-evidence-buttons">
              {simulation.records.map((id) => (
                <button type="button" key={id} onClick={() => onOpenExperiment(id)}>
                  {experimentLabels[id]} <ArrowRight size={12} />
                </button>
              ))}
            </div>
            <div className="lab-evidence-links">
              <a href="#research"><BookOpen size={13} /> Research Intelligence</a>
              <a href="#combustion"><Activity size={13} /> Combustion Explorer</a>
              <a href="#assistant"><Info size={13} /> Ask IGNIS AI</a>
            </div>
          </div>
        </aside>
      </div>
      <p className="lab-chart-caveat">
        All curves are computed from the displayed simplified relations or explicit visualization mappings. No curve represents an experimental measurement or NASA-validated prediction.
      </p>
    </section>
  )
}
