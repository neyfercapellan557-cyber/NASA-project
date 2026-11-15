import React from 'react'
import companionImage from '../assets/ignis-companion.png'

const COMPANION_SIZE = 68

function clampPosition(x, y) {
  return {
    x: Math.min(Math.max(0, x), Math.max(0, window.innerWidth - COMPANION_SIZE)),
    y: Math.min(Math.max(0, y), Math.max(0, window.innerHeight - COMPANION_SIZE))
  }
}

function getInitialPosition() {
  return clampPosition(window.innerWidth - COMPANION_SIZE - 24, 92)
}

export default function IgnisCompanion({ active, onActivate }) {
  const [position, setPosition] = React.useState(getInitialPosition)
  const [dragging, setDragging] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const pointerStart = React.useRef(null)
  const dragged = React.useRef(false)
  const suppressClick = React.useRef(false)

  React.useEffect(() => {
    const keepInViewport = () => {
      setPosition((current) => clampPosition(current.x, current.y))
    }
    window.addEventListener('resize', keepInViewport)
    return () => window.removeEventListener('resize', keepInViewport)
  }, [])

  function handlePointerDown(event) {
    if (event.button !== 0) return
    pointerStart.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: position.x,
      top: position.y
    }
    dragged.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function handlePointerMove(event) {
    const start = pointerStart.current
    if (!start || start.id !== event.pointerId) return

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (Math.hypot(deltaX, deltaY) > 5) dragged.current = true
    setPosition(clampPosition(start.left + deltaX, start.top + deltaY))
  }

  function handlePointerEnd(event) {
    if (!pointerStart.current || pointerStart.current.id !== event.pointerId) return
    suppressClick.current = dragged.current
    if (suppressClick.current) {
      window.setTimeout(() => {
        suppressClick.current = false
      }, 0)
    }
    pointerStart.current = null
    setDragging(false)
  }

  function handleClick() {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    onActivate()
  }

  const stateClass = dragging
    ? 'is-dragging'
    : active
      ? 'is-active'
      : hovered
        ? 'is-hovered'
        : 'is-idle'

  return (
    <div
      className={`ignis-companion-dock ${position.x < window.innerWidth / 2 ? 'dock-near-left' : 'dock-near-right'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <button
        type="button"
        className={`ignis-companion ${stateClass}`}
        aria-label={active ? 'IGNIS is responding. Open the AI Assistant.' : 'Open the IGNIS AI Assistant'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        <img src={companionImage} alt="" aria-hidden="true" draggable="false" />
      </button>
    </div>
  )
}
