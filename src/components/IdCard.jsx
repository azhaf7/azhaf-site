import { useCallback, useRef, useState } from 'react'
import { profile } from '../data/profile'

const REST = { x: 8, y: -8 }
const MAX = 22

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default function IdCard() {
  const rootRef = useRef(null)
  const dragRef = useRef(null)
  const [tilt, setTilt] = useState(REST)
  const [dragging, setDragging] = useState(false)

  const onPointerDown = useCallback((event) => {
    if (event.button !== 0) return
    const root = rootRef.current
    if (!root) return
    root.setPointerCapture(event.pointerId)
    dragRef.current = { x: event.clientX, y: event.clientY, tilt: { ...tilt } }
    setDragging(true)
  }, [tilt])

  const onPointerMove = useCallback((event) => {
    const start = dragRef.current
    if (!start) return
    const dx = (event.clientX - start.x) / 8
    const dy = (event.clientY - start.y) / 10
    setTilt({
      x: clamp(start.tilt.x - dy, -MAX, MAX),
      y: clamp(start.tilt.y + dx, -MAX, MAX),
    })
  }, [])

  const endDrag = useCallback((event) => {
    if (!dragRef.current) return
    const root = rootRef.current
    if (root?.hasPointerCapture(event.pointerId)) {
      root.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
    setDragging(false)
    setTilt(REST)
  }, [])

  return (
    <section className="pass" aria-labelledby="pass-name">
      <div
        ref={rootRef}
        className={`pass__rig${dragging ? ' pass__rig--drag' : ''}`}
        style={{
          '--tilt-x': `${tilt.x}deg`,
          '--tilt-y': `${tilt.y}deg`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="pass__hook" aria-hidden="true" />
        <span className="pass__strap" aria-hidden="true" />
        <span className="pass__clip" aria-hidden="true" />
        <div className="pass__card">
          <div className="pass__face">
            <p className="pass__kicker">{profile.availability}</p>
            <h1 id="pass-name" className="pass__name">
              {profile.name}
            </h1>
            <p className="pass__role">{profile.role}</p>
            <p className="pass__place">{profile.location}</p>
            <p className="pass__intro">{profile.intro}</p>
            <p className="pass__hint">Drag the card</p>
          </div>
        </div>
      </div>
    </section>
  )
}
