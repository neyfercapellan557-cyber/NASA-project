import React from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

const visualParts = [
  {
    id: 'droplet',
    label: 'Gota de combustible',
    description: 'Marcador central de una gota en una visualización conceptual de combustión en microgravedad.'
  },
  {
    id: 'reaction',
    label: 'Envolvente de reacción',
    description: 'Envolvente luminosa esquemática; no se calcula la velocidad de reacción ni el radio de la llama.'
  },
  {
    id: 'diffusion',
    label: 'Región de difusión',
    description: 'La región exterior es ilustrativa y no representa un campo de transporte calculado.'
  }
]

function ModelControls({ rotationRef, controlsRef }) {
  const { camera } = useThree()
  React.useEffect(() => {
    const zoom = (amount) => {
      camera.position.z = Math.min(5.2, Math.max(2.8, camera.position.z + amount))
      camera.lookAt(0, 0, 0)
    }
    const reset = () => {
      rotationRef.current.x = 0
      rotationRef.current.y = 0
      camera.position.set(0, 0.25, 3.8)
      camera.lookAt(0, 0, 0)
    }
    controlsRef.current = {
      reset,
      rotate: (direction) => { rotationRef.current.y += direction * 0.32 },
      drag: (deltaX, deltaY) => {
        rotationRef.current.y += deltaX * 0.008
        rotationRef.current.x += deltaY * 0.008
      },
      zoom
    }
    return () => { controlsRef.current = null }
  }, [camera, controlsRef, rotationRef])

  return null
}

function TracerParticles({ reducedMotion }) {
  const refs = React.useRef([])
  const particles = React.useMemo(
    () => Array.from({ length: 16 }, (_, index) => ({
      angle: (index / 16) * Math.PI * 2,
      radius: 0.96 + (index % 4) * 0.045,
      speed: 0.12 + (index % 3) * 0.035,
      phase: (index % 5) * 0.7
    })),
    []
  )

  useFrame(({ clock }) => {
    if (reducedMotion) return
    particles.forEach((particle, index) => {
      const mesh = refs.current[index]
      if (!mesh) return
      const angle = particle.angle + clock.elapsedTime * particle.speed
      mesh.position.set(
        Math.cos(angle) * particle.radius,
        Math.sin(angle * 1.7 + particle.phase) * 0.28,
        Math.sin(angle) * particle.radius
      )
    })
  })

  return (
    <group>
      {particles.map((particle, index) => (
        <mesh
          key={index}
          ref={(node) => { refs.current[index] = node }}
          position={[
            Math.cos(particle.angle) * particle.radius,
            Math.sin(particle.angle * 1.7 + particle.phase) * 0.28,
            Math.sin(particle.angle) * particle.radius
          ]}
        >
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color={index % 3 === 0 ? '#ffb46f' : '#59dce7'} />
        </mesh>
      ))}
    </group>
  )
}

function DropletFlameScene({ reducedMotion, selectedPart, onSelect, controlsRef }) {
  const groupRef = React.useRef(null)
  const rotationRef = React.useRef({ x: 0, y: 0 })
  const shellRef = React.useRef(null)
  const lightRef = React.useRef(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = rotationRef.current.x - (reducedMotion ? 0 : state.pointer.y * 0.08)
      groupRef.current.rotation.y = rotationRef.current.y + (reducedMotion ? 0 : state.pointer.x * 0.08)
    }
    if (shellRef.current) {
      const pulse = reducedMotion ? 1 : 1 + Math.sin(state.clock.elapsedTime * 1.7) * 0.018
      shellRef.current.scale.setScalar(pulse)
    }
    if (lightRef.current) {
      lightRef.current.intensity = reducedMotion ? 4.2 : 4.2 + Math.sin(state.clock.elapsedTime * 2) * 0.35
    }
  })

  const selectPart = (id) => {
    const part = visualParts.find((item) => item.id === id)
    if (part) onSelect(part)
  }

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 4]} intensity={1.4} color="#dcecff" />
      <pointLight ref={lightRef} position={[-1.2, 0.8, 1.6]} intensity={4.2} distance={5} color="#ff8450" />
      <group ref={groupRef}>
        <mesh
          ref={shellRef}
          onClick={(event) => {
            event.stopPropagation()
            selectPart('diffusion')
          }}
        >
          <sphereGeometry args={[1.06, 40, 32]} />
          <meshPhysicalMaterial
            color="#4fcddd"
            emissive="#1a6570"
            emissiveIntensity={0.3}
            roughness={0.24}
            metalness={0.05}
            transparent
            opacity={selectedPart === 'diffusion' ? 0.2 : 0.11}
            depthWrite={false}
          />
        </mesh>
        <mesh
          onClick={(event) => {
            event.stopPropagation()
            selectPart('reaction')
          }}
        >
          <sphereGeometry args={[0.78, 36, 28]} />
          <meshPhysicalMaterial
            color="#ff8b50"
            emissive="#b94721"
            emissiveIntensity={0.45}
            roughness={0.3}
            transparent
            opacity={selectedPart === 'reaction' ? 0.38 : 0.24}
            depthWrite={false}
          />
        </mesh>
        <mesh
          onClick={(event) => {
            event.stopPropagation()
            selectPart('droplet')
          }}
        >
          <sphereGeometry args={[0.3, 32, 24]} />
          <meshPhysicalMaterial
            color="#5bd9e5"
            emissive="#2596a5"
            emissiveIntensity={0.75}
            roughness={0.16}
            metalness={0.08}
            clearcoat={0.8}
          />
        </mesh>
        <mesh rotation={[0.48, 0, 0.32]}>
          <torusGeometry args={[1.22, 0.008, 5, 80]} />
          <meshBasicMaterial color="#f0a66c" transparent opacity={0.55} />
        </mesh>
        <mesh rotation={[1.16, 0.48, -0.2]}>
          <torusGeometry args={[1.32, 0.006, 5, 80]} />
          <meshBasicMaterial color="#39cddd" transparent opacity={0.42} />
        </mesh>
        <TracerParticles reducedMotion={reducedMotion} />
      </group>
      <ModelControls rotationRef={rotationRef} controlsRef={controlsRef} />
    </>
  )
}

export default function DashboardHeroVisual() {
  const controlsRef = React.useRef(null)
  const dragRef = React.useRef(null)
  const [selected, setSelected] = React.useState(visualParts[1])
  const [reducedMotion, setReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  return (
    <div className="dashboard-hero-model" role="group" aria-label="Modelo conceptual 3D interactivo de llama y gota en microgravedad">
      <div
        className="dashboard-hero-canvas"
        onPointerDown={(event) => {
          if (event.button !== 0) return
          dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
          if (typeof event.target.setPointerCapture === 'function') event.target.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (dragRef.current?.id !== event.pointerId) return
          controlsRef.current?.drag(event.clientX - dragRef.current.x, event.clientY - dragRef.current.y)
          dragRef.current.x = event.clientX
          dragRef.current.y = event.clientY
        }}
        onPointerUp={(event) => {
          if (dragRef.current?.id === event.pointerId) dragRef.current = null
        }}
        onPointerCancel={() => { dragRef.current = null }}
        onWheel={(event) => {
          event.preventDefault()
          controlsRef.current?.zoom(event.deltaY > 0 ? 0.22 : -0.22)
        }}
      >
        <Canvas
          camera={{ position: [0, 0.25, 3.8], fov: 40 }}
          dpr={[1, 1.25]}
          gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
          fallback={<div className="hero-webgl-fallback">WebGL no disponible · vista 3D desactivada</div>}
        >
          <DropletFlameScene
            reducedMotion={reducedMotion}
            selectedPart={selected.id}
            onSelect={setSelected}
            controlsRef={controlsRef}
          />
        </Canvas>
      </div>
      <div className="dashboard-hero-model-tools">
        <div className="hero-part-buttons" role="group" aria-label="Explorar las regiones del modelo esquemático">
          {visualParts.map((part) => (
            <button
              type="button"
              key={part.id}
              aria-pressed={selected.id === part.id}
              onClick={() => setSelected(part)}
            >
              {part.label}
            </button>
          ))}
        </div>
        <div className="hero-view-controls" role="group" aria-label="Controles de vista del modelo 3D">
          <button type="button" className="hero-reset-view" onClick={() => controlsRef.current?.rotate(-1)} aria-label="Girar el modelo a la izquierda" title="Girar a la izquierda">
            <ChevronLeft size={14} />
          </button>
          <button type="button" className="hero-reset-view" onClick={() => controlsRef.current?.zoom(-0.3)} aria-label="Acercar" title="Acercar">
            <ZoomIn size={13} />
          </button>
          <button type="button" className="hero-reset-view" onClick={() => controlsRef.current?.zoom(0.3)} aria-label="Alejar" title="Alejar">
            <ZoomOut size={13} />
          </button>
          <button type="button" className="hero-reset-view" onClick={() => controlsRef.current?.rotate(1)} aria-label="Girar el modelo a la derecha" title="Girar a la derecha">
            <ChevronRight size={14} />
          </button>
          <button type="button" className="hero-reset-view" onClick={() => controlsRef.current?.reset()} aria-label="Restablecer la vista 3D" title="Restablecer vista">
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
      <p className="hero-model-note" aria-live="polite">
        {selected.description} Arrastra o toca para girar; usa los controles de vista para acercar o alejar.
      </p>
    </div>
  )
}
